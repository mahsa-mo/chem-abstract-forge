import { describe, expect, it } from "vitest";
import { findFormulasInText, parseFormula, toHill } from "./formula";

function counts(formula: string): Record<string, number> {
  const p = parseFormula(formula);
  if (!p.ok) throw new Error(`${formula}: ${p.error}`);
  return Object.fromEntries(p.counts);
}

describe("parseFormula", () => {
  it("parses simple formulas with the right weight", () => {
    const p = parseFormula("H2O");
    expect(p.ok && p.mw).toBeCloseTo(18.015, 2);
    expect(counts("C6H12O6")).toEqual({ C: 6, H: 12, O: 6 });
  });

  it("handles parentheses and nesting", () => {
    expect(counts("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(counts("Al2(SO4)3")).toEqual({ Al: 2, S: 3, O: 12 });
    expect(counts("K4[Fe(CN)6]")).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
  });

  it("handles hydrates", () => {
    expect(counts("CuSO4·5H2O")).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    const p = parseFormula("CuSO4.5H2O");
    expect(p.ok && p.mw).toBeCloseTo(249.68, 0);
  });

  it("handles unicode subscripts and charges", () => {
    expect(counts("H₂SO₄")).toEqual({ H: 2, S: 1, O: 4 });
    const sulfate = parseFormula("SO4^2-");
    expect(sulfate.ok && sulfate.charge).toBe(-2);
    const ferrous = parseFormula("Fe²⁺");
    expect(ferrous.ok && ferrous.charge).toBe(2);
    const sodium = parseFormula("Na+");
    expect(sodium.ok && sodium.charge).toBe(1);
  });

  it("flags polymer repeat units and counts one unit", () => {
    const p = parseFormula("(C2H4)n");
    expect(p.ok && p.repeatUnit).toBe(true);
    expect(p.ok && Object.fromEntries(p.counts)).toEqual({ C: 2, H: 4 });
  });

  it("knows heavy and transition elements (old table returned a fake weight of 12)", () => {
    const pd = parseFormula("Pd");
    expect(pd.ok && pd.mw).toBeCloseTo(106.42, 1);
    for (const f of ["Pt", "Au", "Ni", "Co", "Sn", "Li", "B", "Se"]) {
      const p = parseFormula(f);
      expect(p.ok && p.mw).toBeGreaterThan(6);
    }
    const bor = parseFormula("PhB(OH)2".replace("Ph", "C6H5"));
    expect(bor.ok && bor.mw).toBeCloseTo(121.93, 0);
  });

  it("rejects bad input with a reason instead of guessing", () => {
    for (const bad of ["", "Xx2", "DMF", "THF", "Ca(OH", "Ca)OH(", "H2O3x!", "C0"]) {
      expect(parseFormula(bad).ok, bad).toBe(false);
    }
    const amb = parseFormula("Fe2+");
    expect(amb.ok).toBe(false);
    expect(!amb.ok && amb.error).toMatch(/caret/i);
  });
});

describe("toHill", () => {
  it("orders C, H, then alphabetical", () => {
    const p = parseFormula("NaHCO3");
    expect(p.ok && toHill(p.counts)).toBe("CHNaO3");
  });
  it("is fully alphabetical without carbon", () => {
    const water = parseFormula("H2O");
    expect(water.ok && toHill(water.counts)).toBe("H2O");
    const salt = parseFormula("NaCl");
    expect(salt.ok && toHill(salt.counts)).toBe("ClNa");
  });
});

describe("findFormulasInText", () => {
  it("finds formulas including parentheses", () => {
    expect(findFormulasInText("Ca(OH)2 reacts with HCl to give CaCl2 and H2O")).toEqual([
      "Ca(OH)2",
      "HCl",
      "CaCl2",
      "H2O",
    ]);
  });
  it("ignores solvent abbreviations and ordinary words", () => {
    const text =
      "In THF or DMF, As shown by NMR and UV, No reaction occurs. Water is used with NaOH.";
    expect(findFormulasInText(text)).toEqual(["NaOH"]);
  });
  it("keeps polymer repeat units", () => {
    expect(findFormulasInText("polymerised to (C2H4)n")).toEqual(["(C2H4)n"]);
  });
});
