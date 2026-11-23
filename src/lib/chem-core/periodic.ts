/**
 * Periodic table — the single source of truth for element symbols and atomic weights.
 *
 * Weights are read from openchemlib (the same library that computes molecular
 * formulas for SMILES), so a formula typed by hand and a SMILES string for the
 * same substance always give the same molecular weight. No hand-typed tables.
 */
import { Molecule } from "openchemlib";

const MAX_Z = 118;
const SYMBOL_TO_Z = new Map<string, number>();
for (let z = 1; z <= MAX_Z; z++) {
  const label = Molecule.cAtomLabel[z];
  if (label) SYMBOL_TO_Z.set(label, z);
}

const weightCache = new Map<string, number>();

export function isElementSymbol(symbol: string): boolean {
  return SYMBOL_TO_Z.has(symbol);
}

export function atomicNumber(symbol: string): number | undefined {
  return SYMBOL_TO_Z.get(symbol);
}

/**
 * Standard atomic weight in g/mol, or `undefined` for an unknown symbol.
 * Never falls back to a made-up default.
 */
export function atomicWeight(symbol: string): number | undefined {
  if (!SYMBOL_TO_Z.has(symbol)) return undefined;
  const cached = weightCache.get(symbol);
  if (cached !== undefined) return cached;
  try {
    const w = Molecule.fromSmiles(`[${symbol}]`).getMolecularFormula().relativeWeight;
    if (w > 0) {
      weightCache.set(symbol, w);
      return w;
    }
  } catch {
    /* fall through */
  }
  return undefined;
}
