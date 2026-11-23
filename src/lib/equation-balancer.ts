import { parseFormula } from "./chem-core/formula";
import { solveCoefficients } from "./chem-core/balance";

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

export function expandChemicalAbbreviations(formula: string): string {
  return formula
    .replace(/Ph/g, "(C6H5)")
    .replace(/Me/g, "(CH3)")
    .replace(/Et/g, "(C2H5)")
    .replace(/iPr/g, "(C3H7)")
    .replace(/Pr/g, "(C3H7)")
    .replace(/tBu/g, "(C4H9)")
    .replace(/Bu/g, "(C4H9)")
    .replace(/Ac/g, "(C2H3O)")
    .replace(/Bn/g, "(C7H7)")
    .replace(/Bz/g, "(C7H5O)")
    .replace(/Tf/g, "(CF3SO2)")
    .replace(/Ts/g, "(C7H7SO2)")
    .replace(/Boc/g, "(C5H9O2)")
    .replace(/dba/g, "(C17H14O)")
    .replace(/ppy/g, "(C11H8N)");
}

interface ParsedTokenInternal extends Omit<ParsedSpecies, "balancedCoeff"> {
  solverFormula: string;
}

// Extract charge suffix if present (^2+, ^-, Na+, Cl-, Fe²⁺) for display vs solver
function extractChargeSuffix(s: string): { base: string; chargeSuffix: string } {
  const caret = /\^(\d*)([+-])$/.exec(s);
  if (caret && caret.index !== undefined) {
    return { base: s.slice(0, caret.index).trim(), chargeSuffix: caret[0] };
  }
  const unicode = /[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]$/.exec(s);
  if (unicode && unicode.index !== undefined) {
    return { base: s.slice(0, unicode.index).trim(), chargeSuffix: unicode[0] };
  }
  if (/[+-]$/.test(s) && !/\d/.test(s.charAt(s.length - 2))) {
    return { base: s.slice(0, -1).trim(), chargeSuffix: s.slice(-1) };
  }
  return { base: s, chargeSuffix: "" };
}

// Parse a single species token like "2 Fe(OH)3", "MnO4^-", "CuSO4.5H2O", "Fe^3+"
function parseSpeciesToken(token: string): ParsedTokenInternal | null {
  let s = token.trim();
  if (!s) return null;

  const coeffMatch = s.match(/^(\d+)\s*(.+)$/);
  let inputCoeff = 1;
  if (coeffMatch && coeffMatch[1] && coeffMatch[2]) {
    inputCoeff = parseInt(coeffMatch[1], 10) || 1;
    s = coeffMatch[2].trim();
  }

  // Strip state annotations like (s), (l), (g), (aq)
  s = s.replace(/\((s|l|g|aq)\)$/i, "").trim();

  const { base: displayFormula, chargeSuffix } = extractChargeSuffix(s);
  const expandedBase = expandChemicalAbbreviations(displayFormula);
  const solverFormula = `${expandedBase}${chargeSuffix}`;
  const parsed = parseFormula(solverFormula);
  if (!parsed.ok || parsed.counts.size === 0 || parsed.repeatUnit) {
    return null;
  }

  return {
    raw: token.trim(),
    formula: displayFormula,
    inputCoeff,
    counts: Object.fromEntries(parsed.counts),
    charge: parsed.charge,
    mw: Number(parsed.mw.toFixed(2)),
    solverFormula,
  };
}

