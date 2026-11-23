import { describe, expect, it } from "vitest";
import { smilesToLayout, type MoleculeLayout } from "./layout";
import { renderMoleculeSvg } from "./render";

const BOND = 52;

function minPairDistance(layout: MoleculeLayout): number {
  let min = Infinity;
  for (let i = 0; i < layout.atoms.length; i++) {
    for (let j = i + 1; j < layout.atoms.length; j++) {
      const a = layout.atoms[i]!;
      const b = layout.atoms[j]!;
      min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y));
    }
  }
  return min;
}

const DIVERSE: Record<string, string> = {
  caffeine: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
  ibuprofen: "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
  cholesterol: "CC(C)CCCC(C)C1CCC2C1(CCC3C2CC=C4C3(CCC(C4)O)C)C",
  adamantane: "C1C2CC3CC1CC(C2)C3",
  naphthalene: "c1ccc2ccccc2c1",
  morphine: "CN1CCC23C4C1CC5=C2C(=C(C=C5)O)OC3C(C=C4)O",
};

describe("smilesToLayout", () => {
  it("benzene is a closed six-membered ring with three double bonds", () => {
    const l = smilesToLayout("c1ccccc1", 400, 240, BOND)!;
    expect(l.atoms).toHaveLength(6);
    expect(l.bonds).toHaveLength(6);
    expect(l.bonds.filter((b) => b.type === "double")).toHaveLength(3);
  });

  it("bond lengths match the requested length", () => {
    const l = smilesToLayout("c1ccccc1", 400, 240, BOND)!;
    for (const b of l.bonds) {
      const a = l.atoms.find((x) => x.id === b.from)!;
      const c = l.atoms.find((x) => x.id === b.to)!;
      expect(Math.hypot(a.x - c.x, a.y - c.y)).toBeCloseTo(BOND, 0);
    }
  });

  it("is centred on the requested point", () => {
    const l = smilesToLayout("CC(=O)Oc1ccccc1C(=O)O", 380, 230, BOND)!;
    const xs = l.atoms.map((a) => a.x);
    const ys = l.atoms.map((a) => a.y);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(380, 0);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(230, 0);
  });

  for (const [name, smiles] of Object.entries(DIVERSE)) {
    it(`${name}: no overlapping atoms`, () => {
      const l = smilesToLayout(smiles, 400, 240, BOND)!;
      expect(l).not.toBeNull();
      expect(minPairDistance(l)).toBeGreaterThan(BOND * 0.4);
    });
  }

  it("keeps charge and hydrogen information in labels", () => {
    const l = smilesToLayout("[NH4+]", 0, 0, BOND)!;
    expect(l.atoms[0]).toMatchObject({ element: "N", charge: 1, label: "NH4⁺" });
    const acid = smilesToLayout("CC(=O)O", 0, 0, BOND)!;
    expect(acid.atoms.map((a) => a.label)).toContain("OH");
  });

  it("keeps stereochemistry as wedge/dash bonds", () => {
    const l = smilesToLayout("C[C@H](N)C(=O)O", 0, 0, BOND)!;
    expect(l.bonds.some((b) => b.type === "wedge" || b.type === "dash")).toBe(true);
  });

  it("is deterministic (ids and coordinates) so output can be snapshot-tested", () => {
    const a = smilesToLayout(DIVERSE["morphine"]!, 400, 240, BOND);
    const b = smilesToLayout(DIVERSE["morphine"]!, 400, 240, BOND);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("returns null for unparseable input", () => {
    expect(smilesToLayout("not a smiles", 0, 0, BOND)).toBeNull();
    expect(smilesToLayout("", 0, 0, BOND)).toBeNull();
  });
});

describe("renderMoleculeSvg", () => {
  it("renders reproducible SVG", () => {
    const a = renderMoleculeSvg("CC(=O)Oc1ccccc1C(=O)O");
    const b = renderMoleculeSvg("CC(=O)Oc1ccccc1C(=O)O");
    expect(a).toBe(b);
    expect(a).toMatch(/^<svg/);
    expect(a).toContain('id="mol"');
  });

  it("acs-1996 preset sizes itself from the 14.4 pt bond length", () => {
    const small = renderMoleculeSvg("CCO", { preset: "acs-1996" })!;
    const big = renderMoleculeSvg("CC(C)Cc1ccc(cc1)C(C)C(=O)O", { preset: "acs-1996" })!;
    const w = (s: string) => Number(/width="(\d+(?:\.\d+)?)px?"/.exec(s)?.[1]);
    expect(w(big)).toBeGreaterThan(w(small));
    expect(small).toContain("0.6");
  });

  it("returns null for bad input", () => {
    expect(renderMoleculeSvg("???")).toBeNull();
  });
});
