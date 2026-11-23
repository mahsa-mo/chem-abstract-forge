/**
 * 2D layout: SMILES -> atoms/bonds with real chemical coordinates.
 *
 * Replaces the old "walk the string and zig-zag at 60°" drawing, which could
 * overlap atoms, left rings open, dropped charges and ignored stereochemistry.
 * Coordinates come from openchemlib's coordinate inventor (deterministic: fixed seed).
 */
import { Molecule } from "openchemlib";
import { parseSmiles } from "./parse";

export type LayoutBondType = "single" | "double" | "triple" | "wedge" | "dash" | "wavy";

export interface LayoutAtom {
  id: string;
  /** Plain element symbol, e.g. "N". */
  element: string;
  /** Display label including implicit hydrogens and charge, e.g. "NH2", "O−". */
  label: string;
  x: number;
  y: number;
  charge?: number;
}

export interface LayoutBond {
  id: string;
  from: string;
  to: string;
  type: LayoutBondType;
}

export interface MoleculeLayout {
  atoms: LayoutAtom[];
  bonds: LayoutBond[];
}

const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function chargeText(charge: number): string {
  if (charge === 0) return "";
  const sign = charge > 0 ? "⁺" : "⁻";
  const mag = Math.abs(charge);
  if (mag === 1) return sign;
  return [...String(mag)].map((d) => SUPERSCRIPT_DIGITS.charAt(Number(d))).join("") + sign;
}

function labelFor(element: string, hydrogens: number, charge: number): string {
  const h = hydrogens === 0 ? "" : hydrogens === 1 ? "H" : `H${hydrogens}`;
  return `${element}${h}${chargeText(charge)}`;
}

/**
 * @param smiles      input structure
 * @param centerX     x of the drawing centre
 * @param centerY     y of the drawing centre
 * @param bondLength  length of a single bond in output units
 * @param idPrefix    prefix for atom/bond ids, so several layouts can live in one graph
 * @returns the layout, or `null` if the SMILES cannot be parsed.
 */
export function smilesToLayout(
  smiles: string,
  centerX: number,
  centerY: number,
  bondLength: number,
  idPrefix = "",
): MoleculeLayout | null {
  let mol: Molecule;
  try {
    mol = parseSmiles(smiles);
    mol.inventCoordinates();
    mol.setStereoBondsFromParity();
  } catch {
    return null;
  }

  const n = mol.getAllAtoms();
  const avg = mol.getAverageBondLength(true) || 1;
  const scale = bondLength / avg;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, mol.getAtomX(i));
    maxX = Math.max(maxX, mol.getAtomX(i));
    minY = Math.min(minY, mol.getAtomY(i));
    maxY = Math.max(maxY, mol.getAtomY(i));
  }
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const atoms: LayoutAtom[] = [];
  for (let i = 0; i < n; i++) {
    const element = mol.getAtomLabel(i);
    const charge = mol.getAtomCharge(i);
    atoms.push({
      id: `${idPrefix}a${i}`,
      element,
      label: labelFor(element, mol.getImplicitHydrogens(i), charge),
      x: Math.round((centerX + (mol.getAtomX(i) - midX) * scale) * 100) / 100,
      y: Math.round((centerY + (mol.getAtomY(i) - midY) * scale) * 100) / 100,
      ...(charge !== 0 ? { charge } : {}),
    });
  }

  const bonds: LayoutBond[] = [];
  for (let b = 0; b < mol.getAllBonds(); b++) {
    const order = mol.getBondOrder(b);
    const kind = mol.getBondType(b);
    let type: LayoutBondType;
    if (kind === Molecule.cBondTypeUp) type = "wedge";
    else if (kind === Molecule.cBondTypeDown) type = "dash";
    else if (kind === Molecule.cBondTypeCross) type = "wavy";
    else type = order === 2 ? "double" : order === 3 ? "triple" : "single";
    bonds.push({
      id: `${idPrefix}b${b}`,
      from: `${idPrefix}a${mol.getBondAtom(0, b)}`,
      to: `${idPrefix}a${mol.getBondAtom(1, b)}`,
      type,
    });
  }
  return { atoms, bonds };
}
