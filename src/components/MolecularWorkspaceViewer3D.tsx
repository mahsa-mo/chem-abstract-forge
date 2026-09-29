import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Eye, Sparkles, Layers, Box, Atom } from "lucide-react";

export type RenderMode = "ball-stick" | "space-fill" | "wireframe";

interface MoleculeDef {
  name: string;
  formula: string;
  category: string;
  atoms: {
    pos: [number, number, number];
    element: string;
    color: number;
    radius: number;
    hybridization: string;
    charge: string;
  }[];
  bonds: {
    start: number;
    end: number;
    order: number;
  }[];
}

const PRESET_MOLECULES: MoleculeDef[] = [
  {
    name: "Suzuki-Miyaura Organometallic Complex",
    formula: "Pd(PPh₃)₂(Ar)Br",
    category: "Catalytic Intermediate",
    atoms: [
      {
        pos: [0, 0, 0],
        element: "Pd",
        color: 0x0ea5e9,
        radius: 0.55,
        hybridization: "d⁸ square planar",
        charge: "+2.0",
      },
      {
        pos: [1.8, 0, 0],
        element: "Br",
        color: 0x9333ea,
        radius: 0.48,
        hybridization: "terminal",
        charge: "-0.82",
      },
      {
        pos: [0, 1.9, 0],
        element: "P",
        color: 0xd97706,
        radius: 0.44,
        hybridization: "sp³",
        charge: "+0.31",
      },
      {
        pos: [0, -1.9, 0],
        element: "P",
        color: 0xd97706,
        radius: 0.44,
        hybridization: "sp³",
        charge: "+0.31",
      },
      {
        pos: [-1.9, 0, 0],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp²",
        charge: "+0.15",
      },
      // Aryl ring
      {
        pos: [-2.8, 1.0, 0],
        element: "C",
        color: 0x334155,
        radius: 0.36,
        hybridization: "sp²",
        charge: "-0.08",
      },
      {
        pos: [-4.1, 0.7, 0],
        element: "C",
        color: 0x334155,
        radius: 0.36,
        hybridization: "sp²",
        charge: "-0.06",
      },
      {
        pos: [-4.6, -0.6, 0],
        element: "C",
        color: 0x334155,
        radius: 0.36,
        hybridization: "sp²",
        charge: "+0.04",
      },
      {
        pos: [-3.8, -1.6, 0],
        element: "C",
        color: 0x334155,
        radius: 0.36,
        hybridization: "sp²",
        charge: "-0.06",
      },
      {
        pos: [-2.5, -1.3, 0],
        element: "C",
        color: 0x334155,
        radius: 0.36,
        hybridization: "sp²",
        charge: "-0.08",
      },
      // Fluorine / Oxygen substituent
      {
        pos: [-5.9, -0.9, 0],
        element: "O",
        color: 0xe11d48,
        radius: 0.35,
        hybridization: "sp²",
        charge: "-0.45",
      },
      // Hydrogens
      {
        pos: [-2.4, 2.0, 0],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.09",
      },
      {
        pos: [-4.7, 1.5, 0],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.08",
      },
      {
        pos: [-4.2, -2.6, 0],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.08",
      },
      {
        pos: [-1.9, -2.1, 0],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.09",
      },
    ],
    bonds: [
      { start: 0, end: 1, order: 1 },
      { start: 0, end: 2, order: 1 },
      { start: 0, end: 3, order: 1 },
      { start: 0, end: 4, order: 1 },
      { start: 4, end: 5, order: 2 },
      { start: 5, end: 6, order: 1 },
      { start: 6, end: 7, order: 2 },
      { start: 7, end: 8, order: 1 },
      { start: 8, end: 9, order: 2 },
      { start: 9, end: 4, order: 1 },
      { start: 7, end: 10, order: 1 },
      { start: 5, end: 11, order: 1 },
      { start: 6, end: 12, order: 1 },
      { start: 8, end: 13, order: 1 },
      { start: 9, end: 14, order: 1 },
    ],
  },
  {
    name: "Enantioselective L-Proline Organocatalyst",
    formula: "C₅H₉NO₂",
    category: "Chiral Catalyst",
    atoms: [
      {
        pos: [0, 0, 0],
        element: "N",
        color: 0x2563eb,
        radius: 0.38,
        hybridization: "sp³",
        charge: "-0.32",
      },
      {
        pos: [1.2, 0.7, 0],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp³",
        charge: "+0.18",
      },
      {
        pos: [2.1, -0.4, 0.4],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp³",
        charge: "-0.05",
      },
      {
        pos: [1.3, -1.6, -0.2],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp³",
        charge: "-0.04",
      },
      {
        pos: [-0.1, -1.2, 0.2],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp³",
        charge: "+0.06",
      },
      // Carboxylic acid moiety
      {
        pos: [1.6, 2.1, -0.2],
        element: "C",
        color: 0x334155,
        radius: 0.38,
        hybridization: "sp²",
        charge: "+0.54",
      },
      {
        pos: [2.7, 2.5, -0.5],
        element: "O",
        color: 0xe11d48,
        radius: 0.35,
        hybridization: "sp²",
        charge: "-0.52",
      },
      {
        pos: [0.6, 2.9, 0.1],
        element: "O",
        color: 0xe11d48,
        radius: 0.35,
        hybridization: "sp³",
        charge: "-0.48",
      },
      {
        pos: [0.8, 3.8, 0.1],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.32",
      },
      // Ring Hydrogens
      {
        pos: [-0.3, 0.5, -0.8],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.21",
      },
      {
        pos: [1.2, 0.9, 1.0],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.07",
      },
      {
        pos: [3.1, -0.2, 0.1],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.06",
      },
      {
        pos: [1.6, -2.5, 0.1],
        element: "H",
        color: 0xf8fafc,
        radius: 0.22,
        hybridization: "1s",
        charge: "+0.06",
      },
    ],
    bonds: [
      { start: 0, end: 1, order: 1 },
      { start: 1, end: 2, order: 1 },
      { start: 2, end: 3, order: 1 },
      { start: 3, end: 4, order: 1 },
      { start: 4, end: 0, order: 1 },
      { start: 1, end: 5, order: 1 },
      { start: 5, end: 6, order: 2 },
      { start: 5, end: 7, order: 1 },
      { start: 7, end: 8, order: 1 },
      { start: 0, end: 9, order: 1 },
      { start: 1, end: 10, order: 1 },
      { start: 2, end: 11, order: 1 },
      { start: 3, end: 12, order: 1 },
    ],
  },
];

