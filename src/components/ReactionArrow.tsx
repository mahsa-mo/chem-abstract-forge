import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 3D Scientific Molecular Reaction Pathway Connector
 *
 * A genuine 3D WebGL scientific structure bridging the Reactant specification
 * to the Graphical Abstract output:
 * - 3D Molecular Precursor Nodes (Teal & Cobalt atoms)
 * - 3D Reaction Coordinate Pathway with potential energy surface curvature
 * - 3D Activated Transition State Complex [TS]‡ with rotating quantum orbital rings
 * - 3D Flowing kinetic photon particle pulse traveling across the molecular bond
 * - Interactive pointer tilt giving true 3D spatial depth
 * - Responsive vertical dimensional fallback for mobile viewports
 */

export function ReactionArrow() {
  return (
    <>
      <HorizontalThreeConnector />
      <VerticalDimensionalConnector />
    </>
  );
}

function HorizontalThreeConnector() {
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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      50,
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x0d9488, 1.8); // Teal key
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const sparkLight = new THREE.DirectionalLight(0xf59e0b, 1.6); // Amber reaction spark
    sparkLight.position.set(0, -3, 4);
    scene.add(sparkLight);

    const blueLight = new THREE.DirectionalLight(0x2563eb, 1.4); // Cobalt product rim
    blueLight.position.set(-5, 3, -3);
    scene.add(blueLight);

    // 3. Materials
    const atomTealMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      roughness: 0.18,
      metalness: 0.25,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    });

    const atomAmberMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.15,
      metalness: 0.3,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      clearcoat: 0.9,
    });

    const atomCobaltMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.25,
      clearcoat: 0.8,
    });

    const bondMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.4,
    });

    const conduitGroup = new THREE.Group();
    scene.add(conduitGroup);

    // 4. Geometry Elements
    // Reactant Cluster (Left side: x ≈ -2.2)
    const sphereSmallGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMedGeo = new THREE.SphereGeometry(0.26, 20, 20);
    const sphereLargeGeo = new THREE.SphereGeometry(0.34, 24, 24);

    const rAtom1 = new THREE.Mesh(sphereMedGeo, atomTealMat);
    rAtom1.position.set(-2.2, -0.4, 0.2);
    conduitGroup.add(rAtom1);

    const rAtom2 = new THREE.Mesh(sphereSmallGeo, atomTealMat);
    rAtom2.position.set(-2.6, 0.3, -0.1);
    conduitGroup.add(rAtom2);

    // Reactant bond
    const rBondGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
    const rBond = new THREE.Mesh(rBondGeo, bondMat);
    rBond.position.set(-2.4, -0.05, 0.05);
    rBond.rotation.z = Math.PI / 4;
    conduitGroup.add(rBond);

    // Central Transition State Complex [TS]‡ (x ≈ 0, elevated at energy peak y ≈ 0.4)
    const tsGroup = new THREE.Group();
    tsGroup.position.set(0, 0.35, 0.1);
    conduitGroup.add(tsGroup);

    const tsAtom = new THREE.Mesh(sphereLargeGeo, atomAmberMat);
    tsGroup.add(tsAtom);

    // Orbiting electron rings around [TS]‡
    const torusGeo1 = new THREE.TorusGeometry(0.55, 0.02, 8, 36);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(torusGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    tsGroup.add(ring1);

    const torusGeo2 = new THREE.TorusGeometry(0.68, 0.015, 8, 36);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(torusGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    tsGroup.add(ring2);

    // Product Vector Cluster (Right side: x ≈ 2.2)
    const pAtom1 = new THREE.Mesh(sphereMedGeo, atomCobaltMat);
    pAtom1.position.set(2.2, 0.1, 0.1);
    conduitGroup.add(pAtom1);

    const pAtom2 = new THREE.Mesh(sphereSmallGeo, atomCobaltMat);
    pAtom2.position.set(2.6, -0.5, -0.2);
    conduitGroup.add(pAtom2);

    // Product bond
    const pBondGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12);
    const pBond = new THREE.Mesh(pBondGeo, bondMat);
    pBond.position.set(2.4, -0.2, -0.05);
    pBond.rotation.z = -Math.PI / 4;
    conduitGroup.add(pBond);

    // Curving Molecular Pathway Conduit (Catmull-Rom spline from Reactant to Product)
    const splinePoints = [
      new THREE.Vector3(-2.2, -0.4, 0.2),
      new THREE.Vector3(-1.1, 0.15, 0.3),
      new THREE.Vector3(0, 0.35, 0.1),
      new THREE.Vector3(1.1, 0.25, 0.2),
      new THREE.Vector3(2.2, 0.1, 0.1),
    ];
    const curve = new THREE.CatmullRomCurve3(splinePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.035, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    conduitGroup.add(tube);

    // Flowing Quantum Energy Particles along the reaction spline
    const particleCount = 20;
    const particleGeos = new THREE.SphereGeometry(0.06, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const particleMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pm = new THREE.Mesh(particleGeos, particleMat);
      conduitGroup.add(pm);
      particleMeshes.push(pm);
    }

    // Interactive pointer parallax
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 0.45;
      targetRotX = -ny * 0.35;
    };

    const handleMouseLeave = () => {
      targetRotY = 0;
      targetRotX = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Resize observer
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
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth camera/group tilt
        currentRotY += (targetRotY - currentRotY) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.08;

        conduitGroup.rotation.y = currentRotY + Math.sin(elapsed * 0.8) * 0.05;
        conduitGroup.rotation.x = currentRotX + Math.cos(elapsed * 0.6) * 0.04;

        // Rotate TS electron rings
        ring1.rotation.z = elapsed * 1.5;
        ring2.rotation.x = elapsed * 1.2;

        // Flow particles along the reaction curve
        particleMeshes.forEach((mesh, idx) => {
          const t = (elapsed * 0.35 + idx / particleCount) % 1;
          const pos = curve.getPointAt(t);
          mesh.position.copy(pos);
          mesh.scale.setScalar(Math.sin(t * Math.PI) * 0.8 + 0.5);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();

      // Dispose Three.js resources
      sphereSmallGeo.dispose();
      sphereMedGeo.dispose();
      sphereLargeGeo.dispose();
      rBondGeo.dispose();
      pBondGeo.dispose();
      torusGeo1.dispose();
      torusGeo2.dispose();
      tubeGeo.dispose();
      particleGeos.dispose();

      atomTealMat.dispose();
      atomAmberMat.dispose();
      atomCobaltMat.dispose();
      bondMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      tubeMat.dispose();
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
      className="relative hidden shrink-0 self-center lg:flex lg:flex-col lg:items-center lg:justify-center lg:w-28 xl:w-32 py-2 select-none group"
    >
      {/* 3D WebGL Viewport Container */}
      <div
        ref={containerRef}
        className="h-28 w-full cursor-grab active:cursor-grabbing relative overflow-visible"
        title="3D Reaction Coordinate Conduit: Reactants [TS]‡ → Products"
      />

      {/* Floating Scientific Transition Notation */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase select-none -mt-1">
        <span className="text-accent-strong">R</span>
        <span className="text-spark font-bold">[TS]‡</span>
        <span className="text-primary font-bold">→</span>
        <span className="text-primary">P</span>
      </div>

      {!hasWebGL && <div className="text-[10px] font-mono text-muted-foreground">R → P</div>}
    </div>
  );
}

function VerticalDimensionalConnector() {
  return (
    <div
      aria-hidden
      className="relative flex flex-col items-center justify-center lg:hidden select-none my-2 py-1"
    >
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs font-mono">
        <span className="size-2 rounded-full bg-accent-strong" />
        <span className="text-accent-strong font-medium text-[11px]">Reactants</span>
        <span className="text-spark font-bold text-[11px]">[TS]‡</span>
        <span className="text-muted-foreground">↓</span>
        <span className="text-primary font-bold text-[11px]">Graphical Abstract</span>
      </div>
    </div>
  );
}
