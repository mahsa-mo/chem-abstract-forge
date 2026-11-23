import { describe, expect, it } from "vitest";
import { checkBalance, solveCoefficients } from "./balance";

describe("checkBalance", () => {
  it("accepts a balanced reaction", () => {
    const r = checkBalance(
      [{ formula: "H2", coefficient: 2 }, { formula: "O2" }],
      [{ formula: "H2O", coefficient: 2 }],
    );
    expect(r.balanced).toBe(true);
  });

  it("rejects an unbalanced reaction and names the elements", () => {
    const r = checkBalance(
      [{ formula: "CH4" }, { formula: "O2" }],
      [{ formula: "CO2" }, { formula: "H2O" }],
    );
    expect(r.balanced).toBe(false);
    expect(r.elements.find((e) => e.element === "H")).toMatchObject({
      left: 4,
      right: 2,
      balanced: false,
    });
  });

  it("has no ±1 tolerance (the old audit passed a one-atom difference)", () => {
    const r = checkBalance(
      [{ formula: "N2" }, { formula: "H2", coefficient: 3 }],
      [{ formula: "NH3" }],
    );
    expect(r.balanced).toBe(false);
    expect(r.elements.find((e) => e.element === "N")).toMatchObject({ left: 2, right: 1 });
  });

  it("checks charge", () => {
    const ok = checkBalance(
      [{ formula: "Fe^3+" }, { formula: "Cl^-", coefficient: 3 }],
      [{ formula: "FeCl3" }],
    );
    expect(ok.balanced).toBe(true);
    const bad = checkBalance([{ formula: "Fe^3+" }], [{ formula: "Fe^2+" }]);
    expect(bad.chargeBalanced).toBe(false);
    expect(bad.balanced).toBe(false);
  });

  it("does not claim balance when a formula cannot be parsed", () => {
    const r = checkBalance([{ formula: "DMF" }], [{ formula: "DMF" }]);
    expect(r.balanced).toBe(false);
    expect(r.errors.length).toBe(2);
  });
});

describe("solveCoefficients", () => {
  it("methane combustion", () => {
    expect(solveCoefficients(["CH4", "O2"], ["CO2", "H2O"])).toEqual({
      status: "ok",
      reactantCoefficients: [1, 2],
      productCoefficients: [1, 2],
    });
  });

  it("iron oxidation", () => {
    expect(solveCoefficients(["Fe", "O2"], ["Fe2O3"])).toEqual({
      status: "ok",
      reactantCoefficients: [4, 3],
      productCoefficients: [2],
    });
  });

  it("permanganate + HCl (five species)", () => {
    expect(solveCoefficients(["KMnO4", "HCl"], ["KCl", "MnCl2", "Cl2", "H2O"])).toEqual({
      status: "ok",
      reactantCoefficients: [2, 16],
      productCoefficients: [2, 2, 5, 8],
    });
  });

  it("ionic equation uses charge", () => {
    expect(solveCoefficients(["MnO4^-", "Fe^2+", "H^+"], ["Mn^2+", "Fe^3+", "H2O"])).toEqual({
      status: "ok",
      reactantCoefficients: [1, 5, 8],
      productCoefficients: [1, 5, 4],
    });
  });

  it("explains why it cannot answer", () => {
    expect(solveCoefficients(["H2", "O2"], ["H2O", "H2O2"]).status).toBe("underdetermined");
    expect(solveCoefficients(["H2"], ["O2"]).status).toBe("impossible");
    expect(solveCoefficients(["Xx"], ["H2"]).status).toBe("invalid");
    expect(solveCoefficients(["(C2H4)n"], ["(C2H4)n"]).status).toBe("invalid");
  });
});
