/**
 * Publication-style SVG for a single molecule.
 *
 * "acs-1996" matches the ACS Document 1996 drawing settings where they can be
 * set through openchemlib: bond length 14.4 pt and line width 0.6 pt. Text size
 * follows openchemlib's own proportion to the bond length (it is not forced to 10 pt).
 */
import type { Molecule } from "openchemlib";
import { parseSmiles } from "./parse";

export type RenderPreset = "default" | "acs-1996";

export interface RenderOptions {
  preset?: RenderPreset;
  /** Fixed output size (default preset only; acs-1996 sizes itself to the molecule). */
  width?: number;
  height?: number;
  /** SVG id; fixed by default so output is reproducible. */
  id?: string;
  /** Margin around the structure in px/pt. */
  margin?: number;
}

const ACS_BOND_LENGTH = 14.4;
const ACS_LINE_WIDTH = 0.6;

/** Returns SVG text, or `null` when the SMILES cannot be parsed. */
export function renderMoleculeSvg(smiles: string, options: RenderOptions = {}): string | null {
  const id = options.id ?? "mol";
  const margin = options.margin ?? 10;
  let mol: Molecule;
  try {
    mol = parseSmiles(smiles);
    mol.inventCoordinates();
    mol.setStereoBondsFromParity();
  } catch {
    return null;
  }

  if ((options.preset ?? "default") === "acs-1996") {
    const avg = mol.getAverageBondLength(true) || 1;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < mol.getAllAtoms(); i++) {
      minX = Math.min(minX, mol.getAtomX(i));
      maxX = Math.max(maxX, mol.getAtomX(i));
      minY = Math.min(minY, mol.getAtomY(i));
      maxY = Math.max(maxY, mol.getAtomY(i));
    }
    const k = ACS_BOND_LENGTH / avg;
    const width = Math.max(40, Math.ceil((maxX - minX) * k + 2 * margin));
    const height = Math.max(40, Math.ceil((maxY - minY) * k + 2 * margin));
    return mol.toSVG(width, height, id, { strokeWidth: ACS_LINE_WIDTH, fontWeight: "normal" });
  }

  return mol.toSVG(options.width ?? 300, options.height ?? 220, id, { autoCrop: false });
}
