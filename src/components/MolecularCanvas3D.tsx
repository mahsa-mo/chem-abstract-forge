import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Rich, Well-Proportioned Biochemical Microcosm (محیط غنی، خوش‌قواره و متنوع بیوشیمیایی)
 *
 * A densely populated yet harmoniously spaced scientific universe featuring 24+ diverse,
 * authentic biochemical and chemical species with delicate, jewel-like ball-and-stick geometry:
 *
 * 1. Nucleic Acids & Genetics:
 *    - DNA Double-Helix micro-spiral with alternating base pairs
 *    - ATP (Adenosine Triphosphate) with ribose ring and triphosphate chain
 * 2. Cellular & Membrane Biochemistry:
 *    - Phospholipid molecules with polar phosphate heads and dual lipid tails
 *    - Steroid / Cholesterol 4-ring fused framework (phenanthrene + cyclopentane)
 *    - Porphyrin / Heme coordinate ring with central metal ion core
 *    - Peptide / Alpha-helix protein backbone with amino acid residues
 * 3. Micro-Organisms & Nano-Structures:
 *    - Geodesic icosahedral viral capsid / radiolarian mineral nano-cage
 * 4. Quantum Atomic Models:
 *    - Hero Quantum Bohr Atom with 3 inclined elliptical orbits & orbiting electrons
 *    - Two secondary satellite micro-atoms orbiting in background depth
 * 5. Organic & Small Bio-Molecules:
 *    - Benzene aromatic ring with shimmering delocalized pi-cloud
 *    - Glucose pyranose ring in true 3D chair conformation
 *    - Catechol / Phenol aromatic ring
 *    - Methane (CH4) sp3 tetrahedral geometry
 *    - Water dipoles (H2O) with authentic 104.5° angle
 *    - Ammonia (NH3) trigonal pyramidal geometry
 *    - Carbon Dioxide (O=C=O) linear geometry
 *    - Ethanol (C2H5OH) zigzag alkyl chain
 * 6. Cytoplasmic Bio-Ions & Ambient Quantum Stardust (Na+, K+, Mg2+, Ca2+ sparks)
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
    const fineBondGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 12); // Slender, delicate bond rods

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
    const COLOR_CAPSID = 0x8b5cf6; // Viral Capsid (Ethereal Violet)

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

    // =========================================================================
    // 1. DNA DOUBLE-HELIX MICRO-SPIRAL (مارپیچ دوگانه دی‌ان‌ای)
    // =========================================================================
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);
    const dnaSteps = 16;
    const dnaRadius = 0.9;
    const dnaStepHeight = 0.3;
    const strandA: THREE.Vector3[] = [];
    const strandB: THREE.Vector3[] = [];

    for (let i = 0; i < dnaSteps; i++) {
      const angle = i * 0.48;
      const y = (i - dnaSteps / 2) * dnaStepHeight;

      const pA = new THREE.Vector3(Math.cos(angle) * dnaRadius, y, Math.sin(angle) * dnaRadius);
      strandA.push(pA);
      const mA = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_P, 0.45));
      mA.scale.setScalar(0.13);
      mA.position.copy(pA);
      dnaGroup.add(mA);

      const pB = new THREE.Vector3(
        Math.cos(angle + Math.PI) * dnaRadius,
        y,
        Math.sin(angle + Math.PI) * dnaRadius,
      );
      strandB.push(pB);
      const mB = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      mB.scale.setScalar(0.13);
      mB.position.copy(pB);
      dnaGroup.add(mB);

      const rungMat = i % 2 === 0 ? getMat(COLOR_N, 0.35) : getMat(COLOR_O, 0.35);
      addBond(pA, pB, dnaGroup, rungMat, 1.2);
    }
    for (let i = 0; i < dnaSteps - 1; i++) {
      addBond(strandA[i]!, strandA[i + 1]!, dnaGroup, undefined, 0.9);
      addBond(strandB[i]!, strandB[i + 1]!, dnaGroup, undefined, 0.9);
    }

    bioEntities.push({
      group: dnaGroup,
      basePos: new THREE.Vector3(-6.8, 3.6, -3.2),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.35,
      driftPhase: 0,
      rotAxis: new THREE.Vector3(0.2, 1, 0.3).normalize(),
      rotSpeed: 0.25,
    });

    // =========================================================================
    // 2. HERO QUANTUM BOHR ATOM (اتم کوانتومی با مدارهای چرخان و الکترون‌ها)
    // =========================================================================
    const bohrHeroGroup = new THREE.Group();
    scene.add(bohrHeroGroup);

    const nucleusSpheres = [
      [0, 0, 0, COLOR_O],
      [0.14, 0.12, 0.08, COLOR_CAPSID],
      [-0.12, 0.14, -0.1, COLOR_P],
      [0.1, -0.14, 0.12, COLOR_O],
      [-0.12, -0.1, -0.12, COLOR_CAPSID],
      [0.05, 0.16, -0.12, COLOR_P],
    ] as const;

    nucleusSpheres.forEach(([x, y, z, c]) => {
      const s = new THREE.Mesh(sphereGeoStandard, getMat(c, 0.65));
      s.scale.setScalar(0.15);
      s.position.set(x, y, z);
      bohrHeroGroup.add(s);
    });

    const heroOrbits = [
      { rx: 2.1, ry: 0.85, euler: new THREE.Euler(0.85, 0.3, 0), speed: 3.2, col: COLOR_C },
      {
        rx: 2.2,
        ry: 0.9,
        euler: new THREE.Euler(-0.75, 0.7, 0.5),
        speed: -2.8,
        col: COLOR_ELECTRON,
      },
      { rx: 2.3, ry: 0.95, euler: new THREE.Euler(0.2, -0.9, 1.1), speed: 2.5, col: COLOR_LIPID },
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
      eMesh.scale.setScalar(0.09);
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
      basePos: new THREE.Vector3(7.2, 3.5, -2.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.4,
      driftPhase: 1.2,
      rotAxis: new THREE.Vector3(0.3, 1, 0.2).normalize(),
      rotSpeed: 0.2,
    });

    // =========================================================================
    // 3. PORPHYRIN / HEME RING COMPLEX (حلقه پورفیرین با یون آهن مرکزی)
    // =========================================================================
    const hemeGroup = new THREE.Group();
    scene.add(hemeGroup);

    // Central Iron Ion (Fe2+)
    const feMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_FE, 0.75));
    feMesh.scale.setScalar(0.24);
    hemeGroup.add(feMesh);

    // 4 Coordinate Pyrrole Nitrogens
    const nRadius = 0.9;
    const pyrroleNitrogens: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const nPos = new THREE.Vector3(Math.cos(a) * nRadius, Math.sin(a) * nRadius, 0);
      pyrroleNitrogens.push(nPos);

      const nMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
      nMesh.scale.setScalar(0.16);
      nMesh.position.copy(nPos);
      hemeGroup.add(nMesh);

      // Coordinate bond to central Fe
      addBond(new THREE.Vector3(0, 0, 0), nPos, hemeGroup, undefined, 0.8);
    }

    // Outer Porphyrin Carbon Perimeter
    const outerPorphyrinCVecs: THREE.Vector3[] = [];
    const pSteps = 12;
    const pRadius = 1.6;
    for (let i = 0; i < pSteps; i++) {
      const a = (i * 2 * Math.PI) / pSteps;
      const cPos = new THREE.Vector3(
        Math.cos(a) * pRadius,
        Math.sin(a) * pRadius,
        i % 2 === 0 ? 0.08 : -0.08,
      );
      outerPorphyrinCVecs.push(cPos);

      const cMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      cMesh.scale.setScalar(0.14);
      cMesh.position.copy(cPos);
      hemeGroup.add(cMesh);
    }
    for (let i = 0; i < pSteps; i++) {
      addBond(
        outerPorphyrinCVecs[i]!,
        outerPorphyrinCVecs[(i + 1) % pSteps]!,
        hemeGroup,
        undefined,
        0.85,
      );
    }

    bioEntities.push({
      group: hemeGroup,
      basePos: new THREE.Vector3(-3.2, 4.2, -3.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.36,
      driftPhase: 2.1,
      rotAxis: new THREE.Vector3(0.5, 0.7, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // 4. STEROID / CHOLESTEROL 4-RING FUSED SKELETON (اسکلت استروئیدی ۴ حلقه‌ای)
    // =========================================================================
    const steroidGroup = new THREE.Group();
    scene.add(steroidGroup);

    // 4 fused rings (A, B, C: 6-membered, D: 5-membered)
    const steroidCenters = [
      new THREE.Vector3(-1.2, 0, 0), // Ring A
      new THREE.Vector3(0, 0, 0), // Ring B
      new THREE.Vector3(1.2, 0.4, 0), // Ring C
      new THREE.Vector3(2.3, 0.8, 0), // Ring D (5-membered)
    ];

    steroidCenters.forEach((center, idx) => {
      const count = idx === 3 ? 5 : 6;
      const r = idx === 3 ? 0.55 : 0.62;
      const ringPts: THREE.Vector3[] = [];
      for (let k = 0; k < count; k++) {
        const a = (k * 2 * Math.PI) / count;
        const pt = new THREE.Vector3(
          center.x + Math.cos(a) * r,
          center.y + Math.sin(a) * r,
          k % 2 === 0 ? 0.06 : -0.06,
        );
        ringPts.push(pt);
        const m = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
        m.scale.setScalar(0.12);
        m.position.copy(pt);
        steroidGroup.add(m);
      }
      for (let k = 0; k < count; k++) {
        addBond(ringPts[k]!, ringPts[(k + 1) % count]!, steroidGroup, undefined, 0.8);
      }
    });

    // Hydroxyl group (-OH) on Ring A
    const ohPos = new THREE.Vector3(-1.8, -0.5, 0.1);
    const ohMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.55));
    ohMesh.scale.setScalar(0.18);
    ohMesh.position.copy(ohPos);
    steroidGroup.add(ohMesh);
    addBond(new THREE.Vector3(-1.2, 0, 0), ohPos, steroidGroup, undefined, 0.85);

    bioEntities.push({
      group: steroidGroup,
      basePos: new THREE.Vector3(5.6, -0.6, -2.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.38,
      driftPhase: 3.2,
      rotAxis: new THREE.Vector3(0.4, -0.8, 0.4).normalize(),
      rotSpeed: 0.22,
    });

    // =========================================================================
    // 5. GLUCOSE PYRANOSE CHAIR CONFORMATION (گلوکز در فرم صندلی سه‌بعدی)
    // =========================================================================
    const glucoseGroup = new THREE.Group();
    scene.add(glucoseGroup);

    const chairCoords = [
      new THREE.Vector3(-0.9, 0.35, 0.25), // C1
      new THREE.Vector3(-0.35, 0.9, -0.25), // C2
      new THREE.Vector3(0.7, 0.7, 0.25), // C3
      new THREE.Vector3(0.95, -0.25, -0.25), // C4
      new THREE.Vector3(0.35, -0.8, 0.25), // C5
      new THREE.Vector3(-0.6, -0.6, -0.25), // Ring Oxygen
    ];

    chairCoords.forEach((pt, idx) => {
      const isO = idx === 5;
      const m = new THREE.Mesh(sphereGeoStandard, getMat(isO ? COLOR_O : COLOR_C, 0.4));
      m.scale.setScalar(isO ? 0.2 : 0.16);
      m.position.copy(pt);
      glucoseGroup.add(m);
    });
    for (let i = 0; i < chairCoords.length; i++) {
      addBond(
        chairCoords[i]!,
        chairCoords[(i + 1) % chairCoords.length]!,
        glucoseGroup,
        undefined,
        0.85,
      );
    }

    bioEntities.push({
      group: glucoseGroup,
      basePos: new THREE.Vector3(1.8, 4.4, -3.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.42,
      driftPhase: 4.1,
      rotAxis: new THREE.Vector3(0.6, 0.5, 0.4).normalize(),
      rotSpeed: 0.26,
    });

    // =========================================================================
    // 6. ATP (ADENOSINE TRIPHOSPHATE) CELLULAR ENERGY MOLECULE (مولکول انرژی ATP)
    // =========================================================================
    const atpGroup = new THREE.Group();
    scene.add(atpGroup);

    // Ribose ring
    const riboseRadius = 0.58;
    const ribosePts: THREE.Vector3[] = [];
    for (let r = 0; r < 5; r++) {
      const a = (r * 2 * Math.PI) / 5 - Math.PI / 2;
      const v = new THREE.Vector3(Math.cos(a) * riboseRadius, Math.sin(a) * riboseRadius, 0);
      ribosePts.push(v);
      const m = new THREE.Mesh(sphereGeoStandard, getMat(r === 0 ? COLOR_O : COLOR_C, 0.4));
      m.scale.setScalar(0.14);
      m.position.copy(v);
      atpGroup.add(m);
    }
    for (let r = 0; r < 5; r++) {
      addBond(ribosePts[r]!, ribosePts[(r + 1) % 5]!, atpGroup, undefined, 0.8);
    }

    // Triphosphate chain (3 glowing phosphate cores)
    let prevPhos = new THREE.Vector3(ribosePts[1]!.x + 0.45, ribosePts[1]!.y + 0.25, 0);
    for (let p = 0; p < 3; p++) {
      const curPhos = new THREE.Vector3(
        prevPhos.x + 0.6,
        prevPhos.y + (p % 2 === 0 ? 0.2 : -0.2),
        0.08 * p,
      );
      const pm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_P, 0.65));
      pm.scale.setScalar(0.2);
      pm.position.copy(curPhos);
      atpGroup.add(pm);

      // Oxygen terminal
      const oxPos = new THREE.Vector3(curPhos.x, curPhos.y + 0.35, 0);
      const ox = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.4));
      ox.scale.setScalar(0.12);
      ox.position.copy(oxPos);
      atpGroup.add(ox);
      addBond(curPhos, oxPos, atpGroup, undefined, 0.75);

      addBond(prevPhos, curPhos, atpGroup, undefined, 1.0);
      prevPhos = curPhos;
    }

    // Adenine base node
    const adeMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
    adeMesh.scale.setScalar(0.18);
    adeMesh.position.set(ribosePts[4]!.x - 0.55, ribosePts[4]!.y + 0.35, 0);
    atpGroup.add(adeMesh);
    addBond(ribosePts[4]!, adeMesh.position, atpGroup, undefined, 0.85);

    bioEntities.push({
      group: atpGroup,
      basePos: new THREE.Vector3(-4.8, -4.2, -2.8),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.38,
      driftPhase: 5.0,
      rotAxis: new THREE.Vector3(0.3, 0.8, -0.4).normalize(),
      rotSpeed: 0.24,
    });

    // =========================================================================
    // 7. PHOSPHOLIPID MOLECULES (DUO) (فسفولیپیدهای غشای سلولی)
    // =========================================================================
    function buildPhospholipid(baseOffset: THREE.Vector3): THREE.Group {
      const g = new THREE.Group();
      g.position.copy(baseOffset);

      // Polar phosphate head
      const hMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_P, 0.55));
      hMesh.scale.setScalar(0.26);
      hMesh.position.set(0, 1.1, 0);
      g.add(hMesh);

      // Glycerol neck
      const neckMesh = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.4));
      neckMesh.scale.setScalar(0.18);
      neckMesh.position.set(0, 0.65, 0);
      g.add(neckMesh);
      addBond(hMesh.position, neckMesh.position, g, undefined, 1.0);

      // Dual hydrophobic tails
      let pA = new THREE.Vector3(-0.2, 0.5, 0);
      let pB = new THREE.Vector3(0.2, 0.5, 0);
      for (let t = 0; t < 6; t++) {
        const y = 0.5 - (t + 1) * 0.24;
        const cA = new THREE.Vector3(-0.2 + Math.sin(t * 1.5) * 0.14, y, Math.cos(t * 1.2) * 0.1);
        const cB = new THREE.Vector3(
          0.2 + (t === 3 ? 0.28 : Math.sin(t * 1.4) * 0.14),
          y,
          Math.sin(t * 1.3) * 0.1,
        );

        const mA = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_LIPID, 0.35));
        mA.scale.setScalar(0.1);
        mA.position.copy(cA);
        g.add(mA);

        const mB = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_LIPID, 0.35));
        mB.scale.setScalar(0.1);
        mB.position.copy(cB);
        g.add(mB);

        addBond(pA, cA, g, undefined, 0.75);
        addBond(pB, cB, g, undefined, 0.75);
        pA = cA;
        pB = cB;
      }
      return g;
    }

    const lipid1 = buildPhospholipid(new THREE.Vector3(0, 0, 0));
    const lipid1Parent = new THREE.Group();
    lipid1Parent.add(lipid1);
    scene.add(lipid1Parent);

    bioEntities.push({
      group: lipid1Parent,
      basePos: new THREE.Vector3(-7.2, -1.2, -2.6),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.45,
      driftPhase: 1.8,
      rotAxis: new THREE.Vector3(0.2, 0.9, -0.3).normalize(),
      rotSpeed: 0.25,
    });

    const lipid2 = buildPhospholipid(new THREE.Vector3(0, 0, 0));
    const lipid2Parent = new THREE.Group();
    lipid2Parent.add(lipid2);
    scene.add(lipid2Parent);

    bioEntities.push({
      group: lipid2Parent,
      basePos: new THREE.Vector3(-6.2, -2.8, -3.4),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.4,
      driftPhase: 3.6,
      rotAxis: new THREE.Vector3(-0.3, 0.8, 0.4).normalize(),
      rotSpeed: 0.28,
    });

    // =========================================================================
    // 8. VIRAL ICOSAHEDRAL CAPSID / NANO-CAGE (کپسید ویروسی بلورین)
    // =========================================================================
    const capsidGroup = new THREE.Group();
    scene.add(capsidGroup);

    const icosaGeo = new THREE.IcosahedronGeometry(1.05, 0);
    const icosaWireGeo = new THREE.WireframeGeometry(icosaGeo);
    const icosaMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const icosaWire = new THREE.LineSegments(icosaWireGeo, icosaMat);
    capsidGroup.add(icosaWire);

    // Capsomer vertices
    const posAttr = icosaGeo.getAttribute("position");
    const uniqueKeys = new Set<string>();
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const k = `${v.x.toFixed(2)}_${v.y.toFixed(2)}_${v.z.toFixed(2)}`;
      if (!uniqueKeys.has(k)) {
        uniqueKeys.add(k);
        const bead = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_CAPSID, 0.55));
        bead.scale.setScalar(0.09);
        bead.position.copy(v);
        capsidGroup.add(bead);
      }
    }

    // Inner RNA core
    const innerRNA = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
      }),
    );
    capsidGroup.add(innerRNA);

    bioEntities.push({
      group: capsidGroup,
      basePos: new THREE.Vector3(5.2, -4.2, -3.2),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.35,
      driftPhase: 2.7,
      rotAxis: new THREE.Vector3(0.5, 0.6, 0.4).normalize(),
      rotSpeed: 0.2,
    });

    // =========================================================================
    // 9. BENZENE WITH DELOCALIZED PI-ELECTRON RESONANCE TORUS (حلقه بنزن)
    // =========================================================================
    const benzeneGroup = new THREE.Group();
    scene.add(benzeneGroup);

    const bCRad = 1.05;
    const bHRad = 1.65;
    const bCVecs: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const c = new THREE.Vector3(Math.cos(a) * bCRad, Math.sin(a) * bCRad, 0);
      bCVecs.push(c);
      const cm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.4));
      cm.scale.setScalar(0.16);
      cm.position.copy(c);
      benzeneGroup.add(cm);

      const h = new THREE.Vector3(Math.cos(a) * bHRad, Math.sin(a) * bHRad, 0);
      const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      hm.scale.setScalar(0.11);
      hm.position.copy(h);
      benzeneGroup.add(hm);

      addBond(c, h, benzeneGroup, undefined, 0.7);
    }
    for (let i = 0; i < 6; i++) {
      addBond(bCVecs[i]!, bCVecs[(i + 1) % 6]!, benzeneGroup, undefined, 0.9);
    }

    const bTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.025, 16, 40),
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
      basePos: new THREE.Vector3(-1.8, -4.5, -2.8),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.42,
      driftPhase: 4.8,
      rotAxis: new THREE.Vector3(0.4, 0.8, -0.4).normalize(),
      rotSpeed: 0.28,
    });

    // =========================================================================
    // 10. SECONDARY SATELLITE QUANTUM ATOM (اتم چرخان ماهواره‌ای در عمق پس‌زمینه)
    // =========================================================================
    const satAtomGroup = new THREE.Group();
    scene.add(satAtomGroup);

    const satCore = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_CAPSID, 0.75));
    satCore.scale.setScalar(0.2);
    satAtomGroup.add(satCore);

    const satOrbits = [
      { rx: 1.4, ry: 0.6, euler: new THREE.Euler(0.7, 0.4, 0), speed: 4.0, col: COLOR_C },
      {
        rx: 1.5,
        ry: 0.65,
        euler: new THREE.Euler(-0.6, -0.5, 0.8),
        speed: -3.4,
        col: COLOR_ELECTRON,
      },
    ];

    satOrbits.forEach((cfg, idx) => {
      const c = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
      const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(40));
      const line = new THREE.LineLoop(
        g,
        new THREE.LineBasicMaterial({ color: cfg.col, transparent: true, opacity: 0.45 }),
      );
      line.rotation.copy(cfg.euler);
      satAtomGroup.add(line);

      const em = new THREE.Mesh(sphereGeoStandard, getMat(cfg.col, 0.9));
      em.scale.setScalar(0.075);
      satAtomGroup.add(em);

      orbitingElectrons.push({
        mesh: em,
        rx: cfg.rx,
        ry: cfg.ry,
        speed: cfg.speed,
        phase: idx * Math.PI,
        parent: satAtomGroup,
        euler: cfg.euler,
      });
    });

    bioEntities.push({
      group: satAtomGroup,
      basePos: new THREE.Vector3(2.6, 2.5, -4.8),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.4,
      driftPhase: 0.9,
      rotAxis: new THREE.Vector3(0.3, 1, 0.2).normalize(),
      rotSpeed: 0.25,
    });

    // =========================================================================
    // 11. DIVERSE SMALL CHEMICAL MOLECULES (مولکول‌های کوچک متنوع با فاصله متناسب)
    // =========================================================================
    // Methane (CH4)
    const methaneGroup = new THREE.Group();
    scene.add(methaneGroup);
    const mC = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.45));
    mC.scale.setScalar(0.22);
    methaneGroup.add(mC);
    const inv3 = 1 / Math.sqrt(3);
    const tLen = 0.85;
    [
      new THREE.Vector3(inv3 * tLen, inv3 * tLen, inv3 * tLen),
      new THREE.Vector3(inv3 * tLen, -inv3 * tLen, -inv3 * tLen),
      new THREE.Vector3(-inv3 * tLen, inv3 * tLen, -inv3 * tLen),
      new THREE.Vector3(-inv3 * tLen, -inv3 * tLen, inv3 * tLen),
    ].forEach((pt) => {
      const h = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      h.scale.setScalar(0.12);
      h.position.copy(pt);
      methaneGroup.add(h);
      addBond(new THREE.Vector3(0, 0, 0), pt, methaneGroup, undefined, 0.7);
    });

    bioEntities.push({
      group: methaneGroup,
      basePos: new THREE.Vector3(7.4, -0.6, -1.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.5,
      driftPhase: 0.5,
      rotAxis: new THREE.Vector3(0.7, 0.4, 0.5).normalize(),
      rotSpeed: 0.32,
    });

    // Water Dipole 1 (H2O)
    function buildWater(): THREE.Group {
      const wg = new THREE.Group();
      const ox = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
      ox.scale.setScalar(0.25);
      wg.add(ox);
      const halfAngle = (52.25 * Math.PI) / 180;
      const bLen = 0.88;
      const h1 = new THREE.Vector3(Math.sin(halfAngle) * bLen, -Math.cos(halfAngle) * bLen, 0);
      const h2 = new THREE.Vector3(-Math.sin(halfAngle) * bLen, -Math.cos(halfAngle) * bLen, 0);
      [h1, h2].forEach((hPos) => {
        const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.28));
        hm.scale.setScalar(0.13);
        hm.position.copy(hPos);
        wg.add(hm);
        addBond(new THREE.Vector3(0, 0, 0), hPos, wg, undefined, 0.7);
      });
      return wg;
    }

    const water1 = buildWater();
    scene.add(water1);
    bioEntities.push({
      group: water1,
      basePos: new THREE.Vector3(-1.4, 3.2, -1.8),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.52,
      driftPhase: 1.4,
      rotAxis: new THREE.Vector3(0.4, 0.8, 0.4).normalize(),
      rotSpeed: 0.3,
    });

    // Water Dipole 2 (H2O)
    const water2 = buildWater();
    scene.add(water2);
    bioEntities.push({
      group: water2,
      basePos: new THREE.Vector3(3.8, 0.8, -2.6),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.48,
      driftPhase: 3.1,
      rotAxis: new THREE.Vector3(-0.3, 0.7, 0.5).normalize(),
      rotSpeed: 0.34,
    });

    // Ammonia Molecule (NH3 - Trigonal Pyramidal)
    const ammoniaGroup = new THREE.Group();
    scene.add(ammoniaGroup);
    const nAmmonia = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_N, 0.5));
    nAmmonia.scale.setScalar(0.24);
    nAmmonia.position.set(0, 0.2, 0);
    ammoniaGroup.add(nAmmonia);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      const hPos = new THREE.Vector3(Math.cos(a) * 0.7, -0.4, Math.sin(a) * 0.7);
      const hm = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
      hm.scale.setScalar(0.12);
      hm.position.copy(hPos);
      ammoniaGroup.add(hm);
      addBond(nAmmonia.position, hPos, ammoniaGroup, undefined, 0.7);
    }
    bioEntities.push({
      group: ammoniaGroup,
      basePos: new THREE.Vector3(4.8, 3.8, -3.4),
      driftRange: new THREE.Vector3(0.4, 0.4, 0.3),
      driftSpeed: 0.45,
      driftPhase: 2.3,
      rotAxis: new THREE.Vector3(0.3, 1, 0.4).normalize(),
      rotSpeed: 0.28,
    });

    // Carbon Dioxide (O=C=O Linear)
    const co2Group = new THREE.Group();
    scene.add(co2Group);
    const cCO2 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.45));
    cCO2.scale.setScalar(0.2);
    co2Group.add(cCO2);
    const oCO2_1 = new THREE.Vector3(-0.85, 0, 0);
    const oCO2_2 = new THREE.Vector3(0.85, 0, 0);
    [oCO2_1, oCO2_2].forEach((oPos) => {
      const om = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
      om.scale.setScalar(0.22);
      om.position.copy(oPos);
      co2Group.add(om);
      addBond(new THREE.Vector3(0, 0, 0), oPos, co2Group, undefined, 0.85);
    });
    bioEntities.push({
      group: co2Group,
      basePos: new THREE.Vector3(1.6, -3.8, -2.4),
      driftRange: new THREE.Vector3(0.5, 0.4, 0.3),
      driftSpeed: 0.48,
      driftPhase: 4.4,
      rotAxis: new THREE.Vector3(0.6, 0.6, 0.4).normalize(),
      rotSpeed: 0.3,
    });

    // Ethanol (CH3-CH2-OH)
    const ethanolGroup = new THREE.Group();
    scene.add(ethanolGroup);
    const ethC1 = new THREE.Vector3(-0.65, -0.2, 0);
    const ethC2 = new THREE.Vector3(0.25, 0.3, 0);
    const ethO = new THREE.Vector3(1.1, -0.3, 0.1);
    const ethH = new THREE.Vector3(1.6, 0.1, -0.1);

    const mC1 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
    mC1.scale.setScalar(0.18);
    mC1.position.copy(ethC1);
    ethanolGroup.add(mC1);

    const mC2 = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_C, 0.35));
    mC2.scale.setScalar(0.18);
    mC2.position.copy(ethC2);
    ethanolGroup.add(mC2);
    addBond(ethC1, ethC2, ethanolGroup, undefined, 0.8);

    const mO = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_O, 0.5));
    mO.scale.setScalar(0.22);
    mO.position.copy(ethO);
    ethanolGroup.add(mO);
    addBond(ethC2, ethO, ethanolGroup, undefined, 0.8);

    const mH = new THREE.Mesh(sphereGeoStandard, getMat(COLOR_H, 0.25));
    mH.scale.setScalar(0.12);
    mH.position.copy(ethH);
    ethanolGroup.add(mH);
    addBond(ethO, ethH, ethanolGroup, undefined, 0.7);

    bioEntities.push({
      group: ethanolGroup,
      basePos: new THREE.Vector3(-4.5, 0.6, -2.2),
      driftRange: new THREE.Vector3(0.4, 0.5, 0.3),
      driftSpeed: 0.44,
      driftPhase: 5.1,
      rotAxis: new THREE.Vector3(0.4, 0.8, -0.4).normalize(),
      rotSpeed: 0.26,
    });

    // =========================================================================
    // 12. CYTOPLASMIC BIO-IONS & QUANTUM STARDUST (Na+, K+, Ca2+, Mg2+)
    // =========================================================================
    const ionCount = 160;
    const ionPositions = new Float32Array(ionCount * 3);
    const ionColors = new Float32Array(ionCount * 3);
    const ionPalette = [
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x818cf8), // Indigo
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xf59e0b), // Amber
      new THREE.Color(0xf43f5e), // Rose
      new THREE.Color(0xeab308), // Citron
    ];

    for (let i = 0; i < ionCount; i++) {
      const idx = i * 3;
      ionPositions[idx] = (Math.random() - 0.5) * 28;
      ionPositions[idx + 1] = (Math.random() - 0.5) * 18;
      ionPositions[idx + 2] = -5 + (Math.random() - 0.5) * 9;

      const col = ionPalette[i % ionPalette.length]!;
      ionColors[idx] = col.r;
      ionColors[idx + 1] = col.g;
      ionColors[idx + 2] = col.b;
    }

    const ionGeo = new THREE.BufferGeometry();
    ionGeo.setAttribute("position", new THREE.BufferAttribute(ionPositions, 3));
    ionGeo.setAttribute("color", new THREE.BufferAttribute(ionColors, 3));

    const ionMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
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

        // 3. Gentle cytoplasmic ion drift
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
      icosaGeo.dispose();
      icosaWireGeo.dispose();
      icosaMat.dispose();
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
