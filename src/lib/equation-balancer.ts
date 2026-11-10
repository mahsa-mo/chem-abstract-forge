import { parseChemicalFormula } from "@/components/StoichiometryLab";

export interface ParsedSpecies {
  raw: string;
  formula: string;
  inputCoeff: number;
  balancedCoeff: number;
  counts: Record<string, number>;
  charge: number;
  mw: number;
}

export interface AtomAuditRow {
  element: string;
  unbalancedLeft: number;
  unbalancedRight: number;
  balancedLeft: number;
  balancedRight: number;
}

export interface BalancedEquationResult {
  valid: boolean;
  error_en?: string;
  error_fa?: string;
  wasAlreadyBalanced?: boolean;
  reactants: ParsedSpecies[];
  products: ParsedSpecies[];
  atomAudit: AtomAuditRow[];
  totalMassPerMoleReaction: number;
  formattedPlain: string;
  matrixSteps_en: string[];
  matrixSteps_fa: string[];
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

// Parse a single species token like "2 Fe(OH)3", "MnO4^-", "CuSO4.5H2O", "Fe^3+"
function parseSpeciesToken(token: string): Omit<ParsedSpecies, "balancedCoeff"> | null {
  let s = token.trim();
  if (!s) return null;

  // Extract optional leading stoichiometric coefficient
  const coeffMatch = s.match(/^(\d+)\s*(.+)$/);
  let inputCoeff = 1;
  if (coeffMatch) {
    inputCoeff = parseInt(coeffMatch[1], 10) || 1;
    s = coeffMatch[2].trim();
  }

  // Strip state annotations like (s), (l), (g), (aq)
  s = s.replace(/\((s|l|g|aq)\)$/i, "").trim();

  // Extract optional ionic charge e.g. ^2+, ^-, ^3-, ^+
  let charge = 0;
  const chargeMatch = s.match(/\^(\d*)([+-])$/);
  if (chargeMatch) {
    const mag = chargeMatch[1] ? parseInt(chargeMatch[1], 10) : 1;
    charge = chargeMatch[2] === "+" ? mag : -mag;
    s = s.slice(0, chargeMatch.index).trim();
  }

  // Parse elemental composition using parseChemicalFormula
  const parsed = parseChemicalFormula(s);
  if (!parsed.valid || parsed.composition.length === 0) {
    return null;
  }

  const counts: Record<string, number> = {};
  for (const item of parsed.composition) {
    counts[item.element] = item.count;
  }

  return {
    raw: token.trim(),
    formula: s,
    inputCoeff,
    counts,
    charge,
    mw: parsed.mw,
  };
}

// Exact Fraction arithmetic for Gaussian elimination
class Frac {
  num: number;
  den: number;

  constructor(num: number, den = 1) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }

