import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Genuine 3D Spatial Scientific Environment
 *
 * Replaces the old single giant molecule with a distributed, dimensional scientific
 * universe based on the original animated chemical background clusters:
 * - Cluster A (upper-left): Fused bicyclic aromatic framework with substituents
 * - Cluster B (upper-right): Single aromatic ring with orbital coordination
 * - Cluster C (lower-right): Fused heterocyclic ring system with energy spark atoms
 * - Cluster D (lower-left): Heteroaromatic geometry with ligand branches
 * - Polyhedral coordination geometry: Octahedral & tetrahedral catalyst coordination cages
 * - Spatial lattice particles: Floating in deep z-space with depth-of-field perspective
 *
 * The central workspace area is kept intentionally airy and open to ensure 100%
 * pristine legibility and focus on the chemical transformation workflow.
 */

interface AtomNode {
  pos: [number, number, number];
  color: number;
  radius: number;
  symbol?: string;
}

interface BondSegment {
  start: number;
  end: number;
  double?: boolean;
}

interface MolecularAssembly {
  center: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  atoms: AtomNode[];
  bonds: BondSegment[];
  speed: number;
  axis: THREE.Vector3;
}

// Helper to construct a regular 6-membered aromatic ring with substituents in 3D
function createRingAssembly(
  center: [number, number, number],
  radius: number,
  colors: { ring1: number; ring2?: number; branch?: number },
  hasFused: boolean = false,
  rotation: [number, number, number] = [0, 0, 0],
  scale: number = 1.0,
  speed: number = 0.08,
): MolecularAssembly {
  const atoms: AtomNode[] = [];
  const bonds: BondSegment[] = [];

  // Primary 6-membered ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = Math.sin(angle * 2) * radius * 0.15; // subtle 3D boat/chair puckering
    atoms.push({
      pos: [x, y, z],
      color: i % 2 === 0 ? colors.ring1 : (colors.ring2 ?? colors.ring1),
      radius: 0.15,
    });
  }

  // Ring bonds with alternating double bonds
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    bonds.push({
      start: i,
      end: next,
      double: i % 2 === 0,
    });
  }

  // Fused second ring if requested
  if (hasFused) {
    const fusedStartIdx = atoms.length;
    // Shared bond is between atom 1 and 2
    // Generate 4 additional vertices to complete the fused bicycle
    const baseAngle = Math.PI / 3;
    for (let j = 1; j <= 4; j++) {
      const angle = baseAngle + (j * Math.PI) / 3;
      const x = atoms[1].pos[0] + Math.cos(angle) * radius;
      const y = atoms[1].pos[1] + Math.sin(angle) * radius;
      const z = Math.cos(angle * 2) * radius * 0.18;
      atoms.push({
        pos: [x, y, z],
        color: colors.ring2 ?? colors.ring1,
        radius: 0.14,
      });
    }

    // Connect fused ring: atom 1 -> fusedStartIdx -> ... -> fusedStartIdx+3 -> atom 2
    bonds.push({ start: 1, end: fusedStartIdx });
    bonds.push({ start: fusedStartIdx, end: fusedStartIdx + 1, double: true });
    bonds.push({ start: fusedStartIdx + 1, end: fusedStartIdx + 2 });
    bonds.push({ start: fusedStartIdx + 2, end: fusedStartIdx + 3, double: true });
    bonds.push({ start: fusedStartIdx + 3, end: 2 });
  }

  // Add substituent branch
  const branchIdx = atoms.length;
  atoms.push({
    pos: [atoms[0].pos[0] * 1.7, atoms[0].pos[1] * 1.7 + 0.3, atoms[0].pos[2] + 0.25],
    color: colors.branch ?? 0xd97706,
    radius: 0.17,
  });
  bonds.push({ start: 0, end: branchIdx });

  return {
    center,
    rotation,
    scale,
    atoms,
    bonds,
    speed,
    axis: new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    ).normalize(),
  };
}

