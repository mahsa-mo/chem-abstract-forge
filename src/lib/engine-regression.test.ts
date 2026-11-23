/**
 * Regression tests for bugs found in the existing engine files.
 * Each test fails on the code as it was before the fix.
 */
import { describe, expect, it } from "vitest";
import { smilesToGraph, exportGraphToSvg, type ChemGraph } from "./chemdraw-engine";
import { validateSmiles } from "./smiles-validator";
import { analyzeSmiles } from "./chem-core/molecule";
import { parseAndAuditReaction } from "./reaction-parser";
import { balanceChemicalEquation } from "./equation-balancer";
import {
  buildScientificVectorSvgDetailed,
  detectPedagogicalIntent,
} from "./scientific-vector-abstract";

function minAtomDistance(g: ChemGraph): number {
  let min = Infinity;
  for (let i = 0; i < g.atoms.length; i++) {
    for (let j = i + 1; j < g.atoms.length; j++) {
      const a = g.atoms[i]!;
      const b = g.atoms[j]!;
      min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y));
    }
  }
  return min;
}

describe("validateSmiles", () => {
  it("rejects over-valent atoms the old validator accepted", () => {
    for (const s of ["CC(=O)(=O)=O", "[CH5]", "C[N](C)(C)(C)(C)C"]) {
      expect(validateSmiles(s).valid, s).toBe(false);
    }
  });

  it("still accepts ordinary valid structures", () => {
    for (const s of ["CC(=O)Oc1ccccc1C(=O)O", "C[C@H](N)C(=O)O", "[Na+].[Cl-]", "CS(C)(=O)=O"]) {
      expect(validateSmiles(s).valid, s).toBe(true);
    }
  });

  it("counts bonds and rings from the real structure", () => {
    const aspirin = validateSmiles("CC(=O)Oc1ccccc1C(=O)O");
    expect(aspirin.atomCount).toBe(13);
    expect(aspirin.bondCount).toBe(13); // old code reported atomCount - 1 = 12
    expect(aspirin.ringCount).toBe(1);
  });
});

describe("smilesToGraph", () => {
  it("does not draw every sulfonamide as celecoxib", () => {
    // benzenesulfonamide written so it contains the substring the old preset test used
    // ("S(N)(=O)=O"): 6 ring C + S + 2 O + N = 10 heavy atoms
    const g = smilesToGraph("c1ccccc1S(N)(=O)=O");
    expect(g.atoms).toHaveLength(10);
    expect(g.bonds).toHaveLength(10);
    expect(g.atoms.some((a) => a.element === "CF3")).toBe(false);
  });

  it("still draws celecoxib by name", () => {
    expect(smilesToGraph("celecoxib").atoms.some((a) => a.element === "CF3")).toBe(true);
  });

  it("lays out a fused-ring molecule with every atom and bond and no overlaps", () => {
    // cholesterol: four fused rings. The old 60° zig-zag walker left the rings open and drew
    // lines straight through the structure (see the gallery in the PR notes).
    const smiles = "CC(C)CCCC(C)C1CCC2C1(CCC3C2CC=C4C3(CCC(C4)O)C)C";
    const expected = analyzeSmiles(smiles);
    const g = smilesToGraph(smiles);
    expect(g.atoms).toHaveLength(expected.atomCount!);
    expect(g.bonds).toHaveLength(expected.bondCount!);
    expect(minAtomDistance(g)).toBeGreaterThan(20);
  });

  it("keeps charge in the drawn label", () => {
    const g = smilesToGraph("CC(=O)[O-]");
    const svg = exportGraphToSvg(g);
    expect(svg).toContain("O⁻");
  });

  it("is deterministic (old ids came from Math.random)", () => {
    expect(JSON.stringify(smilesToGraph("CCN(CC)CC"))).toBe(
      JSON.stringify(smilesToGraph("CCN(CC)CC")),
    );
  });
});

describe("parseAndAuditReaction (offline path)", () => {
  it("keeps Ca(OH)2 as one species and ignores THF / DMF", async () => {
    const audit = await parseAndAuditReaction(
      "Ca(OH)2 reacts with CO2 in THF and DMF to give CaCO3",
    );
    const formulas = audit.reactants.map((r) => r.formula);
    expect(formulas).toContain("Ca(OH)2");
    expect(formulas).not.toContain("THF");
    expect(formulas).not.toContain("DMF");
    expect(formulas).not.toContain("OH");
  });

  it("gives real molecular weights for heavy elements (old table used 12)", async () => {
    const audit = await parseAndAuditReaction("PdCl2 catalyses the reaction");
    const pd = [...audit.reactants, ...audit.products].find((s) => s.formula === "PdCl2");
    expect(pd?.mw).toBeCloseTo(177.33, 0);
  });
});