// Split a reaction side by '+' separators without splitting ionic charges like Fe^2+, Na+, H^+
function splitReactionSide(side: string): string[] {
  const tokens: string[] = [];
  let start = 0;
  for (let i = 0; i < side.length; i++) {
    if (side.charAt(i) !== "+") continue;
    const precededBySpace = i > 0 && /\s/.test(side.charAt(i - 1));
    if (!precededBySpace) {
      const before = side.slice(start, i);
      const after = side.slice(i + 1);
      // Charge sign if preceded by ^ or ^digits (Fe^2+, H^+)
      if (/\^\d*$/.test(before)) continue;
      // Charge sign if at end of species before a separator '+' or optional state tag + '+'
      if (/^\s*(?:\((?:s|l|g|aq)\))?\s*(?:\+|$)/i.test(after)) continue;
    }
    const piece = side.slice(start, i).trim();
    if (piece) tokens.push(piece);
    start = i + 1;
  }
  const tail = side.slice(start).trim();
  if (tail) tokens.push(tail);
  return tokens;
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
  const leftSide = sides[0]?.trim() ?? "";
  const rightSide = sides[1]?.trim() ?? "";
  if (sides.length !== 2 || !leftSide || !rightSide) {
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

  const leftTokens = splitReactionSide(leftSide);
  const rightTokens = splitReactionSide(rightSide);

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

  const parsedReactants: ParsedTokenInternal[] = [];
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

  const parsedProducts: ParsedTokenInternal[] = [];
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

  // Verify identical element sets on both sides for crisp error messages
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

  // Solve stoichiometric coefficients using chem-core's exact BigInt RREF solver
  const solved = solveCoefficients(
    parsedReactants.map((r) => r.solverFormula),
    parsedProducts.map((p) => p.solverFormula),
  );

  if (solved.status !== "ok") {
    return {
      valid: false,
      error_en: solved.message,
      error_fa:
        solved.status === "underdetermined"
          ? "بیش از یک واکنش مستقل با این گونه‌ها سازگار است؛ ضرایب یکتا نیستند."
          : "پاسخ استوکیومتری معتبری با ضرایب مثبت برای موازنه این معادله وجود ندارد.",
      reactants: [],
      products: [],
      atomAudit: [],
      totalMassPerMoleReaction: 0,
      formattedPlain: "",
      matrixSteps_en: [],
      matrixSteps_fa: [],
    };
  }

  const toPublicSpecies = (sp: ParsedTokenInternal, balancedCoeff: number): ParsedSpecies => ({
    raw: sp.raw,
    formula: sp.formula,
    inputCoeff: sp.inputCoeff,
    balancedCoeff,
    counts: sp.counts,
    charge: sp.charge,
    mw: sp.mw,
  });

  const balancedReactants = parsedReactants.map((sp, i) =>
    toPublicSpecies(sp, solved.reactantCoefficients[i] ?? 1),
  );
  const balancedProducts = parsedProducts.map((sp, i) =>
    toPublicSpecies(sp, solved.productCoefficients[i] ?? 1),
  );

  const elements = Array.from(leftElements);
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

  const leftChargeUnbal = balancedReactants.reduce((s, sp) => s + sp.inputCoeff * sp.charge, 0);
  const rightChargeUnbal = balancedProducts.reduce((s, sp) => s + sp.inputCoeff * sp.charge, 0);
  const wasAlreadyBalanced =
    leftChargeUnbal === rightChargeUnbal &&
    atomAudit.every((row) => row.unbalancedLeft === row.unbalancedRight);

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
  const nCols = balancedReactants.length + balancedProducts.length;
  const hasCharge = [...balancedReactants, ...balancedProducts].some((sp) => sp.charge !== 0);
  const nRows = elements.length + (hasCharge ? 1 : 0);

  const matrixSteps_en = [
    `1. Identified ${elements.length} unique elements (${elements.join(", ")}) across ${nCols} chemical species.`,
    `2. Constructed a ${nRows} × ${nCols} atom${hasCharge ? "/charge" : ""}-conservation matrix A·x = 0 and computed exact rational RREF via chem-core.`,
    `3. Reduced the unique nullspace basis vector to minimal positive integer stoichiometric coefficients.`,
  ];

  const matrixSteps_fa = [
    `۱. شناسایی ${elements.length} عنصر مجزا (${elements.join("، ")}) در ${nCols} گونه شیمیایی واکنش.`,
    `۲. تشکیل ماتریس پایستگی اتم${hasCharge ? " و بار" : ""} به ابعاد ${nRows}×${nCols} (A·x = 0) و حل دقیق در میدان اعداد گویا.`,
    `۳. ساده‌سازی بردار پایه فضای پوچ به کوچک‌ترین ضرایب صحیح مثبت استوکیومتری.`,
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