  add(other: Frac): Frac {
    return new Frac(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Frac): Frac {
    return new Frac(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Frac): Frac {
    return new Frac(this.num * other.num, this.den * other.den);
  }

  div(other: Frac): Frac {
    return new Frac(this.num * other.den, this.den * other.num);
  }

  neg(): Frac {
    return new Frac(-this.num, this.den);
  }

  isZero(): boolean {
    return this.num === 0;
  }
}

export function balanceChemicalEquation(input: string): BalancedEquationResult {
  const cleaned = input.trim();
  if (!cleaned) {
    return {
      valid: false,
      error_en: "Please enter a chemical equation (e.g., Fe + O2 -> Fe2O3).",
      error_fa: "لطفاً یک معادله شیمیایی وارد کنید (مثال: Fe + O2 -> Fe2O3).",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  // Split by reaction arrow (->, →, <=>, ⇌, =)
  const arrowRegex = /\s*(?:<=>|<->|-->|->|→|⇌|=)\s*/;
  const sides = cleaned.split(arrowRegex);
  if (sides.length !== 2 || !sides[0].trim() || !sides[1].trim()) {
    return {
      valid: false,
      error_en: "Equation must have reactants and products separated by '->' or '='.",
      error_fa: "معادله باید شامل واکنش‌دهنده‌ها و فرآورده‌ها با جداکننده «->» یا «=» باشد.",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  const leftTokens = sides[0]
    .split(/\s*\+\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
  const rightTokens = sides[1]
    .split(/\s*\+\s*/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return {
      valid: false,
      error_en: "Both reactant and product sides must contain at least one chemical species.",
      error_fa: "هر دو سمت واکنش‌دهنده‌ها و فرآورده‌ها باید حداقل یک ماده شیمیایی داشته باشند.",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  const parsedReactants: Omit<ParsedSpecies, "balancedCoeff">[] = [];
  for (const tok of leftTokens) {
    const p = parseSpeciesToken(tok);
    if (!p) {
      return {
        valid: false,
        error_en: `Invalid chemical formula in reactants: "${tok}". Check element capitalization (e.g., Fe, not fe).`,
        error_fa: `فرمول شیمیایی نامعتبر در واکنش‌دهنده‌ها: «${tok}». حروف بزرگ و کوچک عناصر را بررسی کنید.`,
        reactants: [],
        products: [],
        atomAudit: [],
        totalMassPerMoleReaction: 0,
        formattedPlain: "",
        matrixSteps_en: [],
        matrixSteps_fa: [],
      };
    }
    parsedReactants.push(p);
  }

  const parsedProducts: Omit<ParsedSpecies, "balancedCoeff">[] = [];
  for (const tok of rightTokens) {
    const p = parseSpeciesToken(tok);
    if (!p) {
      return {
        valid: false,
        error_en: `Invalid chemical formula in products: "${tok}". Check element capitalization (e.g., Co vs CO).`,
        error_fa: `فرمول شیمیایی نامعتبر در فرآورده‌ها: «${tok}». حروف بزرگ و کوچک عناصر را بررسی کنید.`,
        reactants: [],
        products: [],
        atomAudit: [],
        totalMassPerMoleReaction: 0,
        formattedPlain: "",
        matrixSteps_en: [],
        matrixSteps_fa: [],
      };
    }
    parsedProducts.push(p);
  }

  // Verify identical element sets on both sides
  const leftElements = new Set<string>();
  const rightElements = new Set<string>();
  parsedReactants.forEach((r) => Object.keys(r.counts).forEach((el) => leftElements.add(el)));
  parsedProducts.forEach((p) => Object.keys(p.counts).forEach((el) => rightElements.add(el)));

  for (const el of leftElements) {
    if (!rightElements.has(el)) {
      return {
        valid: false,
        error_en: `Element "${el}" appears in reactants but is missing in products.`,
        error_fa: `عنصر «${el}» در واکنش‌دهنده‌ها وجود دارد اما در فرآورده‌ها دیده نمی‌شود.`,
        reactants: [],
        products: [],
        atomAudit: [],
        totalMassPerMoleReaction: 0,
        formattedPlain: "",
        matrixSteps_en: [],
        matrixSteps_fa: [],
      };
    }
  }
  for (const el of rightElements) {
    if (!leftElements.has(el)) {
      return {
        valid: false,
        error_en: `Element "${el}" appears in products but is missing in reactants.`,
        error_fa: `عنصر «${el}» در فرآورده‌ها وجود دارد اما در واکنش‌دهنده‌ها دیده نمی‌شود.`,
        reactants: [],
        products: [],
        atomAudit: [],
        totalMassPerMoleReaction: 0,
        formattedPlain: "",
        matrixSteps_en: [],
        matrixSteps_fa: [],
      };
    }
  }

  const elements = Array.from(leftElements);
  const allSpecies = [...parsedReactants, ...parsedProducts];
  const nCols = allSpecies.length;
  const hasCharge = allSpecies.some((sp) => sp.charge !== 0);

  // Build stoichiometric matrix: rows = elements (+ optional charge row), cols = species
  // Reactants have positive entries, products have negative entries
  const matrix: Frac[][] = elements.map((el) =>
    allSpecies.map((sp, idx) => {
      const sign = idx < parsedReactants.length ? 1 : -1;
      return new Frac(sign * (sp.counts[el] || 0));
    }),
  );

  if (hasCharge) {
    matrix.push(
      allSpecies.map((sp, idx) => {
        const sign = idx < parsedReactants.length ? 1 : -1;
        return new Frac(sign * sp.charge);
      }),
    );
  }

  const nRows = matrix.length;
  const pivotColForRow: number[] = [];
  const isPivotCol = new Array<boolean>(nCols).fill(false);

  // Gaussian Elimination to Reduced Row Echelon Form (RREF)
  let r = 0;
  for (let c = 0; c < nCols && r < nRows; c++) {
    let pivotRow = -1;
    for (let i = r; i < nRows; i++) {
      if (!matrix[i][c].isZero()) {
        pivotRow = i;
        break;
      }
    }
    if (pivotRow === -1) continue;

    // Swap rows
    const tmp = matrix[r];
    matrix[r] = matrix[pivotRow];
    matrix[pivotRow] = tmp;

    // Normalize pivot row
    const pivotVal = matrix[r][c];
    for (let j = c; j < nCols; j++) {
      matrix[r][j] = matrix[r][j].div(pivotVal);
    }

    // Eliminate column c in all other rows
    for (let i = 0; i < nRows; i++) {
      if (i !== r && !matrix[i][c].isZero()) {
        const factor = matrix[i][c];
        for (let j = c; j < nCols; j++) {
          matrix[i][j] = matrix[i][j].sub(factor.mul(matrix[r][j]));
        }
      }
    }

    pivotColForRow.push(c);
    isPivotCol[c] = true;
    r++;
  }

  // Find free variables (columns without pivots)
  const freeCols: number[] = [];
  for (let c = 0; c < nCols; c++) {
    if (!isPivotCol[c]) freeCols.push(c);
  }

  if (freeCols.length === 0) {
    return {
      valid: false,
      error_en: "No non-trivial stoichiometric solution exists for this equation.",
      error_fa: "پاسخ استوکیومتری معتبری برای موازنه این معادله وجود ندارد.",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  // Construct nullspace solution vector by setting free variables to 1
  const solFrac: Frac[] = new Array<Frac>(nCols).fill(new Frac(0));
  for (const fc of freeCols) {
    solFrac[fc] = new Frac(1);
  }

  for (let rowIdx = 0; rowIdx < pivotColForRow.length; rowIdx++) {
    const pCol = pivotColForRow[rowIdx];
    let sum = new Frac(0);
    for (const fc of freeCols) {
      sum = sum.add(matrix[rowIdx][fc].mul(solFrac[fc]));
    }
    solFrac[pCol] = sum.neg();
  }

  // Convert rational vector to smallest positive integers via LCM of denominators
  let commonDen = 1;
  for (const f of solFrac) {
    commonDen = lcm(commonDen, f.den);
  }

  let coeffs = solFrac.map((f) => Math.round((f.num * commonDen) / f.den));

  // If all negative, flip signs
  if (coeffs.every((v) => v < 0)) {
    coeffs = coeffs.map((v) => -v);
  }

  // Verify all coefficients are strictly positive
  if (coeffs.some((v) => v <= 0)) {
    return {
      valid: false,
      error_en:
        "Could not find strictly positive stoichiometric coefficients. Verify all reactants and products are on the correct side.",
      error_fa:
        "ضرایب استوکیومتری مثبت برای تمام گونه‌ها یافت نشد. لطفاً صحت فرمول واکنش‌دهنده‌ها و فرآورده‌ها را بررسی کنید.",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  // Reduce by overall GCD
  const firstVal = coeffs[0] ?? 1;
  const overallGcd = coeffs.reduce((acc, v) => gcd(acc, v), firstVal);
  coeffs = coeffs.map((v) => v / overallGcd);

  const balancedReactants: ParsedSpecies[] = parsedReactants.map((sp, i) => ({
    ...sp,
    balancedCoeff: coeffs[i] ?? 1,
  }));
  const balancedProducts: ParsedSpecies[] = parsedProducts.map((sp, i) => ({
    ...sp,
    balancedCoeff: coeffs[parsedReactants.length + i] ?? 1,
  }));

  // Atom conservation audit table
  const atomAudit: AtomAuditRow[] = elements.map((el) => {
    const unbalancedLeft = balancedReactants.reduce(
      (sum, sp) => sum + sp.inputCoeff * (sp.counts[el] || 0),
      0,
    );
    const unbalancedRight = balancedProducts.reduce(
      (sum, sp) => sum + sp.inputCoeff * (sp.counts[el] || 0),
      0,
    );
    const balancedLeft = balancedReactants.reduce(
      (sum, sp) => sum + sp.balancedCoeff * (sp.counts[el] || 0),
      0,
    );
    const balancedRight = balancedProducts.reduce(
      (sum, sp) => sum + sp.balancedCoeff * (sp.counts[el] || 0),
      0,
    );
    return {
      element: el,
      unbalancedLeft,
      unbalancedRight,
      balancedLeft,
      balancedRight,
    };
  });

  const wasAlreadyBalanced = atomAudit.every((row) => row.unbalancedLeft === row.unbalancedRight);

  const totalMassPerMoleReaction = balancedReactants.reduce(
    (sum, sp) => sum + sp.balancedCoeff * sp.mw,
    0,
  );

  const formatSide = (list: ParsedSpecies[]) =>
    list
      .map((sp) => {
        const chargeStr =
          sp.charge !== 0
            ? `^${Math.abs(sp.charge) > 1 ? Math.abs(sp.charge) : ""}${sp.charge > 0 ? "+" : "-"}`
            : "";
        return `${sp.balancedCoeff > 1 ? `${sp.balancedCoeff} ` : ""}${sp.formula}${chargeStr}`;
      })
      .join(" + ");

  const formattedPlain = `${formatSide(balancedReactants)} → ${formatSide(balancedProducts)}`;

  const matrixSteps_en = [
    `1. Identified ${elements.length} unique elements (${elements.join(", ")}) across ${nCols} chemical species.`,
    `2. Constructed a ${nRows} × ${nCols} atom-conservation matrix A·x = 0 and computed exact Reduced Row Echelon Form (RREF).`,
    `3. Scaled rational nullspace basis vector by LCM(${commonDen}) and divided by GCD(${overallGcd}) to obtain minimal integer stoichiometric coefficients.`,
  ];

  const matrixSteps_fa = [
    `۱. شناسایی ${elements.length} عنصر مجزا (${elements.join("، ")}) در ${nCols} گونه شیمیایی واکنش.`,
    `۲. تشکیل ماتریس پایستگی اتم‌ها به ابعاد ${nRows}×${nCols} (A·x = 0) و اجرای حذف گاوسی-جردن در میدان اعداد گویا.`,
    `۳. ضرب بردار پایه فضای پوچ در ک.م.م مخرج‌ها (${commonDen}) و ساده‌سازی با ب.م.م (${overallGcd}) برای استخراج کوچک‌ترین ضرایب صحیح استوکیومتری.`,
  ];

  return {
    valid: true,
    wasAlreadyBalanced,
    reactants: balancedReactants,
    products: balancedProducts,
    atomAudit,
    totalMassPerMoleReaction: Number(totalMassPerMoleReaction.toFixed(2)),
    formattedPlain,
    matrixSteps_en,
    matrixSteps_fa,
  };
}
