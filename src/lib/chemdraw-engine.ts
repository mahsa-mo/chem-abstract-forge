export type BondType = "single" | "double" | "triple" | "wedge" | "dash" | "wavy";

export interface ChemAtom {
  id: string;
  element: string;
  x: number;
  y: number;
  charge?: number;
}

export interface ChemBond {
  id: string;
  from: string;
  to: string;
  type: BondType;
}

export interface ChemGraph {
  atoms: ChemAtom[];
  bonds: ChemBond[];
}

export const CPK_ATOM_COLORS: Record<string, string> = {
  C: "#0f172a",
  N: "#2563eb",
  O: "#e11d48",
  S: "#ca8a04",
  P: "#ea580c",
  F: "#10b981",
  Cl: "#16a34a",
  Br: "#9333ea",
  I: "#7e22ce",
  B: "#fb7185",
  Pd: "#06b6d4",
  OH: "#e11d48",
  NH2: "#2563eb",
  NO2: "#2563eb",
  COOH: "#e11d48",
  OMe: "#e11d48",
  CF3: "#10b981",
  CN: "#2563eb",
};

const STANDARD_VALENCE: Record<string, number> = {
  C: 4,
  N: 3,
  O: 2,
  S: 2,
  P: 3,
  B: 3,
  F: 1,
  Cl: 1,
  Br: 1,
  I: 1,
  H: 1,
};

const ELEMENT_MASSES: Record<string, number> = {
  H: 1.008,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Br: 79.904,
  Pd: 106.42,
  I: 126.9,
};

export const BOND_LENGTH = 52;

// Compute Molecular Formula (with implicit hydrogens) and Molecular Weight from 2D Graph
export function computeGraphFormulaAndMw(graph: ChemGraph): {
  formula: string;
  mw: number;
  atomCount: number;
  ringCount: number;
} {
  if (graph.atoms.length === 0) {
    return { formula: "—", mw: 0, atomCount: 0, ringCount: 0 };
  }

  const counts: Record<string, number> = {};
  const addEl = (el: string, n: number) => {
    if (n <= 0) return;
    counts[el] = (counts[el] || 0) + n;
  };

  for (const atom of graph.atoms) {
    // Calculate sum of bond orders incident to this atom
    let bondOrderSum = 0;
    for (const b of graph.bonds) {
      if (b.from === atom.id || b.to === atom.id) {
        bondOrderSum += b.type === "double" ? 2 : b.type === "triple" ? 3 : 1;
      }
    }

    // Handle functional group superatoms
    if (atom.element === "OH") {
      addEl("O", 1);
      addEl("H", 1);
    } else if (atom.element === "NH2") {
      addEl("N", 1);
      addEl("H", 2);
    } else if (atom.element === "NO2") {
      addEl("N", 1);
      addEl("O", 2);
    } else if (atom.element === "COOH") {
      addEl("C", 1);
      addEl("O", 2);
      addEl("H", 1);
    } else if (atom.element === "OMe") {
      addEl("C", 1);
      addEl("O", 1);
      addEl("H", 3);
    } else if (atom.element === "CF3") {
      addEl("C", 1);
      addEl("F", 3);
    } else if (atom.element === "CN") {
      addEl("C", 1);
      addEl("N", 1);
    } else {
      addEl(atom.element, 1);
      const val = STANDARD_VALENCE[atom.element];
      if (val !== undefined) {
        const implicitH = Math.max(0, val - bondOrderSum - (atom.charge || 0));
        addEl("H", implicitH);
      }
    }
  }

  // Format in Hill System: C first, then H, then alphabetical
  const keys = Object.keys(counts);
  const ordered: string[] = [];
  if (counts["C"]) {
    ordered.push("C");
    if (counts["H"]) ordered.push("H");
  }
  keys
    .filter((k) => k !== "C" && k !== "H")
    .sort()
    .forEach((k) => ordered.push(k));
  if (!counts["C"] && counts["H"]) ordered.push("H");

  const formula = ordered.map((el) => `${el}${counts[el] > 1 ? counts[el] : ""}`).join("");

  let mw = 0;
  for (const [el, cnt] of Object.entries(counts)) {
    mw += (ELEMENT_MASSES[el] || 12) * cnt;
  }

  // Euler characteristic for rings: R = Edges - Vertices + Components (approx 1)
  const ringCount = Math.max(0, graph.bonds.length - graph.atoms.length + 1);

  return {
    formula: formula || "—",
    mw: Number(mw.toFixed(2)),
    atomCount: graph.atoms.length,
    ringCount,
  };
}

