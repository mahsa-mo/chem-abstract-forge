import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Rich, Bustling Biochemical Microcosm (محیط پرشور، غنی، شلوغ و متنوع بیوشیمیایی و میکروبی)
 *
 * An authentic, densely populated, and delicately proportioned scientific universe featuring 35+
 * biochemical structures and microorganisms with fine, crystal-like geometry:
 *
 * 1. Microorganisms & Nano-Machinery:
 *    - Bacteriophage T4 Virus: icosahedral capsid head, sheath neck, baseplate & 6 tail fibers
 *    - Paramecium / Ciliated Microbe: elongated cell with radiating undulating ciliary filaments
 *    - Diatom / Radiolarian: silica porous mineral jewel with radiating crystal spines
 *    - Cellular Liposome / Transport Vesicle: lipid bilayer vesicle with floating nutrient cargo
 *    - Bacillus Bacterium: capsule body with wavy propulsion flagellum
 * 2. Nucleic Acids & Genetics:
 *    - DNA Double-Helix micro-spiral with alternating base pairs
 *    - ATP (Adenosine Triphosphate) with ribose ring and triphosphate chain
 * 3. Cellular & Membrane Biochemistry:
 *    - Triplet Phospholipid Membrane Cluster
 *    - Steroid / Cholesterol 4-ring fused framework (phenanthrene + cyclopentane)
 *    - Porphyrin / Heme coordinate ring with central iron ion core
 *    - Polypeptide / Alpha-helix protein loop with peptide bonds
 * 4. Bio-Active Organic Molecules:
 *    - Caffeine (C8H10N4O2) fused purine heterocycle
 *    - Dopamine (C8H11NO2) catecholamine neurotransmitter
 *    - Anthracene 3-ring fused aromatic hydrocarbon
 *    - Benzene (C6H6) with shimmering delocalized pi-cloud
 *    - Glucose pyranose ring in true 3D chair conformation
 * 5. Quantum Atomic Models:
 *    - Hero Quantum Bohr Atom with 3 inclined elliptical orbits & orbiting electrons
 *    - Two secondary satellite micro-atoms orbiting in background depth
 * 6. Environmental Small Bio-Molecules:
 *    - Water dipoles (H2O), Ammonia (NH3), Methane (CH4), Carbon Dioxide (CO2), Ethanol (C2H5OH), Ozone (O3)
 * 7. Cytoplasmic Bio-Ions & Ambient Quantum Stardust (200+ Na+, K+, Mg2+, Ca2+ sparks)
 */

interface BioEntity {
  group: THREE.Group;
  basePos: THREE.Vector3;
  driftRange: THREE.Vector3;
  driftSpeed: number;
  driftPhase: number;
  rotAxis: THREE.Vector3;
  rotSpeed: number;
}

interface OrbitingElectron {
  mesh: THREE.Mesh;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
  parent: THREE.Group;
  euler: THREE.Euler;
}

interface CiliaryHair {
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  dir: THREE.Vector3;
  phase: number;
}