export function MolecularCanvas3D({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvasTest = document.createElement("canvas");
      const gl = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key light (Cobalt tint)
    const keyLight = new THREE.DirectionalLight(0x3b82f6, 1.4);
    keyLight.position.set(8, 10, 10);
    scene.add(keyLight);

    // Fill light (Mineral Teal tint)
    const fillLight = new THREE.DirectionalLight(0x0d9488, 1.1);
    fillLight.position.set(-10, -6, 6);
    scene.add(fillLight);

    // Rim light (Reaction Amber spark tint)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.9);
    rimLight.position.set(2, -10, -8);
    scene.add(rimLight);

    // Geometry & Material caches
    const sphereGeoCache = new Map<number, THREE.SphereGeometry>();
    const getSphereGeo = (r: number) => {
      const key = Math.round(r * 100);
      if (!sphereGeoCache.has(key)) {
        sphereGeoCache.set(key, new THREE.SphereGeometry(r, 20, 16));
      }
      return sphereGeoCache.get(key)!;
    };

    const materialCache = new Map<number, THREE.MeshPhysicalMaterial>();
    const getMaterial = (color: number, opacity: number = 0.85) => {
      const key = color * 100 + Math.round(opacity * 10);
      if (!materialCache.has(key)) {
        materialCache.set(
          key,
          new THREE.MeshPhysicalMaterial({
            color,
            roughness: 0.25,
            metalness: 0.15,
            clearcoat: 0.6,
            clearcoatRoughness: 0.15,
            transmission: 0.1,
            transparent: opacity < 1,
            opacity,
          }),
        );
      }
      return materialCache.get(key)!;
    };

    const bondMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.75,
    });

    // Parent root group for parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. DISTRIBUTED MOLECULAR ASSEMBLIES (Positioned at peripheral depths)
    // Multi-Color Palette: Indigo (0x4F46E5), Cyan (0x06B6D4), Emerald (0x10B981), Amber (0xF59E0B), Magenta (0xEC4899), Violet (0x7C3AED)
    const assemblies: MolecularAssembly[] = [
      // Cluster A: Upper-Left peripheral depth - Fused bicycle (Cyan & Indigo with Magenta branch)
      createRingAssembly(
        [-6.5, 3.8, -4],
        1.1,
        { ring1: 0x06b6d4, ring2: 0x4f46e5, branch: 0xec4899 },
        true,
        [0.3, 0.4, 0.1],
        1.05,
        0.06,
      ),
      // Cluster B: Upper-Right peripheral depth - Single aromatic ring (Emerald & Cyan with Amber branch)
      createRingAssembly(
        [6.8, 4.0, -5],
        1.0,
        { ring1: 0x10b981, ring2: 0x06b6d4, branch: 0xf59e0b },
        false,
        [-0.2, 0.5, 0.3],
        1.0,
        0.05,
      ),
      // Cluster C: Lower-Right peripheral depth - Fused heterocyclic ring (Solar Amber & Vivid Magenta with Violet branch)
      createRingAssembly(
        [6.4, -3.8, -3.5],
        0.95,
        { ring1: 0xf59e0b, ring2: 0xec4899, branch: 0x7c3aed },
        true,
        [0.4, -0.3, 0.2],
        1.1,
        0.07,
      ),
      // Cluster D: Lower-Left peripheral depth - Aromatic ring (Magenta & Emerald with Cyan branch)
      createRingAssembly(
        [-6.8, -3.6, -4.5],
        0.9,
        { ring1: 0xec4899, ring2: 0x10b981, branch: 0x06b6d4 },
        false,
        [-0.3, -0.4, 0.5],
        0.95,
        0.06,
      ),
    ];

    const assemblyGroups: { group: THREE.Group; assembly: MolecularAssembly }[] = [];

    assemblies.forEach((assembly) => {
      const group = new THREE.Group();
      group.position.set(...assembly.center);
      group.rotation.set(...assembly.rotation);
      group.scale.setScalar(assembly.scale);

      // Add atoms
      assembly.atoms.forEach((atom) => {
        const geo = getSphereGeo(atom.radius);
        const mat = getMaterial(atom.color, 0.9);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.pos);
        group.add(mesh);
      });

      // Add bond cylinders
      assembly.bonds.forEach((bond) => {
        const start = new THREE.Vector3(...assembly.atoms[bond.start].pos);
        const end = new THREE.Vector3(...assembly.atoms[bond.end].pos);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        if (bond.double) {
          const offsetAxis = new THREE.Vector3(0, 0, 0.05);
          [-1, 1].forEach((sign) => {
            const cylinderGeo = new THREE.CylinderGeometry(0.025, 0.025, length, 10);
            const cylinder = new THREE.Mesh(cylinderGeo, bondMaterial);
            cylinder.position.copy(midpoint.clone().addScaledVector(offsetAxis, sign));
            const up = new THREE.Vector3(0, 1, 0);
            cylinder.setRotationFromQuaternion(
              new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize()),
            );
            group.add(cylinder);
          });
        } else {
          const cylinderGeo = new THREE.CylinderGeometry(0.035, 0.035, length, 12);
          const cylinder = new THREE.Mesh(cylinderGeo, bondMaterial);
          cylinder.position.copy(midpoint);
          const up = new THREE.Vector3(0, 1, 0);
          cylinder.setRotationFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize()),
          );
          group.add(cylinder);
        }
      });

      worldGroup.add(group);
      assemblyGroups.push({ group, assembly });
    });

    // 2. DIMENSIONAL COORDINATION POLYHEDRA (Octahedral & Tetrahedral cages in the far background)
    const polyhedraGroup = new THREE.Group();
    worldGroup.add(polyhedraGroup);

    // Octahedral coordination sphere (Catalyst intermediate geometry, far-left background)
    const octaGeo = new THREE.OctahedronGeometry(1.6, 0);
    const octaWireGeo = new THREE.WireframeGeometry(octaGeo);
    const octaWireMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.28,
    });
    const octaLine = new THREE.LineSegments(octaWireGeo, octaWireMat);
    octaLine.position.set(-8.5, 0.5, -8);
    polyhedraGroup.add(octaLine);

    // Central metal atom in octahedral coordination
    const metalAtom = new THREE.Mesh(getSphereGeo(0.28), getMaterial(0x0ea5e9, 0.75));
    metalAtom.position.set(-8.5, 0.5, -8);
    polyhedraGroup.add(metalAtom);

    // Tetrahedral coordination cage (Far-right background)
    const tetraGeo = new THREE.TetrahedronGeometry(1.8, 0);
    const tetraWireGeo = new THREE.WireframeGeometry(tetraGeo);
    const tetraWireMat = new THREE.LineBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.24,
    });
    const tetraLine = new THREE.LineSegments(tetraWireGeo, tetraWireMat);
    tetraLine.position.set(8.8, -0.8, -9);
    polyhedraGroup.add(tetraLine);

    // 3. SPATIAL CRYSTAL LATTICE & ELEMENT PARTICLES (Scattered subtly across depth)
    const particleCount = 75;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const paletteColors = [
      new THREE.Color(0x4f46e5), // Indigo
      new THREE.Color(0x06b6d4), // Laser Cyan
      new THREE.Color(0x10b981), // Emerald Green
      new THREE.Color(0xf59e0b), // Solar Amber
      new THREE.Color(0xec4899), // Vivid Magenta
      new THREE.Color(0x7c3aed), // Violet
    ];

    for (let i = 0; i < particleCount; i++) {
      // Exclude the central screen area (|x| < 3.5 and |y| < 3.5)
      let x = (Math.random() - 0.5) * 26;
      if (Math.abs(x) < 4) x = (Math.sign(x) || 1) * (4 + Math.random() * 8);

      const y = (Math.random() - 0.5) * 18;
      const z = -2 - Math.random() * 12;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = paletteColors[i % paletteColors.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // Pointer parallax handling
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetParallaxX = nx * 0.45;
      targetParallaxY = -ny * 0.35;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth camera parallax
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;

        camera.position.x = currentParallaxX;
        camera.position.y = currentParallaxY;
        camera.lookAt(0, 0, -5);

        // Slow independent orbital rotation for each molecular assembly
        assemblyGroups.forEach(({ group, assembly }, idx) => {
          group.rotateOnAxis(assembly.axis, delta * assembly.speed);
          // Subtle floating bob
          group.position.y = assembly.center[1] + Math.sin(elapsed * 0.4 + idx * 1.5) * 0.18;
          group.position.x = assembly.center[0] + Math.cos(elapsed * 0.3 + idx * 1.2) * 0.12;
        });

        // Rotate polyhedral coordination wireframes
        octaLine.rotation.y = elapsed * 0.08;
        octaLine.rotation.x = elapsed * 0.05;
        tetraLine.rotation.y = -elapsed * 0.07;
        tetraLine.rotation.z = elapsed * 0.06;

        // Subtle drift of particle field
        particles.rotation.y = elapsed * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Context loss handlers
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
    };
    const handleContextRestored = () => {
      animate();
    };

    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);

      // Clean up resources
      scene.clear();
      sphereGeoCache.forEach((g) => g.dispose());
      materialCache.forEach((m) => m.dispose());
      bondMaterial.dispose();
      octaGeo.dispose();
      octaWireGeo.dispose();
      octaWireMat.dispose();
      tetraGeo.dispose();
      tetraWireGeo.dispose();
      tetraWireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none opacity-55 dark:opacity-40 transition-opacity duration-1000 ${className}`}
    >
      {!hasWebGL && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--accent-strong)_0%,transparent_60%)] opacity-30" />
      )}
    </div>
  );
}
