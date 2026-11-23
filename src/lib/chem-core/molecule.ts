/**
 * Molecule analysis from SMILES, backed by openchemlib.
 *
 * What this adds on top of the parser itself: openchemlib accepts hypervalent
 * atoms such as "CC(=O)(=O)=O" or "[CH5]" without complaint, so valence is
 * checked explicitly here.
 */
import { Molecule } from "openchemlib";
import { parseSmiles, SmilesSyntaxError } from "./parse";

export interface ValenceIssue {
  atomIndex: number;
  symbol: string;
  occupied: number;
  allowed: number;
  severity: "error" | "warning";
}

export interface MoleculeAnalysis {
  /** SMILES was parsed. */
  parsed: boolean;
  /** Parsed and no error-level problems. */
  ok: boolean;
  errors: string[];
  warnings: string[];
  valenceIssues: ValenceIssue[];
  /** openchemlib SMILES (not guaranteed identical to other toolkits). */
  smiles?: string;
  /** openchemlib canonical ID code — use this as the identity key between molecules. */
  idCode?: string;
  /** Hill formula, including implicit hydrogens. */
  formula?: string;
  /** Average molecular weight, g/mol. */
  mw?: number;
  /** Monoisotopic mass. */
  exactMass?: number;
  netCharge?: number;
  /** Heavy atoms only. */
  atomCount?: number;
  bondCount?: number;
  ringCount?: number;
  aromaticAtomCount?: number;
  fragmentCount?: number;
  hasWildcard?: boolean;
}

/** Elements where an over-valent atom is a definite error (organic-subset elements). */
const STRICT_ELEMENTS = new Set([5, 6, 7, 8, 9]); // B C N O F

function checkValence(smiles: string, mol: Molecule): ValenceIssue[] {
  // openchemlib lets an explicitly bracketed atom override its own maximum valence.
  // Re-parse and clear those overrides so we compare against the element's natural limit.
  const natural = Molecule.fromSmiles(smiles);
  const issues: ValenceIssue[] = [];
  for (let i = 0; i < natural.getAllAtoms(); i++) {
    if (natural.getAtomicNo(i) > 1 && natural.getAtomAbnormalValence(i) !== -1) {
      natural.setAtomAbnormalValence(i, -1);
    }
  }
  for (let i = 0; i < mol.getAllAtoms(); i++) {
    const z = mol.getAtomicNo(i);
    if (z <= 1) continue;
    const occupied = mol.getOccupiedValence(i) + mol.getImplicitHydrogens(i);
    const allowed = natural.getMaxValence(i);
    if (occupied <= allowed) continue;

    // Neutral N(=O)=O (pentavalent nitro) is common in older data: warn, don't reject.
    const nitroLike = z === 7 && occupied === 5;
    const severity = STRICT_ELEMENTS.has(z) && !nitroLike ? "error" : "warning";
    issues.push({
      atomIndex: i,
      symbol: mol.getAtomLabel(i),
      occupied,
      allowed,
      severity,
    });
  }
  return issues;
}

export function analyzeSmiles(rawSmiles: string): MoleculeAnalysis {
  const input = rawSmiles.trim();
  const fail = (message: string): MoleculeAnalysis => ({
    parsed: false,
    ok: false,
    errors: [message],
    warnings: [],
    valenceIssues: [],
  });

  let mol: Molecule;
  try {
    mol = parseSmiles(input);
  } catch (err) {
    if (err instanceof SmilesSyntaxError) return fail(err.message);
    throw err;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const valenceIssues = checkValence(input, mol);
  for (const v of valenceIssues) {
    const text = `${v.symbol} (atom ${v.atomIndex + 1}) has valence ${v.occupied}, more than the allowed ${v.allowed}`;
    (v.severity === "error" ? errors : warnings).push(text);
  }

  let hasWildcard = false;
  let aromaticAtomCount = 0;
  let heavy = 0;
  let netCharge = 0;
  for (let i = 0; i < mol.getAllAtoms(); i++) {
    const z = mol.getAtomicNo(i);
    if (z === 0) hasWildcard = true;
    if (z > 1) heavy++;
    if (mol.isAromaticAtom(i)) aromaticAtomCount++;
    netCharge += mol.getAtomCharge(i);
  }
  if (hasWildcard)
    warnings.push("SMILES contains a wildcard/unknown atom; weight and formula are incomplete");

  const result: MoleculeAnalysis = {
    parsed: true,
    ok: errors.length === 0,
    errors,
    warnings,
    valenceIssues,
    smiles: mol.toIsomericSmiles(),
    idCode: mol.getIDCode(),
    netCharge,
    atomCount: heavy,
    bondCount: mol.getAllBonds(),
    ringCount: mol.getRingSet().getSize(),
    aromaticAtomCount,
    fragmentCount: input.split(".").length,
    hasWildcard,
  };

  if (!hasWildcard) {
    const f = mol.getMolecularFormula();
    result.formula = f.formula;
    result.mw = f.relativeWeight;
    result.exactMass = f.absoluteWeight;
  }
  return result;
}