describe("balanceChemicalEquation (chem-core backed)", () => {
  it("balances permanganate + HCl cleanly", () => {
    const res = balanceChemicalEquation("KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O");
    expect(res.valid).toBe(true);
    expect(res.reactants.map((r) => r.balancedCoeff)).toEqual([2, 16]);
    expect(res.products.map((p) => p.balancedCoeff)).toEqual([2, 2, 5, 8]);
  });

  it("balances ionic equations using charge conservation", () => {
    const res = balanceChemicalEquation("MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O");
    expect(res.valid).toBe(true);
    expect(res.reactants.map((r) => r.balancedCoeff)).toEqual([1, 5, 8]);
    expect(res.products.map((p) => p.balancedCoeff)).toEqual([1, 5, 4]);
  });

  it("rejects underdetermined equations without guessing", () => {
    const res = balanceChemicalEquation("H2 + O2 -> H2O + H2O2");
    expect(res.valid).toBe(false);
  });
});

describe("scientific-vector-abstract quality & intent routing", () => {
  it("does not trigger pedagogical cartoon on chemistry terms like 'catalyzed' or Persian substrings", () => {
    expect(
      detectPedagogicalIntent(
        "Acid-catalyzed Fischer esterification: salicylic acid with acetic anhydride",
      ).isPedagogical,
    ).toBe(false);
    expect(detectPedagogicalIntent("استخراج متان از چمنزار").isPedagogical).toBe(false);
    expect(
      detectPedagogicalIntent("Explain the Suzuki coupling catalytic cycle").isPedagogical,
    ).toBe(false);
    expect(
      detectPedagogicalIntent("شیمیست در حال توضیح واکنش کلمنسن به یک گربه").isPedagogical,
    ).toBe(true);
  });

  it("renders valid fitted publication SVGs for all core presets without overflow or cartoons", async () => {
    const fischer = await buildScientificVectorSvgDetailed(
      "Acid-catalyzed Fischer esterification: salicylic acid is heated under reflux with excess acetic anhydride in the presence of concentrated sulfuric acid catalyst at 85 °C for 30 minutes, precipitating acetylsalicylic acid (aspirin).",
      "acs",
      "academic-clean",
    );
    expect(fischer?.svg).toContain("<svg");
    expect(fischer?.svg).not.toContain("cat-observer");
    expect(fischer?.svg).toContain("Salicylic Acid");
    expect(fischer?.svg).toContain('overflow="hidden"');

    const suzuki = await buildScientificVectorSvgDetailed(
      "Palladium-catalyzed Suzuki-Miyaura cross-coupling: 4-bromoanisole reacts with phenylboronic acid using Pd(PPh3)4 and K2CO3 in DMF/H2O at 80 °C.",
      "rsc",
      "colorblind-safe",
    );
    expect(suzuki?.svg).toContain("#0072B2");
    expect(suzuki?.svg).not.toContain("NaN");
    expect(suzuki?.svg).toContain("4-Methoxybiphenyl");

    const aldol = await buildScientificVectorSvgDetailed(
      "Asymmetric direct aldol reaction: cyclohexanone and 4-nitrobenzaldehyde react with 20 mol% L-proline catalyst in DMSO at 25 °C for 24 h in 88% yield and 96% ee.",
      "nature",
      "nature-editorial",
    );
    expect(aldol?.svg).toContain("L-Proline");
    expect(aldol?.svg).toContain("96% ee");
    expect(aldol?.svg).not.toContain("C6H10O*");

    const cox = await buildScientificVectorSvgDetailed(
      "Aspirin functions as an acetylating agent inhibiting COX-1 and COX-2 cyclooxygenase enzymes and prostaglandin synthesis.",
      "acs",
      "academic-clean",
    );
    expect(cox?.svg).toContain("COX-1");
    expect(cox?.svg).toContain("COX-2");
    expect(cox?.svg).toContain('overflow="hidden"');
  });
});