// Convert 2D Molecular Graph to Canonical-like SMILES
export function graphToSmiles(graph: ChemGraph): string {
  if (graph.atoms.length === 0) return "";

  const adj = new Map<string, { to: string; bond: ChemBond }[]>();
  for (const a of graph.atoms) adj.set(a.id, []);
  for (const b of graph.bonds) {
    adj.get(b.from)?.push({ to: b.to, bond: b });
    adj.get(b.to)?.push({ to: b.from, bond: b });
  }

  const atomById = new Map(graph.atoms.map((a) => [a.id, a]));
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const usedEdges = new Set<string>();
  const ringClosures = new Map<string, { num: number; bondSymbol: string }[]>();
  let ringCounter = 1;

  // First pass DFS to identify ring-closure back-edges
  function findRings(u: string) {
    visited.add(u);
    const neighbors = adj.get(u) || [];
    for (const { to: v, bond } of neighbors) {
      if (usedEdges.has(bond.id)) continue;
      if (!visited.has(v)) {
        usedEdges.add(bond.id);
        parent.set(v, u);
        findRings(v);
      } else if (parent.get(u) !== v) {
        // Found a cycle back-edge
        usedEdges.add(bond.id);
        const rNum = ringCounter++;
        const bSym = bond.type === "double" ? "=" : bond.type === "triple" ? "#" : "";
        if (!ringClosures.has(u)) ringClosures.set(u, []);
        if (!ringClosures.has(v)) ringClosures.set(v, []);
        ringClosures.get(u)!.push({ num: rNum, bondSymbol: bSym });
        ringClosures.get(v)!.push({ num: rNum, bondSymbol: "" });
      }
    }
  }

  // Second pass DFS to build SMILES string
  const visitedBuild = new Set<string>();
  const builtEdges = new Set<string>();

  function formatAtomSmiles(a: ChemAtom): string {
    switch (a.element) {
      case "C":
        return "C";
      case "N":
        return "N";
      case "O":
        return "O";
      case "S":
        return "S";
      case "P":
        return "P";
      case "F":
        return "F";
      case "Cl":
        return "Cl";
      case "Br":
        return "Br";
      case "I":
        return "I";
      case "B":
        return "B";
      case "OH":
        return "O";
      case "NH2":
        return "N";
      case "NO2":
        return "[N+](=O)[O-]";
      case "COOH":
        return "C(=O)O";
      case "OMe":
        return "OC";
      case "CF3":
        return "C(F)(F)F";
      case "CN":
        return "C#N";
      default:
        return `[${a.element}]`;
    }
  }

  function buildTree(u: string, incomingBond?: ChemBond): string {
    visitedBuild.add(u);
    const atom = atomById.get(u)!;
    let prefix = "";
    if (incomingBond) {
      if (incomingBond.type === "double") prefix = "=";
      else if (incomingBond.type === "triple") prefix = "#";
    }

    const closures = (ringClosures.get(u) || []).map((c) => `${c.bondSymbol}${c.num}`).join("");

    const children: { to: string; bond: ChemBond }[] = [];
    for (const edge of adj.get(u) || []) {
      const isClosure = (ringClosures.get(u) || []).some((rc) =>
        (ringClosures.get(edge.to) || []).some((rc2) => rc2.num === rc.num),
      );
      if (isClosure || builtEdges.has(edge.bond.id) || visitedBuild.has(edge.to)) continue;
      builtEdges.add(edge.bond.id);
      children.push(edge);
    }

    const childStrings = children.map((ch, idx) => {
      const sub = buildTree(ch.to, ch.bond);
      return idx < children.length - 1 ? `(${sub})` : sub;
    });

    return `${prefix}${formatAtomSmiles(atom)}${closures}${childStrings.join("")}`;
  }

  const components: string[] = [];
  for (const a of graph.atoms) {
    if (!visited.has(a.id)) {
      findRings(a.id);
      components.push(buildTree(a.id));
    }
  }

  return components.join(".");
}

