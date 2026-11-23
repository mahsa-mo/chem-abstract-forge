/**
 * Chemical formula parser.
 *
 * Handles: nested parentheses/brackets  Ca(OH)2, K4[Fe(CN)6]
 *          hydrates                     CuSO4·5H2O
 *          unicode sub/superscripts     H₂SO₄, Fe²⁺
 *          explicit charges             SO4^2-, Na+
 *          polymer repeat units         (C2H4)n   -> repeatUnit = true (one unit is counted)
 *
 * It never guesses: an unknown element or malformed input returns `ok: false`
 * with a reason instead of an invented number.
 */
import { atomicWeight, isElementSymbol } from "./periodic";

export type ParsedFormula =
  | {
      ok: true;
      counts: Map<string, number>;
      charge: number;
      /** Molecular weight of the formula as written (one repeat unit for polymers). */
      mw: number;
      repeatUnit: boolean;
    }
  | { ok: false; error: string };

class FormulaError extends Error {}

const SUPERSCRIPT: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
};

const CLOSERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
const MAX_COUNT = 1_000_000;

function normalize(input: string): string {
  return input
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (run) => "^" + [...run].map((c) => SUPERSCRIPT[c] ?? c).join(""))
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "");
}

interface Ctx {
  src: string;
  pos: number;
  repeat: boolean;
}

function readInt(ctx: Ctx): number | null {
  const m = /^\d+/.exec(ctx.src.slice(ctx.pos));
  if (!m) return null;
  ctx.pos += m[0].length;
  const n = parseInt(m[0], 10);
  if (n === 0 || n > MAX_COUNT) throw new FormulaError(`Invalid count "${m[0]}"`);
  return n;
}

function addInto(target: Map<string, number>, source: Map<string, number>, factor: number) {
  for (const [el, n] of source) target.set(el, (target.get(el) ?? 0) + n * factor);
}

function parseSeq(ctx: Ctx, closer: string | null): Map<string, number> {
  const counts = new Map<string, number>();
  while (ctx.pos < ctx.src.length) {
    const ch = ctx.src.charAt(ctx.pos);

    if (closer !== null && ch === closer) {
      ctx.pos++;
      return counts;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      throw new FormulaError(`Unbalanced "${ch}"`);
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      ctx.pos++;
      const inner = parseSeq(ctx, CLOSERS[ch] ?? null);
      const next = ctx.src.charAt(ctx.pos);
      let factor = 1;
      if (/[nmx]/.test(next) && !/[a-z]/.test(ctx.src.charAt(ctx.pos + 1))) {
        ctx.repeat = true; // (C2H4)n — count a single repeat unit
        ctx.pos++;
      } else {
        factor = readInt(ctx) ?? 1;
      }
      addInto(counts, inner, factor);
      continue;
    }

    if (/[A-Z]/.test(ch)) {
      const two = ch + ctx.src.charAt(ctx.pos + 1);
      let symbol: string;
      if (/^[A-Z][a-z]$/.test(two) && isElementSymbol(two)) symbol = two;
      else if (isElementSymbol(ch)) symbol = ch;
      else throw new FormulaError(`Unknown element "${two.trim()}"`);
      ctx.pos += symbol.length;
      const n = readInt(ctx) ?? 1;
      counts.set(symbol, (counts.get(symbol) ?? 0) + n);
      continue;
    }

    throw new FormulaError(`Unexpected character "${ch}"`);
  }
  if (closer !== null) throw new FormulaError(`Missing "${closer}"`);
  return counts;
}

export function parseFormula(input: string): ParsedFormula {
  try {
    let s = normalize(input);
    if (!s) return { ok: false, error: "Empty formula" };

    // --- charge -----------------------------------------------------------
    let charge = 0;
    const caret = /\^(\d*)([+-])$/.exec(s);
    if (caret) {
      const mag = caret[1] ? parseInt(caret[1], 10) : 1;
      charge = caret[2] === "+" ? mag : -mag;
      s = s.slice(0, caret.index);
    } else if (/[+-]$/.test(s)) {
      if (/\d/.test(s.charAt(s.length - 2))) {
        return {
          ok: false,
          error: 'Ambiguous charge — write it with a caret, e.g. "Fe^2+" or "NH4^+"',
        };
      }
      charge = s.endsWith("+") ? 1 : -1;
      s = s.slice(0, -1);
    }

    // --- hydrates / adducts ----------------------------------------------
    const parts = s.split(/[·•*.]/);
    const total = new Map<string, number>();
    const ctxRepeat = { value: false };
    parts.forEach((part, index) => {
      let factor = 1;
      let body = part;
      if (index > 0) {
        const lead = /^(\d+)(?=[A-Z({[])/.exec(part);
        if (lead) {
          factor = parseInt(lead[1] ?? "1", 10);
          body = part.slice(lead[0].length);
        }
      }
      if (!body) throw new FormulaError("Empty fragment");
      const ctx: Ctx = { src: body, pos: 0, repeat: false };
      const counts = parseSeq(ctx, null);
      if (ctx.repeat) ctxRepeat.value = true;
      addInto(total, counts, factor);
    });

    if (total.size === 0) return { ok: false, error: "No elements found" };

    // --- molecular weight -------------------------------------------------
    let mw = 0;
    for (const [el, n] of total) {
      const w = atomicWeight(el);
      if (w === undefined) return { ok: false, error: `No atomic weight for "${el}"` };
      mw += w * n;
    }

    return { ok: true, counts: total, charge, mw, repeatUnit: ctxRepeat.value };
  } catch (err) {
    if (err instanceof FormulaError) return { ok: false, error: err.message };
    throw err;
  }
}

/** Common abbreviations that happen to be written with valid element symbols. */
const NOT_FORMULAS = new Set(["UV", "CV", "PBS", "IR", "NIR", "TOC", "NMR", "HPLC", "FTIR"]);

const FORMULA_CANDIDATE =
  /(?<![A-Za-z0-9])(?:[A-Z][a-z]?\d*|\([A-Za-z0-9()]*\)(?:\d+|n)?)+(?![a-z])/g;

/**
 * Find chemical formulas in free text, e.g. "Ca(OH)2 reacts with HCl" -> ["Ca(OH)2", "HCl"].
 * A candidate must parse as a valid formula (all symbols real elements) and look like a
 * formula rather than a word: at least two element groups, a count, or a parenthesis.
 * So "THF", "DMF", "In", "As" and "No" are rejected while "NaCl", "CO2" and "H2SO4" are kept.
 */
export function findFormulasInText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(FORMULA_CANDIDATE)) {
    const candidate = match[0];
    if (NOT_FORMULAS.has(candidate)) continue;
    const parsed = parseFormula(candidate);
    if (!parsed.ok) continue;
    const groups = (candidate.match(/[A-Z]/g) ?? []).length;
    if (groups < 2 && !/[\d()]/.test(candidate)) continue;
    found.add(candidate);
  }
  return [...found];
}

/** Hill-system formula string: C, H, then alphabetical (all alphabetical if no carbon). */
export function toHill(counts: Map<string, number>): string {
  const keys = [...counts.keys()];
  const hasCarbon = counts.has("C");
  const ordered = hasCarbon
    ? ["C", ...(counts.has("H") ? ["H"] : []), ...keys.filter((k) => k !== "C" && k !== "H").sort()]
    : keys.sort();
  return ordered
    .map((el) => {
      const n = counts.get(el) ?? 0;
      return n === 1 ? el : `${el}${n}`;
    })
    .join("");
}
