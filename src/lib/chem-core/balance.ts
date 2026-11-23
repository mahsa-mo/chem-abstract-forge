/**
 * Exact stoichiometry: atom/charge balance checks and coefficient solving.
 *
 * Everything is integer / exact-rational arithmetic — there is no tolerance, so
 * "balanced" means every element and the net charge match exactly.
 */
import { parseFormula } from "./formula";

export interface SpeciesInput {
  formula: string;
  /** Stoichiometric coefficient (default 1). */
  coefficient?: number;
}

export interface ElementBalance {
  element: string;
  left: number;
  right: number;
  balanced: boolean;
}

export interface BalanceCheck {
  /** True only if all parsed, every element matches and the charge matches. */
  balanced: boolean;
  elements: ElementBalance[];
  chargeLeft: number;
  chargeRight: number;
  chargeBalanced: boolean;
  /** Formulas that could not be parsed (balance cannot be decided if non-empty). */
  errors: string[];
}

function tally(species: SpeciesInput[], errors: string[]) {
  const counts = new Map<string, number>();
  let charge = 0;
  for (const sp of species) {
    const parsed = parseFormula(sp.formula);
    if (!parsed.ok) {
      errors.push(`${sp.formula}: ${parsed.error}`);
      continue;
    }
    const k = sp.coefficient ?? 1;
    for (const [el, n] of parsed.counts) counts.set(el, (counts.get(el) ?? 0) + n * k);
    charge += parsed.charge * k;
  }
  return { counts, charge };
}

export function checkBalance(reactants: SpeciesInput[], products: SpeciesInput[]): BalanceCheck {
  const errors: string[] = [];
  const left = tally(reactants, errors);
  const right = tally(products, errors);

  const all = new Set([...left.counts.keys(), ...right.counts.keys()]);
  // Display order: C, H, then alphabetical.
  const ordered = [...all];
  ordered.sort((a, b) => {
    const rank = (e: string) => (e === "C" ? 0 : e === "H" ? 1 : 2);
    return rank(a) - rank(b) || a.localeCompare(b);
  });

  const elements = ordered.map((element) => {
    const l = left.counts.get(element) ?? 0;
    const r = right.counts.get(element) ?? 0;
    return { element, left: l, right: r, balanced: l === r };
  });
  const chargeBalanced = left.charge === right.charge;

  return {
    balanced: errors.length === 0 && chargeBalanced && elements.every((e) => e.balanced),
    elements,
    chargeLeft: left.charge,
    chargeRight: right.charge,
    chargeBalanced,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Coefficient solver (exact rational Gaussian elimination)
// ---------------------------------------------------------------------------

type Q = readonly [bigint, bigint]; // numerator / denominator, denominator > 0

const absB = (a: bigint) => (a < 0n ? -a : a);
function gcdB(a: bigint, b: bigint): bigint {
  let x = absB(a);
  let y = absB(b);
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
function q(n: bigint, d: bigint = 1n): Q {
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdB(n, d) || 1n;
  return [n / g, d / g];
}
const qSub = (a: Q, b: Q) => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const qMul = (a: Q, b: Q) => q(a[0] * b[0], a[1] * b[1]);
const qDiv = (a: Q, b: Q) => q(a[0] * b[1], a[1] * b[0]);
const Q0: Q = [0n, 1n];

function nullspace(matrix: Q[][], cols: number): Q[][] {
  const m = matrix.map((row) => row.slice());
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < m.length; c++) {
    let p = -1;
    for (let i = r; i < m.length; i++) {
      if (m[i]![c]![0] !== 0n) {
        p = i;
        break;
      }
    }
    if (p < 0) continue;
    [m[r], m[p]] = [m[p]!, m[r]!];
    const pivot = m[r]![c]!;
    m[r] = m[r]!.map((x) => qDiv(x, pivot));
    for (let i = 0; i < m.length; i++) {
      if (i === r) continue;
      const f = m[i]![c]!;
      if (f[0] === 0n) continue;
      m[i] = m[i]!.map((x, j) => qSub(x, qMul(f, m[r]![j]!)));
    }
    pivots.push(c);
    r++;
  }
  const basis: Q[][] = [];
  for (let f = 0; f < cols; f++) {
    if (pivots.includes(f)) continue;
    const v: Q[] = Array.from({ length: cols }, () => Q0);
    v[f] = q(1n);
    pivots.forEach((pc, row) => {
      v[pc] = qSub(Q0, m[row]![f]!);
    });
    basis.push(v);
  }
  return basis;
}

export type SolveResult =
  | { status: "ok"; reactantCoefficients: number[]; productCoefficients: number[] }
  | { status: "invalid" | "impossible" | "underdetermined"; message: string };

/**
 * Find the smallest positive integer coefficients that balance the reaction.
 * Returns a reason instead of a guess when no unique answer exists.
 */
export function solveCoefficients(reactants: string[], products: string[]): SolveResult {
  const all = [...reactants, ...products];
  const parsed = all.map((f) => parseFormula(f));
  const bad = parsed.findIndex((p) => !p.ok);
  if (bad >= 0) {
    const p = parsed[bad]!;
    return { status: "invalid", message: `${all[bad]}: ${p.ok ? "" : p.error}` };
  }
  if (parsed.some((p) => p.ok && p.repeatUnit)) {
    return { status: "invalid", message: "Polymer repeat units cannot be balanced this way" };
  }

  const rows = new Set<string>();
  for (const p of parsed) if (p.ok) for (const el of p.counts.keys()) rows.add(el);
  const elements = [...rows];
  const sign = (i: number) => (i < reactants.length ? 1n : -1n);

  const matrix: Q[][] = elements.map((el) =>
    parsed.map((p, i) => q(sign(i) * BigInt(p.ok ? (p.counts.get(el) ?? 0) : 0))),
  );
  matrix.push(parsed.map((p, i) => q(sign(i) * BigInt(p.ok ? p.charge : 0))));

  const basis = nullspace(matrix, all.length);
  if (basis.length === 0) {
    return { status: "impossible", message: "No coefficients balance this reaction" };
  }
  if (basis.length > 1) {
    return {
      status: "underdetermined",
      message:
        "More than one independent reaction fits these species; the coefficients are not unique",
    };
  }

  const v = basis[0]!;
  let lcm = 1n;
  for (const x of v) lcm = (lcm * x[1]) / gcdB(lcm, x[1]);
  let ints = v.map((x) => (x[0] * lcm) / x[1]);
  const g = ints.reduce((acc, x) => gcdB(acc, x), 0n) || 1n;
  ints = ints.map((x) => x / g);
  if (ints.every((x) => x <= 0n)) ints = ints.map((x) => -x);

  if (ints.some((x) => x <= 0n)) {
    return {
      status: "impossible",
      message:
        "No all-positive coefficients exist (some species would have to switch sides or drop out)",
    };
  }
  if (ints.some((x) => x > 1_000_000n)) {
    return { status: "impossible", message: "Coefficients are unreasonably large" };
  }
  const nums = ints.map((x) => Number(x));
  return {
    status: "ok",
    reactantCoefficients: nums.slice(0, reactants.length),
    productCoefficients: nums.slice(reactants.length),
  };
}