// Create a regular polygon ring at (cx, cy) or fused to an existing bond
export function generateRingTemplate(
  kind: "benzene" | "cyclohexane" | "cyclopentane" | "pyridine" | "naphthalene" | "indole",
  cx: number,
  cy: number,
): ChemGraph {
  const r = BOND_LENGTH;
  const uid = () => Math.random().toString(36).slice(2, 9);

  if (kind === "naphthalene") {
    // Two fused 6-membered rings
    const g1 = generateRingTemplate("benzene", cx - r * 0.866, cy);
    const aRightTop = g1.atoms[0];
    const aRightBot = g1.atoms[1];
    const dx = aRightBot.x - aRightTop.x;
    const dy = aRightBot.y - aRightTop.y;
    const baseAngle = Math.atan2(dy, dx);

    const newAtoms: ChemAtom[] = [];
    const prevId = aRightBot.id;
    let currX = aRightBot.x;
    let currY = aRightBot.y;

    for (let k = 1; k <= 4; k++) {
      const ang = baseAngle - (k * Math.PI) / 3;
      currX += r * Math.cos(ang);
      currY += r * Math.sin(ang);
      const id = `a-${uid()}-${k}`;
      newAtoms.push({ id, element: "C", x: currX, y: currY });
    }

    const newBonds: ChemBond[] = [
      { id: `b-${uid()}-1`, from: prevId, to: newAtoms[0].id, type: "single" },
      { id: `b-${uid()}-2`, from: newAtoms[0].id, to: newAtoms[1].id, type: "double" },
      { id: `b-${uid()}-3`, from: newAtoms[1].id, to: newAtoms[2].id, type: "single" },
      { id: `b-${uid()}-4`, from: newAtoms[2].id, to: newAtoms[3].id, type: "double" },
      { id: `b-${uid()}-5`, from: newAtoms[3].id, to: aRightTop.id, type: "single" },
    ];

    return {
      atoms: [...g1.atoms, ...newAtoms],
      bonds: [...g1.bonds, ...newBonds],
    };
  }

  if (kind === "indole") {
    // Benzene fused to pyrrole
    const g1 = generateRingTemplate("benzene", cx - r * 0.8, cy);
    const topAtom = g1.atoms[0];
    const botAtom = g1.atoms[1];
    const nAtom: ChemAtom = {
      id: `a-${uid()}-N`,
      element: "N",
      x: botAtom.x + r * 0.95,
      y: botAtom.y - r * 0.31,
    };
    const c2Atom: ChemAtom = {
      id: `a-${uid()}-C2`,
      element: "C",
      x: topAtom.x + r * 1.35,
      y: (topAtom.y + botAtom.y) / 2,
    };
    const c3Atom: ChemAtom = {
      id: `a-${uid()}-C3`,
      element: "C",
      x: topAtom.x + r * 0.95,
      y: topAtom.y + r * 0.31,
    };
    return {
      atoms: [...g1.atoms, nAtom, c2Atom, c3Atom],
      bonds: [
        ...g1.bonds,
        { id: `b-${uid()}-1`, from: botAtom.id, to: nAtom.id, type: "single" },
        { id: `b-${uid()}-2`, from: nAtom.id, to: c2Atom.id, type: "single" },
        { id: `b-${uid()}-3`, from: c2Atom.id, to: c3Atom.id, type: "double" },
        { id: `b-${uid()}-4`, from: c3Atom.id, to: topAtom.id, type: "single" },
      ],
    };
  }

  const n = kind === "cyclopentane" ? 5 : 6;
  const radius = r / (2 * Math.sin(Math.PI / n));
  const atoms: ChemAtom[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 6 + (i * 2 * Math.PI) / n;
    atoms.push({
      id: `a-${uid()}-${i}`,
      element: kind === "pyridine" && i === 2 ? "N" : "C",
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  const bonds: ChemBond[] = [];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const isDouble = (kind === "benzene" || kind === "pyridine") && i % 2 === 0;
    bonds.push({
      id: `b-${uid()}-${i}`,
      from: atoms[i].id,
      to: atoms[next].id,
      type: isDouble ? "double" : "single",
    });
  }

  return { atoms, bonds };
}

// Fuse a new N-membered ring onto an existing bond (a1 -> a2) away from existing centroid
export function fuseRingToBond(
  graph: ChemGraph,
  bond: ChemBond,
  kind: "benzene" | "cyclohexane" | "cyclopentane" | "pyridine",
): ChemGraph {
  const a1 = graph.atoms.find((a) => a.id === bond.from);
  const a2 = graph.atoms.find((a) => a.id === bond.to);
  if (!a1 || !a2) return graph;

  const n = kind === "cyclopentane" ? 5 : 6;
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Determine which side of a1->a2 is "outward" away from existing atoms
  const midX = (a1.x + a2.x) / 2;
  const midY = (a1.y + a2.y) / 2;
  const centroidX = graph.atoms.reduce((s, a) => s + a.x, 0) / graph.atoms.length;
  const centroidY = graph.atoms.reduce((s, a) => s + a.y, 0) / graph.atoms.length;

  const dx = a2.x - a1.x;
  const dy = a2.y - a1.y;
  const len = Math.hypot(dx, dy) || BOND_LENGTH;
  const nx = -dy / len;
  const ny = dx / len;

  // Dot product with vector from centroid to midpoint
  const dot = nx * (midX - centroidX) + ny * (midY - centroidY);
  const dir = dot >= 0 ? 1 : -1;

  const baseAngle = Math.atan2(dy, dx);
  const turnStep = (dir * (2 * Math.PI)) / n;

  const newAtoms: ChemAtom[] = [];
  let currX = a2.x;
  let currY = a2.y;
  let currAngle = baseAngle;

  for (let i = 1; i <= n - 2; i++) {
    currAngle += turnStep;
    currX += len * Math.cos(currAngle);
    currY += len * Math.sin(currAngle);
    newAtoms.push({
      id: `a-${uid()}-${i}`,
      element: kind === "pyridine" && i === 2 ? "N" : "C",
      x: currX,
      y: currY,
    });
  }

  const chainIds = [a2.id, ...newAtoms.map((a) => a.id), a1.id];
  const newBonds: ChemBond[] = [];
  for (let i = 0; i < chainIds.length - 1; i++) {
    const isDouble = (kind === "benzene" || kind === "pyridine") && i % 2 === 1;
    newBonds.push({
      id: `b-${uid()}-${i}`,
      from: chainIds[i],
      to: chainIds[i + 1],
      type: isDouble ? "double" : "single",
    });
  }

  return {
    atoms: [...graph.atoms, ...newAtoms],
    bonds: [...graph.bonds, ...newBonds],
  };
}

// Curated preset 2D structures & general SMILES parser
export function smilesToGraph(smilesInput: string, centerX = 380, centerY = 230): ChemGraph {
  const s = smilesInput.trim();
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Preset 1: Aspirin CC(=O)Oc1ccccc1C(=O)O
  if (s === "CC(=O)Oc1ccccc1C(=O)O" || s.toLowerCase() === "aspirin") {
    const ring = generateRingTemplate("benzene", centerX - 30, centerY);
    const aTop = ring.atoms[0];
    const aRight = ring.atoms[1];

    // Carboxylic acid on aTop
    const cAcid: ChemAtom = { id: `a-${uid()}-c1`, element: "C", x: aTop.x + 26, y: aTop.y - 45 };
    const oCarb: ChemAtom = { id: `a-${uid()}-o1`, element: "O", x: cAcid.x - 26, y: cAcid.y - 45 };
    const ohAcid: ChemAtom = { id: `a-${uid()}-oh`, element: "OH", x: cAcid.x + 52, y: cAcid.y };

    // Ester on aRight
    const oEster: ChemAtom = { id: `a-${uid()}-oe`, element: "O", x: aRight.x + 52, y: aRight.y };
    const cAcyl: ChemAtom = {
      id: `a-${uid()}-ca`,
      element: "C",
      x: oEster.x + 26,
      y: oEster.y + 45,
    };
    const oAcyl: ChemAtom = { id: `a-${uid()}-oa`, element: "O", x: cAcyl.x - 26, y: cAcyl.y + 45 };
    const cMe: ChemAtom = { id: `a-${uid()}-cm`, element: "C", x: cAcyl.x + 52, y: cAcyl.y };

    return {
      atoms: [...ring.atoms, cAcid, oCarb, ohAcid, oEster, cAcyl, oAcyl, cMe],
      bonds: [
        ...ring.bonds,
        { id: `b-${uid()}-1`, from: aTop.id, to: cAcid.id, type: "single" },
        { id: `b-${uid()}-2`, from: cAcid.id, to: oCarb.id, type: "double" },
        { id: `b-${uid()}-3`, from: cAcid.id, to: ohAcid.id, type: "single" },
        { id: `b-${uid()}-4`, from: aRight.id, to: oEster.id, type: "single" },
        { id: `b-${uid()}-5`, from: oEster.id, to: cAcyl.id, type: "single" },
        { id: `b-${uid()}-6`, from: cAcyl.id, to: oAcyl.id, type: "double" },
        { id: `b-${uid()}-7`, from: cAcyl.id, to: cMe.id, type: "single" },
      ],
    };
  }

  // Preset 2: Paracetamol CC(=O)Nc1ccc(O)cc1
  if (s === "CC(=O)Nc1ccc(O)cc1" || s.toLowerCase() === "paracetamol") {
    const ring = generateRingTemplate("benzene", centerX, centerY);
    const a1 = ring.atoms[1];
    const a4 = ring.atoms[4];

    const oh: ChemAtom = { id: `a-${uid()}-oh`, element: "OH", x: a4.x - 52, y: a4.y };
    const nAmide: ChemAtom = { id: `a-${uid()}-n`, element: "N", x: a1.x + 52, y: a1.y };
    const cAcyl: ChemAtom = {
      id: `a-${uid()}-c`,
      element: "C",
      x: nAmide.x + 26,
      y: nAmide.y - 45,
    };
    const oAcyl: ChemAtom = { id: `a-${uid()}-o`, element: "O", x: cAcyl.x - 26, y: cAcyl.y - 45 };
    const cMe: ChemAtom = { id: `a-${uid()}-m`, element: "C", x: cAcyl.x + 52, y: cAcyl.y };

    return {
      atoms: [...ring.atoms, oh, nAmide, cAcyl, oAcyl, cMe],
      bonds: [
        ...ring.bonds,
        { id: `b-${uid()}-1`, from: a4.id, to: oh.id, type: "single" },
        { id: `b-${uid()}-2`, from: a1.id, to: nAmide.id, type: "single" },
        { id: `b-${uid()}-3`, from: nAmide.id, to: cAcyl.id, type: "single" },
        { id: `b-${uid()}-4`, from: cAcyl.id, to: oAcyl.id, type: "double" },
        { id: `b-${uid()}-5`, from: cAcyl.id, to: cMe.id, type: "single" },
      ],
    };
  }

  // Preset 3: 4-Methoxybiphenyl (Suzuki coupling product) COc1ccc(-c2ccccc2)cc1
  if (s === "COc1ccc(-c2ccccc2)cc1" || s.toLowerCase() === "biphenyl") {
    const r1 = generateRingTemplate("benzene", centerX - 75, centerY);
    const r2 = generateRingTemplate("benzene", centerX + 75, centerY);
    const oMe: ChemAtom = {
      id: `a-${uid()}-ome`,
      element: "OMe",
      x: r1.atoms[4].x - 52,
      y: r1.atoms[4].y,
    };
    return {
      atoms: [...r1.atoms, ...r2.atoms, oMe],
      bonds: [
        ...r1.bonds,
        ...r2.bonds,
        { id: `b-${uid()}-cc`, from: r1.atoms[1].id, to: r2.atoms[4].id, type: "single" },
        { id: `b-${uid()}-om`, from: r1.atoms[4].id, to: oMe.id, type: "single" },
      ],
    };
  }

  // Preset 4: Salicylic Acid Oc1ccccc1C(=O)O
  if (s === "Oc1ccccc1C(=O)O" || s.toLowerCase() === "salicylic acid") {
    const ring = generateRingTemplate("benzene", centerX, centerY);
    const aTop = ring.atoms[0]!;
    const aRight = ring.atoms[1]!;

    const cAcid: ChemAtom = { id: `a-${uid()}-ca`, element: "C", x: aTop.x, y: aTop.y - 45 };
    const oCarb: ChemAtom = { id: `a-${uid()}-o1`, element: "O", x: cAcid.x - 26, y: cAcid.y - 45 };
    const ohAcid: ChemAtom = { id: `a-${uid()}-oh1`, element: "OH", x: cAcid.x + 52, y: cAcid.y };
    const ohPhenol: ChemAtom = {
      id: `a-${uid()}-oh2`,
      element: "OH",
      x: aRight.x + 52,
      y: aRight.y,
    };

    return {
      atoms: [...ring.atoms, cAcid, oCarb, ohAcid, ohPhenol],
      bonds: [
        ...ring.bonds,
        { id: `b-${uid()}-1`, from: aTop.id, to: cAcid.id, type: "single" },
        { id: `b-${uid()}-2`, from: cAcid.id, to: oCarb.id, type: "double" },
        { id: `b-${uid()}-3`, from: cAcid.id, to: ohAcid.id, type: "single" },
        { id: `b-${uid()}-4`, from: aRight.id, to: ohPhenol.id, type: "single" },
      ],
    };
  }

  // Preset 5: Celecoxib (Selective COX-2 Inhibitor)
  if (
    s.includes("S(N)(=O)=O") ||
    s.toLowerCase().includes("celecoxib") ||
    s === "Cc1ccc(-c2cc(C(F)(F)F)nn2-c2ccc(S(N)(=O)=O)cc2)cc1"
  ) {
    // Central Pyrazole Ring
    const pyrN1: ChemAtom = { id: `a-${uid()}-pn1`, element: "N", x: centerX, y: centerY - 20 };
    const pyrN2: ChemAtom = {
      id: `a-${uid()}-pn2`,
      element: "N",
      x: centerX + 38,
      y: centerY - 32,
    };
    const pyrC3: ChemAtom = { id: `a-${uid()}-pc3`, element: "C", x: centerX + 56, y: centerY + 6 };
    const pyrC4: ChemAtom = {
      id: `a-${uid()}-pc4`,
      element: "C",
      x: centerX + 26,
      y: centerY + 42,
    };
    const pyrC5: ChemAtom = {
      id: `a-${uid()}-pc5`,
      element: "C",
      x: centerX - 10,
      y: centerY + 26,
    };

    // CF3 group on C3
    const cf3: ChemAtom = { id: `a-${uid()}-cf3`, element: "CF3", x: pyrC3.x + 48, y: pyrC3.y + 4 };

    // 4-Methylphenyl on C5
    const ringMe = generateRingTemplate("benzene", pyrC5.x - 70, pyrC5.y + 45, 32);
    const meGroup: ChemAtom = {
      id: `a-${uid()}-me`,
      element: "C",
      x: ringMe.atoms[4]!.x - 36,
      y: ringMe.atoms[4]!.y + 16,
    };

    // 4-Sulfamoylphenyl on N1
    const ringSulf = generateRingTemplate("benzene", pyrN1.x - 20, pyrN1.y - 75, 32);
    const so2nh2: ChemAtom = {
      id: `a-${uid()}-so2nh2`,
      element: "N", // displays as sulfonamide
      x: ringSulf.atoms[0]!.x - 10,
      y: ringSulf.atoms[0]!.y - 38,
    };

    return {
      atoms: [
        pyrN1,
        pyrN2,
        pyrC3,
        pyrC4,
        pyrC5,
        cf3,
        ...ringMe.atoms,
        meGroup,
        ...ringSulf.atoms,
        so2nh2,
      ],
      bonds: [
        { id: `b-${uid()}-p1`, from: pyrN1.id, to: pyrN2.id, type: "single" },
        { id: `b-${uid()}-p2`, from: pyrN2.id, to: pyrC3.id, type: "double" },
        { id: `b-${uid()}-p3`, from: pyrC3.id, to: pyrC4.id, type: "single" },
        { id: `b-${uid()}-p4`, from: pyrC4.id, to: pyrC5.id, type: "double" },
        { id: `b-${uid()}-p5`, from: pyrC5.id, to: pyrN1.id, type: "single" },
        { id: `b-${uid()}-cf`, from: pyrC3.id, to: cf3.id, type: "single" },
        { id: `b-${uid()}-c5me`, from: pyrC5.id, to: ringMe.atoms[1]!.id, type: "single" },
        ...ringMe.bonds,
        { id: `b-${uid()}-me`, from: ringMe.atoms[4]!.id, to: meGroup.id, type: "single" },
        { id: `b-${uid()}-n1s`, from: pyrN1.id, to: ringSulf.atoms[3]!.id, type: "single" },
        ...ringSulf.bonds,
        { id: `b-${uid()}-so2`, from: ringSulf.atoms[0]!.id, to: so2nh2.id, type: "single" },
      ],
    };
  }

  // General SMILES Parser (supports chains, branches, rings, double/triple bonds)
  const atoms: ChemAtom[] = [];
  const bonds: ChemBond[] = [];
  const branchStack: { atomId: string; angle: number }[] = [];
  const ringOpenings = new Map<string, string>();

  let currAtomId: string | null = null;
  let currAngle = -Math.PI / 6;
  let stepSign = 1;
  let nextBondType: BondType = "single";

  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(") {
      if (currAtomId) {
        branchStack.push({ atomId: currAtomId, angle: currAngle });
        currAngle += (stepSign * Math.PI) / 3;
      }
      i++;
    } else if (ch === ")") {
      const popped = branchStack.pop();
      if (popped) {
        currAtomId = popped.atomId;
        currAngle = popped.angle;
      }
      i++;
    } else if (ch === "=") {
      nextBondType = "double";
      i++;
    } else if (ch === "#") {
      nextBondType = "triple";
      i++;
    } else if (ch === "-") {
      nextBondType = "single";
      i++;
    } else if (/\d/.test(ch)) {
      if (currAtomId) {
        if (ringOpenings.has(ch)) {
          const startId = ringOpenings.get(ch)!;
          bonds.push({
            id: `b-${uid()}-ring-${ch}`,
            from: currAtomId,
            to: startId,
            type: nextBondType,
          });
          ringOpenings.delete(ch);
          nextBondType = "single";
        } else {
          ringOpenings.set(ch, currAtomId);
        }
      }
      i++;
    } else if (/[A-Za-z[]/.test(ch)) {
      let el = "";
      let isAromatic = false;
      if (ch === "[") {
        const closeIdx = s.indexOf("]", i);
        el = closeIdx > i ? s.slice(i + 1, closeIdx).replace(/[^A-Za-z]/g, "") || "C" : "C";
        i = closeIdx > i ? closeIdx + 1 : i + 1;
      } else if (ch === "C" && s[i + 1] === "l") {
        el = "Cl";
        i += 2;
      } else if (ch === "B" && s[i + 1] === "r") {
        el = "Br";
        i += 2;
      } else {
        isAromatic = /[a-z]/.test(ch);
        el = ch.toUpperCase();
        i++;
      }

      const prevAtom = atoms.find((a) => a.id === currAtomId);
      const newX = prevAtom ? prevAtom.x + BOND_LENGTH * Math.cos(currAngle) : centerX - 120;
      const newY = prevAtom ? prevAtom.y + BOND_LENGTH * Math.sin(currAngle) : centerY;

      const newId = `a-${uid()}-${atoms.length}`;
      atoms.push({ id: newId, element: el, x: newX, y: newY });

      if (currAtomId) {
        const bType =
          nextBondType !== "single"
            ? nextBondType
            : isAromatic && atoms.length % 2 === 0
              ? "double"
              : "single";
        bonds.push({
          id: `b-${uid()}-${bonds.length}`,
          from: currAtomId,
          to: newId,
          type: bType,
        });
      }

      currAtomId = newId;
      nextBondType = "single";
      currAngle = stepSign > 0 ? currAngle + Math.PI / 3 : currAngle - Math.PI / 3;
      stepSign = -stepSign;
    } else {
      i++;
    }
  }

  return atoms.length > 0 ? { atoms, bonds } : generateRingTemplate("benzene", centerX, centerY);
}

// Render publication-ready vector SVG string (ACS / RSC 1996 Standard)
export function exportGraphToSvg(
  graph: ChemGraph,
  opts?: { width?: number; height?: number; transparent?: boolean },
): string {
  const width = opts?.width || 800;
  const height = opts?.height || 480;
  const atomMap = new Map(graph.atoms.map((a) => [a.id, a]));

  const bgRect = opts?.transparent
    ? ""
    : `<rect width="${width}" height="${height}" fill="#ffffff" rx="12" />`;

  const bondElements = graph.bonds
    .map((b) => {
      const a1 = atomMap.get(b.from);
      const a2 = atomMap.get(b.to);
      if (!a1 || !a2) return "";

      const dx = a2.x - a1.x;
      const dy = a2.y - a1.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const offset = 3.5;

      if (b.type === "double") {
        return `<g stroke="#0f172a" stroke-width="2.2" stroke-linecap="round">
          <line x1="${(a1.x + nx * offset).toFixed(1)}" y1="${(a1.y + ny * offset).toFixed(1)}" x2="${(a2.x + nx * offset).toFixed(1)}" y2="${(a2.y + ny * offset).toFixed(1)}" />
          <line x1="${(a1.x - nx * offset).toFixed(1)}" y1="${(a1.y - ny * offset).toFixed(1)}" x2="${(a2.x - nx * offset).toFixed(1)}" y2="${(a2.y - ny * offset).toFixed(1)}" />
        </g>`;
      }

      if (b.type === "triple") {
        const off = 4.5;
        return `<g stroke="#0f172a" stroke-width="2" stroke-linecap="round">
          <line x1="${a1.x.toFixed(1)}" y1="${a1.y.toFixed(1)}" x2="${a2.x.toFixed(1)}" y2="${a2.y.toFixed(1)}" />
          <line x1="${(a1.x + nx * off).toFixed(1)}" y1="${(a1.y + ny * off).toFixed(1)}" x2="${(a2.x + nx * off).toFixed(1)}" y2="${(a2.y + ny * off).toFixed(1)}" />
          <line x1="${(a1.x - nx * off).toFixed(1)}" y1="${(a1.y - ny * off).toFixed(1)}" x2="${(a2.x - nx * off).toFixed(1)}" y2="${(a2.y - ny * off).toFixed(1)}" />
        </g>`;
      }

      if (b.type === "wedge") {
        const w = 5.5;
        const p1 = `${a1.x.toFixed(1)},${a1.y.toFixed(1)}`;
        const p2 = `${(a2.x + nx * w).toFixed(1)},${(a2.y + ny * w).toFixed(1)}`;
        const p3 = `${(a2.x - nx * w).toFixed(1)},${(a2.y - ny * w).toFixed(1)}`;
        return `<polygon points="${p1} ${p2} ${p3}" fill="#0f172a" />`;
      }

      if (b.type === "dash") {
        const hashes: string[] = [];
        const steps = 6;
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const hx = a1.x + dx * t;
          const hy = a1.y + dy * t;
          const hw = 5.5 * t;
          hashes.push(
            `<line x1="${(hx + nx * hw).toFixed(1)}" y1="${(hy + ny * hw).toFixed(1)}" x2="${(hx - nx * hw).toFixed(1)}" y2="${(hy - ny * hw).toFixed(1)}" />`,
          );
        }
        return `<g stroke="#0f172a" stroke-width="2" stroke-linecap="round">${hashes.join("")}</g>`;
      }

      return `<line x1="${a1.x.toFixed(1)}" y1="${a1.y.toFixed(1)}" x2="${a2.x.toFixed(1)}" y2="${a2.y.toFixed(1)}" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" />`;
    })
    .join("\n");

  const atomElements = graph.atoms
    .map((a) => {
      const degree = graph.bonds.filter((b) => b.from === a.id || b.to === a.id).length;
      if (a.element === "C" && degree > 0) return "";
      const color = CPK_ATOM_COLORS[a.element] || "#0f172a";
      const label = a.element === "C" ? "CH4" : a.element;
      const formattedLabel = label.replace(
        /([A-Za-z)\]])(\d+)/g,
        '$1<tspan font-size="75%" baseline-shift="sub">$2</tspan>',
      );
      const boxW = Math.max(22, label.length * 10 + 10);
      return `<g transform="translate(${a.x.toFixed(1)}, ${a.y.toFixed(1)})">
        <rect x="${-boxW / 2}" y="-11" width="${boxW}" height="22" rx="5" fill="#ffffff" />
        <text x="0" y="5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="${color}">${formattedLabel}</text>
      </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${bgRect}
    ${bondElements}
    ${atomElements}
  </svg>`;
}