interface Props {
  isGenerating?: boolean;
  className?: string;
  onProbeElement?: (elem: string) => void;
}

export function MolecularWorkspaceViewer3D({
  isGenerating = false,
  className = "",
  onProbeElement,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMolIndex, setActiveMolIndex] = useState(0);
  const [renderMode, setRenderMode] = useState<RenderMode>("ball-stick");
  const [hoveredAtom, setHoveredAtom] = useState<MoleculeDef["atoms"][0] | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const molGroupRef = useRef<THREE.Group | null>(null);
  const energyPulsesRef = useRef<THREE.Points | null>(null);

  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const rotVelocity = useRef({ x: 0, y: 0 });

  const activeMolecule = PRESET_MOLECULES[activeMolIndex]!;

  // Build 3D mesh representation of current molecule & render mode
  const buildMoleculeMeshes = useCallback(
    (group: THREE.Group, mol: MoleculeDef, mode: RenderMode) => {
      // Clear previous children
      while (group.children.length > 0) {
        const obj = group.children[0]!;
        group.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      }

      const sphereSegs = mode === "wireframe" ? 14 : 28;

      // Atoms
      mol.atoms.forEach((atom, idx) => {
        const radius = mode === "space-fill" ? atom.radius * 2.2 : atom.radius;
        const geo = new THREE.SphereGeometry(radius, sphereSegs, sphereSegs);

        let mat: THREE.Material;
        if (mode === "wireframe") {
          mat = new THREE.MeshBasicMaterial({
            color: atom.color,
            wireframe: true,
            transparent: true,
            opacity: 0.65,
          });
        } else {
          mat = new THREE.MeshPhysicalMaterial({
            color: atom.color,
            roughness: 0.22,
            metalness: 0.12,
            clearcoat: 0.55,
            clearcoatRoughness: 0.18,
          });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.pos);
        mesh.userData = { atomIndex: idx, atomData: atom };
        group.add(mesh);
      });

      // Bonds (only in ball-stick & wireframe modes)
      if (mode !== "space-fill") {
        const bondMat = new THREE.MeshStandardMaterial({
          color: mode === "wireframe" ? 0x64748b : 0x94a3b8,
          roughness: 0.35,
          metalness: 0.2,
          wireframe: mode === "wireframe",
        });

        mol.bonds.forEach((bond) => {
          const start = new THREE.Vector3(...mol.atoms[bond.start]!.pos);
          const end = new THREE.Vector3(...mol.atoms[bond.end]!.pos);
          const direction = new THREE.Vector3().subVectors(end, start);
          const length = direction.length();
          const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

          if (bond.order === 2) {
            // Double bond
            const offset = 0.085;
            [-1, 1].forEach((sign) => {
              const geo = new THREE.CylinderGeometry(0.045, 0.045, length, 12);
              const mesh = new THREE.Mesh(geo, bondMat);
              const pos = midpoint.clone().add(new THREE.Vector3(0, 0, sign * offset));
              mesh.position.copy(pos);

              const up = new THREE.Vector3(0, 1, 0);
              const q = new THREE.Quaternion().setFromUnitVectors(
                up,
                direction.clone().normalize(),
              );
              mesh.setRotationFromQuaternion(q);
              group.add(mesh);
            });
          } else {
            // Single bond
            const geo = new THREE.CylinderGeometry(0.07, 0.07, length, 14);
            const mesh = new THREE.Mesh(geo, bondMat);
            mesh.position.copy(midpoint);

            const up = new THREE.Vector3(0, 1, 0);
            const q = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
            mesh.setRotationFromQuaternion(q);
            group.add(mesh);
          }
        });
      }
    },
    [],
  );

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      50,
    );
    camera.position.set(0, 0, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(5, 7, 6);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x0d9488, 0.7);
    dir2.position.set(-6, -4, 4);
    scene.add(dir2);

    const rim = new THREE.DirectionalLight(0x6366f1, 0.9);
    rim.position.set(0, 6, -6);
    scene.add(rim);

    // Molecular group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    molGroupRef.current = molGroup;

    buildMoleculeMeshes(molGroup, activeMolecule, renderMode);

    // Energy pulses during reaction generation
    const particleCount = 60;
    const pulsePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pulsePositions[i * 3] = (Math.random() - 0.5) * 6;
      pulsePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pulsePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0xf97316, // Apricot Reaction Spark
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const energyPulses = new THREE.Points(pulseGeo, pulseMat);
    energyPulses.visible = false;
    scene.add(energyPulses);
    energyPulsesRef.current = energyPulses;

    // Raycaster for atom hover interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const deltaX = e.clientX - prevPointer.current.x;
        const deltaY = e.clientY - prevPointer.current.y;
        molGroup.rotation.y += deltaX * 0.009;
        molGroup.rotation.x += deltaY * 0.009;
        rotVelocity.current = { x: deltaX * 0.009, y: deltaY * 0.009 };
        prevPointer.current = { x: e.clientX, y: e.clientY };
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(molGroup.children, true);
        const atomHit = intersects.find((hit) => hit.object.userData?.['atomData']);
        if (atomHit) {
          const data = atomHit.object.userData['atomData'] as MoleculeDef["atoms"][0];
          setHoveredAtom(data);
          onProbeElement?.(data.element);
        } else {
          setHoveredAtom(null);
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      rotVelocity.current = { x: 0, y: 0 };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Resize observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    ro.observe(container);

    // Animation loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Inertia after drag or autonomous rotate
      if (!isDragging.current) {
        if (autoRotate) {
          molGroup.rotation.y += (0.28 + (isGenerating ? 0.8 : 0)) * delta;
          molGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.12;
        } else {
          molGroup.rotation.y += rotVelocity.current.x;
          molGroup.rotation.x += rotVelocity.current.y;
          rotVelocity.current.x *= 0.92;
          rotVelocity.current.y *= 0.92;
        }
      }

      // Energy particles animation when generating
      if (energyPulsesRef.current && isGenerating) {
        energyPulsesRef.current.visible = true;
        energyPulsesRef.current.rotation.y = elapsed * 1.4;
        energyPulsesRef.current.rotation.z = elapsed * 0.9;
        const scale = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
        molGroup.scale.set(scale, scale, scale);
      } else if (energyPulsesRef.current) {
        energyPulsesRef.current.visible = false;
        molGroup.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      ro.disconnect();

      scene.clear();
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [buildMoleculeMeshes, activeMolecule, renderMode, isGenerating, autoRotate, onProbeElement]);

  // Handle Molecule or RenderMode change
  const handleSelectMolecule = (index: number) => {
    setActiveMolIndex(index);
    if (molGroupRef.current) {
      buildMoleculeMeshes(molGroupRef.current, PRESET_MOLECULES[index]!, renderMode);
    }
  };

  const handleSelectRenderMode = (mode: RenderMode) => {
    setRenderMode(mode);
    if (molGroupRef.current) {
      buildMoleculeMeshes(molGroupRef.current, activeMolecule, mode);
    }
  };

  const handleResetCamera = () => {
    if (molGroupRef.current) {
      molGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden border border-border/80 bg-card/60 backdrop-blur-sm select-none ${className}`}
    >
      {/* 3D Canvas Stage */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {/* HUD: Active Chemical Title & Formula */}
        <div className="absolute top-3 left-3 z-10 pointer-events-auto flex flex-col gap-0.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/70 shadow-sm text-left">
          <div className="flex items-center gap-1.5 text-xs text-accent-strong font-medium">
            <Atom className="size-3.5" aria-hidden />
            <span>{activeMolecule.category}</span>
          </div>
          <p className="text-sm font-semibold text-foreground tracking-tight">
            {activeMolecule.name}
          </p>
          <p className="text-xs font-mono text-muted-foreground">{activeMolecule.formula}</p>
        </div>

        {/* HUD: Atom Inspection Probe */}
        {hoveredAtom && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none flex flex-col gap-0.5 bg-card/90 backdrop-blur-md px-3 py-2 rounded-lg border border-accent-strong/40 shadow-md text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-foreground">
                {hoveredAtom.element}
              </span>
              <span className="text-muted-foreground font-mono">
                hybrid: {hoveredAtom.hybridization}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              charge: <span className="font-mono text-foreground">{hoveredAtom.charge} e</span>
            </div>
          </div>
        )}

        {/* Generation Reaction Stage Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 border border-spark/50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
              <Sparkles
                className="size-4 text-spark animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Reaction Coordinate Simulation</p>
                <p className="text-muted-foreground font-mono">
                  Transition State Energetics Active
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Helper Indicator */}
        <div className="absolute bottom-2.5 left-3 text-[11px] text-muted-foreground font-mono pointer-events-none flex items-center gap-2">
          <span>Click & drag to rotate 3D geometry</span>
        </div>
      </div>

      {/* Control Bar: Representation Switcher & Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-secondary/50 border-t border-border/80 text-xs">
        {/* Molecule Preset Switcher */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground font-mono text-[11px] me-1 hidden sm:inline">
            Model:
          </span>
          {PRESET_MOLECULES.map((mol, idx) => (
            <button
              key={mol.name}
              onClick={() => handleSelectMolecule(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMolIndex === idx
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              {idx === 0 ? "Palladium Intermediate" : "Chiral Proline"}
            </button>
          ))}
        </div>

        {/* Render Modes & Camera Reset */}
        <div className="flex items-center gap-1.5 ms-auto">
          <div className="flex items-center gap-0.5 bg-background/80 p-0.5 rounded-md border border-border">
            <button
              onClick={() => handleSelectRenderMode("ball-stick")}
              title="Ball & Stick"
              className={`p-1 rounded text-xs transition-colors ${
                renderMode === "ball-stick"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Box className="size-3.5" />
            </button>
            <button
              onClick={() => handleSelectRenderMode("space-fill")}
              title="Space Filling (van der Waals)"
              className={`p-1 rounded text-xs transition-colors ${
                renderMode === "space-fill"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
            </button>
            <button
              onClick={() => handleSelectRenderMode("wireframe")}
              title="Orbital Wireframe"
              className={`p-1 rounded text-xs transition-colors ${
                renderMode === "wireframe"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3.5" />
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
            className={`px-2 py-1 rounded-md border border-border font-mono text-[11px] transition-colors ${
              autoRotate ? "bg-accent/40 text-accent-strong" : "bg-card text-muted-foreground"
            }`}
          >
            {autoRotate ? "Orbiting" : "Paused"}
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Rotation"
            className="p-1 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