export function MolecularCanvas3D({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL capability check
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene & Perspective Camera with deep microscopic depth
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 16);

    // High-Precision WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Multi-Point Bioluminescent Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 1.4);
    cyanLight.position.set(12, 14, 10);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    violetLight.position.set(-14, -10, 8);
    scene.add(violetLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 1.5, 35);
    amberLight.position.set(0, 8, -4);
    scene.add(amberLight);

    // Reusable Geometries
    const sphereGeoStandard = new THREE.SphereGeometry(1, 24, 20);
    const fineBondGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 10); // Delicate slender rods

    // Authentic Biochemical CPK & Bioluminescent Color Spectrum
    const COLOR_C = 0x06b6d4; // Carbon (Bio-Cyan / Teal)
    const COLOR_H = 0xf8fafc; // Hydrogen (Pearlescent White)
    const COLOR_O = 0xef4444; // Oxygen (Vivid Ruby Red)
    const COLOR_N = 0x6366f1; // Nitrogen (Royal Indigo / Blue)
    const COLOR_P = 0xf59e0b; // Phosphorus (Golden Amber)
    const COLOR_S = 0xeab308; // Sulfur (Citron Yellow)
    const COLOR_FE = 0xe11d48; // Iron / Metal Ion (Deep Crimson / Rose)
    const COLOR_LIPID = 0x10b981; // Lipid Chain Carbon (Emerald)
    const COLOR_ELECTRON = 0xfacc15; // Quantum Electron (Electric Gold)
    const COLOR_MICROBE = 0x8b5cf6; // Microbial Shell (Ethereal Violet)
    const COLOR_CILIA = 0x38bdf8; // Ciliary Filament (Sky Blue)

    // Cached Materials
    const matCache: Record<string, THREE.MeshStandardMaterial> = {};
    function getMat(
      color: number,
      emissiveIntensity: number = 0.35,
      roughness: number = 0.15,
      metalness: number = 0.2,
    ): THREE.MeshStandardMaterial {
      const key = `${color}-${emissiveIntensity}-${roughness}-${metalness}`;
      if (!matCache[key]) {
        matCache[key] = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity,
          roughness,
          metalness,
        });
      }
      return matCache[key]!;
    }

    const defaultBondMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0x334155,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.35,
    });

    // Helper: Add slender bond between two 3D points
    function addBond(
      start: THREE.Vector3,
      end: THREE.Vector3,
      parent: THREE.Object3D,
      customMat?: THREE.Material,
      scaleR: number = 1,
    ) {
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      const cylinder = new THREE.Mesh(fineBondGeo, customMat ?? defaultBondMat);
      cylinder.scale.set(scaleR, len, scaleR);
      cylinder.position.copy(center);
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      parent.add(cylinder);
    }

    const bioEntities: BioEntity[] = [];
    const orbitingElectrons: OrbitingElectron[] = [];
    const ciliaryHairs: CiliaryHair[] = [];

    // =========================================================================
    // MICROORGANISM 1: BACTERIOPHAGE T4 VIRUS (باکتریوفاژ T4)
    // Iconic lunar-lander virus with icosahedral capsid head, collar, sheath, & 6 legs
    // =========================================================================
    const phageGroup = new THREE.Group();
    scene.add(phageGroup);

    // Icosahedral head
    const phageHead = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 0),
      getMat(COLOR_MICROBE, 0.55),
    );
    phageHead.position.set(0, 1.0, 0);
    phageGroup.add(phageHead);

    // Inner DNA core
    const phageDNA = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), getMat(COLOR_O, 0.7));
    phageDNA.position.set(0, 1.0, 0);
    phageGroup.add(phageDNA);

    // Collar disc
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12),
      getMat(COLOR_C, 0.4),
    );
    collar.position.set(0, 0.52, 0);
    phageGroup.add(collar);

    // Contractile Sheath
    const sheath = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12),
      getMat(COLOR_P, 0.45),
    );
    sheath.position.set(0, 0.1, 0);
    phageGroup.add(sheath);

    // Baseplate
    const baseplate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.08, 6),
      getMat(COLOR_C, 0.5),
    );
    baseplate.position.set(0, -0.32, 0);
    phageGroup.add(baseplate);

    // 6 Spider-like Tail Fibers extending downwards with jointed angles
    for (let f = 0; f < 6; f++) {
      const a = (f * Math.PI) / 3;
      const rootPos = new THREE.Vector3(Math.cos(a) * 0.22, -0.32, Math.sin(a) * 0.22);
      const kneePos = new THREE.Vector3(Math.cos(a) * 0.55, -0.65, Math.sin(a) * 0.55);
      const footPos = new THREE.Vector3(Math.cos(a) * 0.85, -1.05, Math.sin(a) * 0.85);

      addBond(rootPos, kneePos, phageGroup, undefined, 0.8);
      addBond(kneePos, footPos, phageGroup, undefined, 0.8);

      const footBead = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_MICROBE, 0.6));
      footBead.scale.setScalar(0.06);
      footBead.position.copy(footPos);
      phageGroup.add(footBead);
    }

    bioEntities.push({
      group: phageGroup,
      basePos: new THREE.Vector3(-4.8, 2.2, -2.8),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.32,
      driftPhase: 0.6,
      rotAxis: new THREE.Vector3(0.3, 0.9, 0.3).normalize(),
      rotSpeed: 0.18,
    });

    // =========================================================================
    // MICROORGANISM 2: PARAMECIUM / CILIATED MICROBE (پارامسی مژک‌دار با ارگانل‌های تابان)
    // =========================================================================
    const parameciumGroup = new THREE.Group();
    scene.add(parameciumGroup);

    // Elongated body
    const paraBodyGeo = new THREE.SphereGeometry(0.65, 20, 16);
    paraBodyGeo.scale(1.6, 0.7, 0.7);
    const paraMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      metalness: 0.1,
    });
    const paraBody = new THREE.Mesh(paraBodyGeo, paraMat);
    parameciumGroup.add(paraBody);

    // Inner Vacuoles / Nuclei
    const vacuole1 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.6));
    vacuole1.scale.setScalar(0.18);
    vacuole1.position.set(-0.35, 0.1, 0);
    parameciumGroup.add(vacuole1);

    const vacuole2 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_ELECTRON, 0.6));
    vacuole2.scale.setScalar(0.14);
    vacuole2.position.set(0.35, -0.05, 0.1);
    parameciumGroup.add(vacuole2);

    // Radiating Ciliary Filaments around perimeter
    const ciliaCylGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6);
    const ciliaMat = new THREE.MeshBasicMaterial({
      color: COLOR_CILIA,
      transparent: true,
      opacity: 0.7,
    });
    const ciliaCount = 20;
    for (let c = 0; c < ciliaCount; c++) {
      const a = (c * 2 * Math.PI) / ciliaCount;
      const bx = Math.cos(a) * 0.95;
      const by = Math.sin(a) * 0.45;
      const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).normalize();

      const cilMesh = new THREE.Mesh(ciliaCylGeo, ciliaMat);
      cilMesh.position.set(bx + dir.x * 0.15, by + dir.y * 0.15, 0);
      cilMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      parameciumGroup.add(cilMesh);

      ciliaryHairs.push({
        mesh: cilMesh,
        basePos: new THREE.Vector3(bx + dir.x * 0.15, by + dir.y * 0.15, 0),
        dir,
        phase: c * 0.35,
      });
    }

    bioEntities.push({
      group: parameciumGroup,
      basePos: new THREE.Vector3(4.8, -2.4, -3.2),
      driftRange: new THREE.Vector3(0.6, 0.5, 0.3),
      driftSpeed: 0.35,
      driftPhase: 1.8,
      rotAxis: new THREE.Vector3(0.2, 0.7, 0.5).normalize(),
      rotSpeed: 0.16,
    });

    // =========================================================================
    // MICROORGANISM 3: RADIOLARIAN / DIATOM SILICA JEWEL (دیاتومه کریستالی با پره‌های منشوری)
    // =========================================================================
    const diatomGroup = new THREE.Group();
    scene.add(diatomGroup);

    // Dodecahedral silica mineral core
    const diatomCore = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.65, 0),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.75,
        wireframe: true,
      }),
    );
    diatomGroup.add(diatomCore);

    // 12 Radiating Crystal Spines
    const spineGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.75, 6);
    const spineMat = getMat(COLOR_LIPID, 0.6);
    const dodecaPoints = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(-1, 1, 1),
      new THREE.Vector3(1, -1, 1),
      new THREE.Vector3(1, 1, -1),
      new THREE.Vector3(-1, -1, 1),
      new THREE.Vector3(-1, 1, -1),
      new THREE.Vector3(1, -1, -1),
      new THREE.Vector3(-1, -1, -1),
    ];
    dodecaPoints.forEach((pt) => {
      const dir = pt.clone().normalize();
      const spine = new THREE.Mesh(spineGeo, spineMat);
      spine.position.copy(dir.clone().multiplyScalar(0.75));
      spine.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      diatomGroup.add(spine);

      const tipBead = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_ELECTRON, 0.8));
      tipBead.scale.setScalar(0.07);
      tipBead.position.copy(dir.clone().multiplyScalar(1.15));
      diatomGroup.add(tipBead);
    });

    bioEntities.push({
      group: diatomGroup,
      basePos: new THREE.Vector3(-1.8, 3.8, -3.6),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.3,
      driftPhase: 3.4,
      rotAxis: new THREE.Vector3(0.6, 0.6, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // MICROORGANISM 4: CELLULAR TRANSPORT VESICLE / LIPOSOME (وزیکول ترابری غشایی)
    // =========================================================================
    const vesicleGroup = new THREE.Group();
    scene.add(vesicleGroup);

    // Outer membrane sphere (translucent)
    const vesicleMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 24, 20),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
      }),
    );
    vesicleGroup.add(vesicleMembrane);

    // Inner floating cargo nutrients
    const cargoColors = [COLOR_C, COLOR_O, COLOR_ELECTRON, COLOR_P];
    for (let cg = 0; cg < 6; cg++) {
      const cMesh = new THREE.Mesh(
        sphereGeoStandard,
        getMat(cargoColors[cg % cargoColors.length]!, 0.7),
      );
      cMesh.scale.setScalar(0.12);
      cMesh.position.set(
        (Math.random() - 0.5) * 0.65,
        (Math.random() - 0.5) * 0.65,
        (Math.random() - 0.5) * 0.65,
      );
      vesicleGroup.add(cMesh);
    }

    bioEntities.push({
      group: vesicleGroup,
      basePos: new THREE.Vector3(6.8, -4.2, -3.4),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.32,
      driftPhase: 2.2,
      rotAxis: new THREE.Vector3(0.4, 0.7, 0.4).normalize(),
      rotSpeed: 0.18,
    });

    // =========================================================================
    // MICROORGANISM 5: BACILLUS BACTERIUM WITH FLAGELLUM (باکتری میله‌ای با تاژک)
    // =========================================================================
    const bacillusGroup = new THREE.Group();
    scene.add(bacillusGroup);

    // Capsule body
    const bacCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.9, 16),
      getMat(COLOR_LIPID, 0.45),
    );
    bacillusGroup.add(bacCyl);

    const capTop = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_LIPID, 0.45));
    capTop.scale.set(0.24, 0.24, 0.24);
    capTop.position.set(0, 0.45, 0);
    bacillusGroup.add(capTop);

    const capBot = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_LIPID, 0.45));
    capBot.scale.set(0.24, 0.24, 0.24);
    capBot.position.set(0, -0.45, 0);
    bacillusGroup.add(capBot);

    // Wavy Flagellum tail
    const flagellumPts: THREE.Vector3[] = [];
    const fCount = 10;
    for (let f = 0; f < fCount; f++) {
      flagellumPts.push(
        new THREE.Vector3(Math.sin(f * 1.2) * 0.15, -0.5 - f * 0.16, Math.cos(f * 1.2) * 0.12),
      );
    }
    const fCurve = new THREE.CatmullRomCurve3(flagellumPts);
    const flagellumMesh = new THREE.Mesh(
      new THREE.TubeGeometry(fCurve, 24, 0.016, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x34d399 }),
    );
    bacillusGroup.add(flagellumMesh);

    bioEntities.push({
      group: bacillusGroup,
      basePos: new THREE.Vector3(-7.5, -3.2, -3.2),
      driftRange: new THREE.Vector3(0.5, 0.5, 0.3),
      driftSpeed: 0.36,
      driftPhase: 4.8,
      rotAxis: new THREE.Vector3(0.5, 0.6, -0.3).normalize(),
      rotSpeed: 0.24,
    });

    // =========================================================================
    // 6. DNA DOUBLE-HELIX MICRO-SPIRAL (مارپیچ زیستی دی‌ان‌ای)
    // =========================================================================
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);
    const dnaSteps = 16;
    const dnaRadius = 0.85;
    const dnaStepHeight = 0.28;
    const strandA: THREE.Vector3[] = [];
    const strandB: THREE.Vector3[] = [];

    for (let i = 0; i < dnaSteps; i++) {
      const angle = i * 0.48;
      const y = (i - dnaSteps / 2) * dnaStepHeight;

      const pA = new THREE.Vector3(Math.cos(angle) * dnaRadius, y, Math.sin(angle) * dnaRadius);
      strandA.push(pA);
      const mA = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_P, 0.45));
      mA.scale.setScalar(0.12);
      mA.position.copy(pA);
      dnaGroup.add(mA);

      const pB = new THREE.Vector3(
        Math.cos(angle + Math.PI) * dnaRadius,
        y,
        Math.sin(angle + Math.PI) * dnaRadius,
      );
      strandB.push(pB);
      const mB = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      mB.scale.setScalar(0.12);
      mB.position.copy(pB);
      dnaGroup.add(mB);

      const rungMat = i % 2 === 0 ? getMat(COLOR_N, 0.35) : getMat(COLOR_O, 0.35);
      addBond(pA, pB, dnaGroup, rungMat, 1.1);
    }
    for (let i = 0; i < dnaSteps - 1; i++) {
      addBond(strandA[i]!, strandA[i + 1]!, dnaGroup, undefined, 0.85);
      addBond(strandB[i]!, strandB[i + 1]!, dnaGroup, undefined, 0.85);
    }

    bioEntities.push({
      group: dnaGroup,
      basePos: new THREE.Vector3(-7.2, 4.2, -3.4),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.35,
      driftPhase: 0,
      rotAxis: new THREE.Vector3(0.2, 1, 0.3).normalize(),
      rotSpeed: 0.25,
    });

    // =========================================================================
    // 7. HERO QUANTUM BOHR ATOM (اتم کوانتومی با مدارهای چرخان و الکترون‌ها)
    // =========================================================================
    const bohrHeroGroup = new THREE.Group();
    scene.add(bohrHeroGroup);

    const nucleusSpheres = [
      [0, 0, 0, COLOR_O],
      [0.13, 0.11, 0.07, COLOR_MICROBE],
      [-0.11, 0.13, -0.09, COLOR_P],
      [0.09, -0.13, 0.11, COLOR_O],
      [-0.11, -0.09, -0.11, COLOR_MICROBE],
      [0.05, 0.15, -0.11, COLOR_P],
    ] as const;

    nucleusSpheres.forEach(([x, y, z, c]) => {
      const s = new THREE.Mesh(sphereGeoStandard, getMat(c, 0.65));
      s.scale.setScalar(0.14);
      s.position.set(x, y, z);
      bohrHeroGroup.add(s);
    });

    const heroOrbits = [
      { rx: 2.0, ry: 0.8, euler: new THREE.Euler(0.85, 0.3, 0), speed: 3.2, col: COLOR_C },
      {
        rx: 2.1,
        ry: 0.85,
        euler: new THREE.Euler(-0.75, 0.7, 0.5),
        speed: -2.8,
        col: COLOR_ELECTRON,
      },
      { rx: 2.2, ry: 0.9, euler: new THREE.Euler(0.2, -0.9, 1.1), speed: 2.5, col: COLOR_LIPID },
    ];

    heroOrbits.forEach((cfg, idx) => {
      const curve = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(54));
      const ringMat = new THREE.LineBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.5,
      });
      const ringLine = new THREE.LineLoop(ringGeo, ringMat);
      ringLine.rotation.copy(cfg.euler);
      bohrHeroGroup.add(ringLine);

      const eMesh = new THREE.Mesh(sphereGeoStandard, getMat(cfg.col, 0.95));
      eMesh.scale.setScalar(0.085);
      bohrHeroGroup.add(eMesh);

      orbitingElectrons.push({
        mesh: eMesh,
        rx: cfg.rx,
        ry: cfg.ry,
        speed: cfg.speed,
        phase: (idx * 2 * Math.PI) / 3,
        parent: bohrHeroGroup,
        euler: cfg.euler,
      });
    });

    bioEntities.push({
      group: bohrHeroGroup,
      basePos: new THREE.Vector3(7.4, 4.0, -2.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.4,
      driftPhase: 1.2,
      rotAxis: new THREE.Vector3(0.3, 1, 0.2).normalize(),
      rotSpeed: 0.2,
    });

    // =========================================================================
    // 8. PORPHYRIN / HEME RING COMPLEX WITH CENTRAL IRON ION (پورفیرین آهن)
    // =========================================================================
    const hemeGroup = new THREE.Group();
    scene.add(hemeGroup);

    const feMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_FE, 0.75));
    feMesh.scale.setScalar(0.22);
    hemeGroup.add(feMesh);

    const nRadius = 0.85;
    const pyrroleNitrogens: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const nPos = new THREE.Vector3(Math.cos(a) * nRadius, Math.sin(a) * nRadius, 0);
      pyrroleNitrogens.push(nPos);

      const nMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
      nMesh.scale.setScalar(0.15);
      nMesh.position.copy(nPos);
      hemeGroup.add(nMesh);
      addBond(new THREE.Vector3(0, 0, 0), nPos, hemeGroup, undefined, 0.8);
    }

    const outerPorphyrinCVecs: THREE.Vector3[] = [];
    const pSteps = 12;
    const pRadius = 1.5;
    for (let i = 0; i < pSteps; i++) {
      const a = (i * 2 * Math.PI) / pSteps;
      const cPos = new THREE.Vector3(
        Math.cos(a) * pRadius,
        Math.sin(a) * pRadius,
        i % 2 === 0 ? 0.08 : -0.08,
      );
      outerPorphyrinCVecs.push(cPos);

      const cMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      cMesh.scale.setScalar(0.13);
      cMesh.position.copy(cPos);
      hemeGroup.add(cMesh);
    }
    for (let i = 0; i < pSteps; i++) {
      addBond(
        outerPorphyrinCVecs[i]!,
        outerPorphyrinCVecs[(i + 1) % pSteps]!,
        hemeGroup,
        undefined,
        0.8,
      );
    }

    bioEntities.push({
      group: hemeGroup,
      basePos: new THREE.Vector3(-4.2, 4.6, -3.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.36,
      driftPhase: 2.1,
      rotAxis: new THREE.Vector3(0.5, 0.7, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // 9. STEROID / CHOLESTEROL 4-RING SKELETON (استروئید کلسترول)
    // =========================================================================
    const steroidGroup = new THREE.Group();
    scene.add(steroidGroup);

    const steroidCenters = [
      new THREE.Vector3(-1.1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.1, 0.35, 0),
      new THREE.Vector3(2.1, 0.7, 0),
    ];

    steroidCenters.forEach((center, idx) => {
      const count = idx === 3 ? 5 : 6;
      const r = idx === 3 ? 0.52 : 0.58;
      const ringPts: THREE.Vector3[] = [];
      for (let k = 0; k < count; k++) {
        const a = (k * 2 * Math.PI) / count;
        const pt = new THREE.Vector3(
          center.x + Math.cos(a) * r,
          center.y + Math.sin(a) * r,
          k % 2 === 0 ? 0.05 : -0.05,
        );
        ringPts.push(pt);
        const m = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
        m.scale.setScalar(0.11);
        m.position.copy(pt);
        steroidGroup.add(m);
      }
      for (let k = 0; k < count; k++) {
        addBond(ringPts[k]!, ringPts[(k + 1) % count]!, steroidGroup, undefined, 0.75);
      }
    });

    const ohPos = new THREE.Vector3(-1.65, -0.45, 0.1);
    const ohMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.55));
    ohMesh.scale.setScalar(0.16);
    ohMesh.position.copy(ohPos);
    steroidGroup.add(ohMesh);
    addBond(new THREE.Vector3(-1.1, 0, 0), ohPos, steroidGroup, undefined, 0.8);

    bioEntities.push({
      group: steroidGroup,
      basePos: new THREE.Vector3(5.8, -0.4, -2.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.38,
      driftPhase: 3.2,
      rotAxis: new THREE.Vector3(0.4, -0.8, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // 10. GLUCOSE PYRANOSE CHAIR CONFORMATION (گلوکز در فرم صندلی)
    // =========================================================================
    const glucoseGroup = new THREE.Group();
    scene.add(glucoseGroup);

    const chairCoords = [
      new THREE.Vector3(-0.85, 0.3, 0.22),
      new THREE.Vector3(-0.3, 0.85, -0.22),
      new THREE.Vector3(0.65, 0.65, 0.22),
      new THREE.Vector3(0.9, -0.22, -0.22),
      new THREE.Vector3(0.3, -0.75, 0.22),
      new THREE.Vector3(-0.55, -0.55, -0.22),
    ];

    chairCoords.forEach((pt, idx) => {
      const isO = idx === 5;
      const m = new THREE.Mesh(sphereGeoStandard, getMat(isO ? COLOR_O : COLOR_C, 0.4));
      m.scale.setScalar(isO ? 0.19 : 0.15);
      m.position.copy(pt);
      glucoseGroup.add(m);
    });
    for (let i = 0; i < chairCoords.length; i++) {
      addBond(
        chairCoords[i]!,
        chairCoords[(i + 1) % chairCoords.length]!,
        glucoseGroup,
        undefined,
        0.8,
      );
    }

    bioEntities.push({
      group: glucoseGroup,
      basePos: new THREE.Vector3(1.6, 4.4, -3.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.42,
      driftPhase: 4.1,
      rotAxis: new THREE.Vector3(0.6, 0.5, 0.4).normalize(),
      rotSpeed: 0.26,
    });

    // =========================================================================
    // 11. ATP (ADENOSINE TRIPHOSPHATE) (آدنوزین تری‌فسفات)
    // =========================================================================
    const atpGroup = new THREE.Group();
    scene.add(atpGroup);

    const riboseRadius = 0.55;
    const ribosePts: THREE.Vector3[] = [];
    for (let r = 0; r < 5; r++) {
      const a = (r * 2 * Math.PI) / 5 - Math.PI / 2;
      const v = new THREE.Vector3(Math.cos(a) * riboseRadius, Math.sin(a) * riboseRadius, 0);
      ribosePts.push(v);
      const m = new THREE.Mesh(sphereGeoStandard, getMat(r === 0 ? COLOR_O : COLOR_C, 0.4));
      m.scale.setScalar(0.13);
      m.position.copy(v);
      atpGroup.add(m);
    }
    for (let r = 0; r < 5; r++) {
      addBond(ribosePts[r]!, ribosePts[(r + 1) % 5]!, atpGroup, undefined, 0.75);
    }

    let prevPhos = new THREE.Vector3(ribosePts[1]!.x + 0.42, ribosePts[1]!.y + 0.22, 0);
    for (let p = 0; p < 3; p++) {
      const curPhos = new THREE.Vector3(
        prevPhos.x + 0.55,
        prevPhos.y + (p % 2 === 0 ? 0.18 : -0.18),
        0.07 * p,
      );
      const pm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_P, 0.65));
      pm.scale.setScalar(0.19);
      pm.position.copy(curPhos);
      atpGroup.add(pm);

      const oxPos = new THREE.Vector3(curPhos.x, curPhos.y + 0.32, 0);
      const ox = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.4));
      ox.scale.setScalar(0.11);
      ox.position.copy(oxPos);
      atpGroup.add(ox);
      addBond(curPhos, oxPos, atpGroup, undefined, 0.7);

      addBond(prevPhos, curPhos, atpGroup, undefined, 0.95);
      prevPhos = curPhos;
    }

    const adeMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
    adeMesh.scale.setScalar(0.17);
    adeMesh.position.set(ribosePts[4]!.x - 0.5, ribosePts[4]!.y + 0.32, 0);
    atpGroup.add(adeMesh);
    addBond(ribosePts[4]!, adeMesh.position, atpGroup, undefined, 0.8);

    bioEntities.push({
      group: atpGroup,
      basePos: new THREE.Vector3(-4.8, -4.4, -2.8),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.38,
      driftPhase: 5.0,
      rotAxis: new THREE.Vector3(0.3, 0.8, -0.4).normalize(),
      rotSpeed: 0.24,
    });

    // =========================================================================
    // 12. CAFFEINE (C8H10N4O2) PURINE HETEROCYCLE (کافئین)
    // =========================================================================
    const caffeineGroup = new THREE.Group();
    scene.add(caffeineGroup);

    const cafRingNodes = [
      { pos: new THREE.Vector3(-0.5, 0.75, 0), col: COLOR_N },
      { pos: new THREE.Vector3(0.4, 1.0, 0), col: COLOR_C },
      { pos: new THREE.Vector3(1.1, 0.25, 0), col: COLOR_N },
      { pos: new THREE.Vector3(0.75, -0.65, 0), col: COLOR_C },
      { pos: new THREE.Vector3(-0.25, -0.85, 0), col: COLOR_C },
      { pos: new THREE.Vector3(-0.95, -0.1, 0), col: COLOR_C },
    ];
    cafRingNodes.forEach((node) => {
      const m = new THREE.Mesh(sphereGeoStandard, getMat(node.col, 0.4));
      m.scale.setScalar(0.15);
      m.position.copy(node.pos);
      caffeineGroup.add(m);
    });
    for (let i = 0; i < cafRingNodes.length; i++) {
      addBond(
        cafRingNodes[i]!.pos,
        cafRingNodes[(i + 1) % cafRingNodes.length]!.pos,
        caffeineGroup,
        undefined,
        0.8,
      );
    }
    // Carbonyl oxygens
    const cafO1 = new THREE.Vector3(0.65, 1.7, 0);
    const mO1 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
    mO1.scale.setScalar(0.18);
    mO1.position.copy(cafO1);
    caffeineGroup.add(mO1);
    addBond(cafRingNodes[1]!.pos, cafO1, caffeineGroup, undefined, 0.8);

    bioEntities.push({
      group: caffeineGroup,
      basePos: new THREE.Vector3(2.8, -4.6, -3.2),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.4,
      driftPhase: 1.5,
      rotAxis: new THREE.Vector3(0.4, 0.7, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // 13. DOPAMINE (C8H11NO2) CATECHOLAMINE (دوپامین)
    // =========================================================================
    const dopamineGroup = new THREE.Group();
    scene.add(dopamineGroup);

    const dopaRingR = 0.95;
    const dopaCVecs: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const v = new THREE.Vector3(Math.cos(a) * dopaRingR - 0.9, Math.sin(a) * dopaRingR, 0);
      dopaCVecs.push(v);
      const c = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
      c.scale.setScalar(0.14);
      c.position.copy(v);
      dopamineGroup.add(c);
    }
    for (let i = 0; i < 6; i++) {
      addBond(dopaCVecs[i]!, dopaCVecs[(i + 1) % 6]!, dopamineGroup, undefined, 0.8);
    }
    // Hydroxyl groups
    const oh1 = new THREE.Vector3(dopaCVecs[2]!.x - 0.7, dopaCVecs[2]!.y + 0.2, 0);
    const mOH1 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
    mOH1.scale.setScalar(0.16);
    mOH1.position.copy(oh1);
    dopamineGroup.add(mOH1);
    addBond(dopaCVecs[2]!, oh1, dopamineGroup, undefined, 0.75);

    // Amine chain
    const amineN = new THREE.Vector3(dopaCVecs[0]!.x + 1.8, dopaCVecs[0]!.y + 0.2, 0);
    const mAmine = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
    mAmine.scale.setScalar(0.17);
    mAmine.position.copy(amineN);
    dopamineGroup.add(mAmine);
    addBond(dopaCVecs[0]!, amineN, dopamineGroup, undefined, 0.75);

    bioEntities.push({
      group: dopamineGroup,
      basePos: new THREE.Vector3(-7.8, -0.8, -2.6),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.38,
      driftPhase: 3.9,
      rotAxis: new THREE.Vector3(0.3, 0.9, -0.3).normalize(),
      rotSpeed: 0.2,
    });

    // =========================================================================
    // 14. ANTHRACENE POLYCYCLIC AROMATIC HYDROCARBON (آنتراسن ۳ حلقه‌ای)
    // =========================================================================
    const anthraceneGroup = new THREE.Group();
    scene.add(anthraceneGroup);

    [-1.2, 0, 1.2].forEach((cx) => {
      const r = 0.65;
      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const pt = new THREE.Vector3(cx + Math.cos(a) * r, Math.sin(a) * r, 0);
        ringPts.push(pt);
        const m = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
        m.scale.setScalar(0.12);
        m.position.copy(pt);
        anthraceneGroup.add(m);
      }
      for (let i = 0; i < 6; i++) {
        addBond(ringPts[i]!, ringPts[(i + 1) % 6]!, anthraceneGroup, undefined, 0.75);
      }
    });

    bioEntities.push({
      group: anthraceneGroup,
      basePos: new THREE.Vector3(3.2, 2.2, -3.6),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.4,
      driftPhase: 4.6,
      rotAxis: new THREE.Vector3(0.5, 0.7, -0.4).normalize(),
      rotSpeed: 0.26,
    });

    // =========================================================================
    // 15. BENZENE WITH DELOCALIZED PI-ELECTRON RESONANCE TORUS (بنزن)
    // =========================================================================
    const benzeneGroup = new THREE.Group();
    scene.add(benzeneGroup);

    const bCRad = 0.95;
    const bHRad = 1.5;
    const bCVecs: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const c = new THREE.Vector3(Math.cos(a) * bCRad, Math.sin(a) * bCRad, 0);
      bCVecs.push(c);
      const cm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      cm.scale.setScalar(0.14);
      cm.position.copy(c);
      benzeneGroup.add(cm);

      const h = new THREE.Vector3(Math.cos(a) * bHRad, Math.sin(a) * bHRad, 0);
      const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      hm.scale.setScalar(0.1);
      hm.position.copy(h);
      benzeneGroup.add(hm);

      addBond(c, h, benzeneGroup, undefined, 0.7);
    }
    for (let i = 0; i < 6; i++) {
      addBond(bCVecs[i]!, bCVecs[(i + 1) % 6]!, benzeneGroup, undefined, 0.85);
    }

    const bTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.022, 16, 40),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.65,
        transparent: true,
        opacity: 0.6,
      }),
    );
    benzeneGroup.add(bTorus);

    bioEntities.push({
      group: benzeneGroup,
      basePos: new THREE.Vector3(-1.6, -4.6, -2.8),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.42,
      driftPhase: 4.8,
      rotAxis: new THREE.Vector3(0.4, 0.8, -0.4).normalize(),
      rotSpeed: 0.28,
    });

    // =========================================================================
    // 16. TWO SATELLITE QUANTUM ATOMS (اتم‌های چرخان ماهواره‌ای در اعماق فضا)
    // =========================================================================
    function buildSatelliteAtom(pos: THREE.Vector3, col: number, speedMult: number): THREE.Group {
      const g = new THREE.Group();
      const core = new THREE.Mesh(sphereGeoStandard, getMat(col, 0.75));
      core.scale.setScalar(0.18);
      g.add(core);

      const orbits = [
        {
          rx: 1.3,
          ry: 0.55,
          euler: new THREE.Euler(0.7, 0.4, 0),
          speed: 4.0 * speedMult,
          col: COLOR_C,
        },
        {
          rx: 1.4,
          ry: 0.6,
          euler: new THREE.Euler(-0.6, -0.5, 0.8),
          speed: -3.4 * speedMult,
          col: COLOR_ELECTRON,
        },
      ];
      orbits.forEach((cfg, idx) => {
        const c = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
        const lg = new THREE.BufferGeometry().setFromPoints(c.getPoints(36));
        const line = new THREE.LineLoop(
          lg,
          new THREE.LineBasicMaterial({ color: cfg.col, transparent: true, opacity: 0.45 }),
        );
        line.rotation.copy(cfg.euler);
        g.add(line);

        const em = new THREE.Mesh(sphereGeoStandard, getMat(cfg.col, 0.9));
        em.scale.setScalar(0.07);
        g.add(em);

        orbitingElectrons.push({
          mesh: em,
          rx: cfg.rx,
          ry: cfg.ry,
          speed: cfg.speed,
          phase: idx * Math.PI,
          parent: g,
          euler: cfg.euler,
        });
      });
      return g;
    }

    const satAtom1 = buildSatelliteAtom(new THREE.Vector3(0, 0, 0), COLOR_MICROBE, 1);
    scene.add(satAtom1);
    bioEntities.push({
      group: satAtom1,
      basePos: new THREE.Vector3(2.5, 2.5, -4.8),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.4,
      driftPhase: 0.9,
      rotAxis: new THREE.Vector3(0.3, 1, 0.2).normalize(),
      rotSpeed: 0.25,
    });

    const satAtom2 = buildSatelliteAtom(new THREE.Vector3(0, 0, 0), COLOR_FE, 1.2);
    scene.add(satAtom2);
    bioEntities.push({
      group: satAtom2,
      basePos: new THREE.Vector3(-4.5, -2.4, -4.5),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.44,
      driftPhase: 2.8,
      rotAxis: new THREE.Vector3(-0.4, 0.8, 0.3).normalize(),
      rotSpeed: 0.28,
    });

    // =========================================================================
    // 17. SMALL DIVERSE ENVIRONMENTAL CHEMICAL MOLECULES (متان، آب، آمونیاک، اتانول، CO2، اوزون)
    // =========================================================================
    // Water Dipoles (3 instances distributed across background)
    function buildWater(): THREE.Group {
      const wg = new THREE.Group();
      const ox = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
      ox.scale.setScalar(0.22);
      wg.add(ox);
      const halfAngle = (52.25 * Math.PI) / 180;
      const bLen = 0.82;
      const h1 = new THREE.Vector3(Math.sin(halfAngle) * bLen, -Math.cos(halfAngle) * bLen, 0);
      const h2 = new THREE.Vector3(-Math.sin(halfAngle) * bLen, -Math.cos(halfAngle) * bLen, 0);
      [h1, h2].forEach((hPos) => {
        const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.28));
        hm.scale.setScalar(0.12);
        hm.position.copy(hPos);
        wg.add(hm);
        addBond(new THREE.Vector3(0, 0, 0), hPos, wg, undefined, 0.65);
      });
      return wg;
    }

    const waterPositions = [
      new THREE.Vector3(-1.2, 2.8, -2.2),
      new THREE.Vector3(3.6, 0.6, -2.6),
      new THREE.Vector3(-6.2, 0.6, -3.2),
    ];
    waterPositions.forEach((pos, idx) => {
      const w = buildWater();
      scene.add(w);
      bioEntities.push({
        group: w,
        basePos: pos,
        driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
        driftSpeed: 0.5 + idx * 0.05,
        driftPhase: idx * 1.5,
        rotAxis: new THREE.Vector3(0.4, 0.8, 0.4).normalize(),
        rotSpeed: 0.32,
      });
    });

    // Methane (CH4)
    const methaneGroup = new THREE.Group();
    scene.add(methaneGroup);
    const mC = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.45));
    mC.scale.setScalar(0.2);
    methaneGroup.add(mC);
    const inv3 = 1 / Math.sqrt(3);
    const tLen = 0.8;
    [
      new THREE.Vector3(inv3 * tLen, inv3 * tLen, inv3 * tLen),
      new THREE.Vector3(inv3 * tLen, -inv3 * tLen, -inv3 * tLen),
      new THREE.Vector3(-inv3 * tLen, inv3 * tLen, -inv3 * tLen),
      new THREE.Vector3(-inv3 * tLen, -inv3 * tLen, inv3 * tLen),
    ].forEach((pt) => {
      const h = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      h.scale.setScalar(0.11);
      h.position.copy(pt);
      methaneGroup.add(h);
      addBond(new THREE.Vector3(0, 0, 0), pt, methaneGroup, undefined, 0.65);
    });

    bioEntities.push({
      group: methaneGroup,
      basePos: new THREE.Vector3(7.6, -0.8, -2.0),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.5,
      driftPhase: 0.5,
      rotAxis: new THREE.Vector3(0.7, 0.4, 0.5).normalize(),
      rotSpeed: 0.32,
    });

    // Carbon Dioxide (O=C=O)
    const co2Group = new THREE.Group();
    scene.add(co2Group);
    const cCO2 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.45));
    cCO2.scale.setScalar(0.18);
    co2Group.add(cCO2);
    [new THREE.Vector3(-0.8, 0, 0), new THREE.Vector3(0.8, 0, 0)].forEach((oPos) => {
      const om = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
      om.scale.setScalar(0.2);
      om.position.copy(oPos);
      co2Group.add(om);
      addBond(new THREE.Vector3(0, 0, 0), oPos, co2Group, undefined, 0.8);
    });
    bioEntities.push({
      group: co2Group,
      basePos: new THREE.Vector3(1.4, -3.8, -2.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.48,
      driftPhase: 4.4,
      rotAxis: new THREE.Vector3(0.6, 0.6, 0.4).normalize(),
      rotSpeed: 0.3,
    });

    // Ammonia (NH3)
    const ammoniaGroup = new THREE.Group();
    scene.add(ammoniaGroup);
    const nAmm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
    nAmm.scale.setScalar(0.22);
    nAmm.position.set(0, 0.18, 0);
    ammoniaGroup.add(nAmm);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      const hPos = new THREE.Vector3(Math.cos(a) * 0.65, -0.35, Math.sin(a) * 0.65);
      const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      hm.scale.setScalar(0.11);
      hm.position.copy(hPos);
      ammoniaGroup.add(hm);
      addBond(nAmm.position, hPos, ammoniaGroup, undefined, 0.65);
    }
    bioEntities.push({
      group: ammoniaGroup,
      basePos: new THREE.Vector3(4.8, 4.2, -3.4),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.45,
      driftPhase: 2.3,
      rotAxis: new THREE.Vector3(0.3, 1, 0.4).normalize(),
      rotSpeed: 0.28,
    });

    // Ozone (O3 - Bent)
    const ozoneGroup = new THREE.Group();
    scene.add(ozoneGroup);
    const oCentral = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.55));
    oCentral.scale.setScalar(0.18);
    ozoneGroup.add(oCentral);
    [new THREE.Vector3(-0.6, -0.4, 0), new THREE.Vector3(0.6, -0.4, 0)].forEach((op) => {
      const om = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.45));
      om.scale.setScalar(0.16);
      om.position.copy(op);
      ozoneGroup.add(om);
      addBond(new THREE.Vector3(0, 0, 0), op, ozoneGroup, undefined, 0.7);
    });
    bioEntities.push({
      group: ozoneGroup,
      basePos: new THREE.Vector3(-3.2, 0.4, -3.8),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.48,
      driftPhase: 1.1,
      rotAxis: new THREE.Vector3(0.3, 0.7, 0.5).normalize(),
      rotSpeed: 0.32,
    });

    // =========================================================================
    // 18. CYTOPLASMIC BIO-IONS & QUANTUM STARDUST (200+ Sparks: Na+, K+, Ca2+, Mg2+)
    // =========================================================================
    const ionCount = 210;
    const ionPositions = new Float32Array(ionCount * 3);
    const ionColors = new Float32Array(ionCount * 3);
    const ionPalette = [
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x818cf8), // Indigo
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xf59e0b), // Amber
      new THREE.Color(0xf43f5e), // Rose
      new THREE.Color(0xeab308), // Citron
      new THREE.Color(0xa855f7), // Violet
    ];

    for (let i = 0; i < ionCount; i++) {
      const idx = i * 3;
      ionPositions[idx] = (Math.random() - 0.5) * 30;
      ionPositions[idx + 1] = (Math.random() - 0.5) * 20;
      ionPositions[idx + 2] = -5.5 + (Math.random() - 0.5) * 10;

      const col = ionPalette[i % ionPalette.length]!;
      ionColors[idx] = col.r;
      ionColors[idx + 1] = col.g;
      ionColors[idx + 2] = col.b;
    }

    const ionGeo = new THREE.BufferGeometry();
    ionGeo.setAttribute("position", new THREE.BufferAttribute(ionPositions, 3));
    ionGeo.setAttribute("color", new THREE.BufferAttribute(ionColors, 3));

    const ionMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ionField = new THREE.Points(ionGeo, ionMat);
    scene.add(ionField);

    // =========================================================================
    // INTERACTION & ANIMATION LOOP
    // =========================================================================
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetParallaxX = nx * 0.85;
      targetParallaxY = ny * 0.55;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let animId = 0;
    let prevTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = now * 0.001;

      if (!prefersReducedMotion) {
        // Fluid easing camera parallax
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;

        camera.position.x = currentParallaxX;
        camera.position.y = currentParallaxY;
        camera.lookAt(0, 0, -2.5);

        // 1. Autonomous Biochemical Drift & 3D Stereochemical Rotation
        bioEntities.forEach((ent) => {
          const t = elapsed * ent.driftSpeed + ent.driftPhase;
          ent.group.position.x = ent.basePos.x + Math.sin(t) * ent.driftRange.x;
          ent.group.position.y = ent.basePos.y + Math.cos(t * 0.85) * ent.driftRange.y;
          ent.group.position.z = ent.basePos.z + Math.sin(t * 0.7) * ent.driftRange.z;

          ent.group.rotateOnAxis(ent.rotAxis, delta * ent.rotSpeed);
        });

        // 2. Animate Orbiting Quantum Electrons
        orbitingElectrons.forEach((orb) => {
          const angle = orb.phase + elapsed * orb.speed;
          const lx = Math.cos(angle) * orb.rx;
          const ly = Math.sin(angle) * orb.ry;
          const pos = new THREE.Vector3(lx, ly, 0).applyEuler(orb.euler);
          orb.mesh.position.copy(pos);
        });

        // 3. Animate Paramecium Ciliary Ripples
        ciliaryHairs.forEach((c) => {
          const wave = Math.sin(elapsed * 4.5 + c.phase) * 0.06;
          c.mesh.position.x = c.basePos.x + c.dir.y * wave;
          c.mesh.position.y = c.basePos.y - c.dir.x * wave;
        });

        // 4. Gentle cytoplasmic ion drift
        ionField.rotation.y = elapsed * 0.012;
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

      scene.clear();
      sphereGeoStandard.dispose();
      fineBondGeo.dispose();
      ionGeo.dispose();
      ionMat.dispose();
      defaultBondMat.dispose();
      Object.values(matCache).forEach((m) => m.dispose());
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
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none opacity-85 dark:opacity-75 transition-opacity duration-1000 ${className}`}
    >
      {!hasWebGL && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--accent-strong)_0%,transparent_60%)] opacity-30" />
      )}
    </div>
  );
}
