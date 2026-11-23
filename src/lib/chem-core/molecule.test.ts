import { describe, expect, it } from "vitest";
import { analyzeSmiles } from "./molecule";
import { parseFormula } from "./formula";

describe("analyzeSmiles — valid structures", () => {
  it("aspirin", () => {
    const a = analyzeSmiles("CC(=O)Oc1ccccc1C(=O)O");
    expect(a.ok).toBe(true);
    expect(a.formula).toBe("C9H8O4");
    expect(a.mw).toBeCloseTo(180.16, 1);
    expect(a.exactMass).toBeCloseTo(180.0423, 3);
    expect(a.atomCount).toBe(13);
    expect(a.bondCount).toBe(13);
    expect(a.ringCount).toBe(1);
    expect(a.aromaticAtomCount).toBe(6);
  });

  it("different SMILES of the same molecule share an ID code", () => {
    expect(analyzeSmiles("OC(=O)C").idCode).toBe(analyzeSmiles("CC(=O)O").idCode);
  });

  it("enantiomers have different ID codes", () => {
    const l = analyzeSmiles("C[C@H](N)C(=O)O").idCode;
    const d = analyzeSmiles("C[C@@H](N)C(=O)O").idCode;
    expect(l).not.toBe(d);
  });

  it("charges and salts", () => {
    expect(analyzeSmiles("[NH4+]").netCharge).toBe(1);
    const salt = analyzeSmiles("[Na+].[Cl-]");
    expect(salt.ok).toBe(true);
    expect(salt.netCharge).toBe(0);
    expect(salt.fragmentCount).toBe(2);
  });

  it("valid hypervalent main-group chemistry is not rejected", () => {
    for (const s of [
      "FS(F)(F)(F)(F)F",
      "CS(C)(=O)=O",
      "CP(=O)(O)O",
      "O=S(=O)(O)O",
      "[O-]Cl(=O)(=O)=O",
    ]) {
      expect(analyzeSmiles(s).ok, s).toBe(true);
    }
  });

  it("accepts nitro written in the older neutral pentavalent form", () => {
    const a = analyzeSmiles("c1ccccc1N(=O)=O");
    expect(a.ok).toBe(true);
    expect(a.formula).toBe("C6H5NO2");
  });

  it("agrees with the formula parser on molecular weight", () => {
    const fromSmiles = analyzeSmiles("CC(=O)Oc1ccccc1C(=O)O").mw ?? 0;
    const fromFormula = parseFormula("C9H8O4");
    expect(fromFormula.ok && fromFormula.mw).toBeCloseTo(fromSmiles, 1);
  });

  it("is reproducible", () => {
    expect(analyzeSmiles("CCO")).toEqual(analyzeSmiles("CCO"));
  });
});

describe("analyzeSmiles — invalid structures are rejected", () => {
  it("over-valent carbon (old validator accepted these)", () => {
    for (const s of ["CC(=O)(=O)=O", "C(C)(C)(C)(C)C", "[CH5]", "C[N](C)(C)(C)(C)C"]) {
      const a = analyzeSmiles(s);
      expect(a.parsed, s).toBe(true);
      expect(a.ok, s).toBe(false);
      expect(a.errors.length, s).toBeGreaterThan(0);
    }
  });

  it("syntax problems", () => {
    for (const s of ["", "  ", "C1CC", "xyz", "C(C", "CC)C", "C[NH4", "C]C", "???"]) {
      const a = analyzeSmiles(s);
      expect(a.parsed, JSON.stringify(s)).toBe(false);
      expect(a.ok).toBe(false);
    }
  });
});
