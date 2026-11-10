import React, { useState, useMemo } from "react";
import {
  Calculator,
  Scale,
  FlaskConical,
  Atom,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Beaker,
  ArrowRight,
  RotateCcw,
  Droplets,
  Gauge,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { BufferAndPhLab, VacuumAndGreenChemLab } from "@/components/LabToolsAdvanced";
import { EquationBalancer } from "@/components/EquationBalancer";
import { PeriodicCatalystHub } from "@/components/PeriodicCatalystHub";
import { toast } from "sonner";

// Standard IUPAC Atomic Weights
const ATOMIC_WEIGHTS: Record<
  string,
  {
    mass: number;
    name_en: string;
    name_fa: string;
    color: string;
    group: string;
    ox: string;
    config: string;
    eneg: number;
    role_fa: string;
    role_en: string;
  }
> = {
  H: {
    mass: 1.008,
    name_en: "Hydrogen",
    name_fa: "هیدروژن",
    color: "#94a3b8",
    group: "Nonmetal",
    ox: "+1, -1",
    config: "1s¹",
    eneg: 2.2,
    role_fa: "هیدروژناسیون کاتالیزوری و انتقال پروتون",
    role_en: "Catalytic hydrogenation & proton transfer",
  },
  He: {
    mass: 4.0026,
    name_en: "Helium",
    name_fa: "هلیوم",
    color: "#38bdf8",
    group: "Noble Gas",
    ox: "0",
    config: "1s²",
    eneg: 0,
    role_fa: "گاز حامل در کروماتوگرافی گازی (GC)",
    role_en: "Carrier gas in GC & NMR cryogenics",
  },
  Li: {
    mass: 6.94,
    name_en: "Lithium",
    name_fa: "لیتیوم",
    color: "#a855f7",
    group: "Alkali Metal",
    ox: "+1",
    config: "[He] 2s¹",
    eneg: 0.98,
    role_fa: "بازهای قوی (n-BuLi, LDA) و لیتیاسیون",
    role_en: "Strong bases (n-BuLi, LDA) & organolithium reagents",
  },
  B: {
    mass: 10.81,
    name_en: "Boron",
    name_fa: "بور",
    color: "#fb7185",
    group: "Metalloid",
    ox: "+3",
    config: "[He] 2s² 2p¹",
    eneg: 2.04,
    role_fa: "بورونیک اسیدها در واکنش سوزوکی و هیدروبوراسیون",
    role_en: "Boronic acids in Suzuki coupling & hydroboration",
  },
  C: {
    mass: 12.011,
    name_en: "Carbon",
    name_fa: "کربن",
    color: "#334155",
    group: "Nonmetal",
    ox: "+4, +2, -4",
    config: "[He] 2s² 2p²",
    eneg: 2.55,
    role_fa: "اسکلت اصلی تمام ترکیبات آلی و دارویی",
    role_en: "Backbone of all organic & pharmaceutical frameworks",
  },
  N: {
    mass: 14.007,
    name_en: "Nitrogen",
    name_fa: "نیتروژن",
    color: "#2563eb",
    group: "Nonmetal",
    ox: "-3, +3, +5",
    config: "[He] 2s² 2p³",
    eneg: 3.04,
    role_fa: "آمین‌ها، هتروسیکل‌های دارویی و اتمسفر خنثی",
    role_en: "Amines, N-heterocycles, and inert reaction atmosphere",
  },
  O: {
    mass: 15.999,
    name_en: "Oxygen",
    name_fa: "اکسیژن",
    color: "#e11d48",
    group: "Nonmetal",
    ox: "-2",
    config: "[He] 2s² 2p⁴",
    eneg: 3.44,
    role_fa: "گروه‌های عاملی کربونیل، هیدروکسیل و اکسیداسیون",
    role_en: "Carbonyls, alcohols, ethers, and aerobic oxidations",
  },
  F: {
    mass: 18.998,
    name_en: "Fluorine",
    name_fa: "فلوئور",
    color: "#10b981",
    group: "Halogen",
    ox: "-1",
    config: "[He] 2s² 2p⁵",
    eneg: 3.98,
    role_fa: "افزایش پایداری متابولیک و چربی‌دوستی داروها",
    role_en: "Metabolic stability & lipophilicity modulation in drugs",
  },
  Na: {
    mass: 22.99,
    name_en: "Sodium",
    name_fa: "سدیم",
    color: "#8b5cf6",
    group: "Alkali Metal",
    ox: "+1",
    config: "[Ne] 3s¹",
    eneg: 0.93,
    role_fa: "عوامل کاهنده (NaBH4) و بازهای معدنی",
    role_en: "Reducing agents (NaBH4, NaH) & alkoxide bases",
  },
  Mg: {
    mass: 24.305,
    name_en: "Magnesium",
    name_fa: "منیزیم",
    color: "#14b8a6",
    group: "Alkaline Earth",
    ox: "+2",
    config: "[Ne] 3s²",
    eneg: 1.31,
    role_fa: "معرف‌های گرینیارد (RMgX) برای تشکیل پیوند C-C",
    role_en: "Grignard reagents (RMgX) for C–C bond formation",
  },
  Al: {
    mass: 26.982,
    name_en: "Aluminum",
    name_fa: "آلومینیوم",
    color: "#64748b",
    group: "Post-Transition",
    ox: "+3",
    config: "[Ne] 3s² 3p¹",
    eneg: 1.61,
    role_fa: "اسید لوئیس (AlCl3) در فریدل-کرافتس و کاهنده LiAlH4",
    role_en: "Lewis acid (AlCl3) in Friedel-Crafts & LiAlH4 reductions",
  },
  Si: {
    mass: 28.085,
    name_en: "Silicon",
    name_fa: "سیلیسیم",
    color: "#d97706",
    group: "Metalloid",
    ox: "+4",
    config: "[Ne] 3s² 3p²",
    eneg: 1.9,
    role_fa: "گروه‌های محافظ سیلیل (TMS, TBDMS) و سیلیکاژل",
    role_en: "Silyl protecting groups (TMS, TBS) & chromatography",
  },
  P: {
    mass: 30.974,
    name_en: "Phosphorus",
    name_fa: "فسفر",
    color: "#ea580c",
    group: "Nonmetal",
    ox: "+3, +5",
    config: "[Ne] 3s² 3p³",
    eneg: 2.19,
    role_fa: "لیگاندهای فسفین (PPh3, RuPhos) و واکنش ویتیگ",
    role_en: "Phosphine ligands (PPh3, BINAP) & Wittig olefination",
  },
  S: {
    mass: 32.06,
    name_en: "Sulfur",
    name_fa: "گوگرد",
    color: "#ca8a04",
    group: "Nonmetal",
    ox: "-2, +4, +6",
    config: "[Ne] 3s² 3p⁴",
    eneg: 2.58,
    role_fa: "تیول‌ها، سولفونامیدهای دارویی و حلال DMSO",
    role_en: "Sulfonamides, thioethers, and polar aprotic DMSO",
  },
  Cl: {
    mass: 35.45,
    name_en: "Chlorine",
    name_fa: "کلر",
    color: "#16a34a",
    group: "Halogen",
    ox: "-1, +1, +5",
    config: "[Ne] 3s² 3p⁵",
    eneg: 3.16,
    role_fa: "آریل/آلکیل کلریدها و حلال دی‌کلرومتان (DCM)",
    role_en: "Electrophilic substrates, acyl chlorides, and DCM solvent",
  },
  K: {
    mass: 39.098,
    name_en: "Potassium",
    name_fa: "پتاسیم",
    color: "#7c3aed",
    group: "Alkali Metal",
    ox: "+1",
    config: "[Ar] 4s¹",
    eneg: 0.82,
    role_fa: "بازهای پرکاربرد K2CO3، K3PO4 و KOtBu در جفت‌شدن",
    role_en: "Essential bases (K2CO3, K3PO4, KOtBu) in cross-coupling",
  },
  Ca: {
    mass: 40.078,
    name_en: "Calcium",
    name_fa: "کلسیم",
    color: "#0d9488",
    group: "Alkaline Earth",
    ox: "+2",
    config: "[Ar] 4s²",
    eneg: 1.0,
    role_fa: "خشک‌کننده حلال‌ها (CaH2, CaCl2)",
    role_en: "Desiccants (CaH2, CaCl2) and Lewis acid additives",
  },
  Ti: {
    mass: 47.867,
    name_en: "Titanium",
    name_fa: "تیتانیوم",
    color: "#6366f1",
    group: "Transition Metal",
    ox: "+4, +3",
    config: "[Ar] 3d² 4s²",
    eneg: 1.54,
    role_fa: "اپوکسیداسیون شارپلس و جفت‌شدن مک‌موری",
    role_en: "Sharpless asymmetric epoxidation & McMurry coupling",
  },
  Cr: {
    mass: 51.996,
    name_en: "Chromium",
    name_fa: "کروم",
    color: "#3b82f6",
    group: "Transition Metal",
    ox: "+3, +6",
    config: "[Ar] 3d⁵ 4s¹",
    eneg: 1.66,
    role_fa: "اکسیداسیون جونز، PCC و جفت‌شدن نوزاکی-هیاما",
    role_en: "PCC/PDC oxidations & Nozaki-Hiyama-Kishi coupling",
  },
  Mn: {
    mass: 54.938,
    name_en: "Manganese",
    name_fa: "منگنز",
    color: "#8b5cf6",
    group: "Transition Metal",
    ox: "+2, +4, +7",
    config: "[Ar] 3d⁵ 4s²",
    eneg: 1.55,
    role_fa: "اکسیداسیون آلیلیک با MnO2 و اپوکسیداسیون ژاکوبسن",
    role_en: "Allylic oxidation (MnO2) & Jacobsen epoxidation",
  },
  Fe: {
    mass: 55.845,
    name_en: "Iron",
    name_fa: "آهن",
    color: "#d97706",
    group: "Transition Metal",
    ox: "+2, +3",
    config: "[Ar] 3d⁶ 4s²",
    eneg: 1.83,
    role_fa: "فروسن، کاتالیز سبز آهن و اسید لوئیس FeCl3",
    role_en: "Ferrocene, sustainable iron catalysis & FeCl3 Lewis acid",
  },
  Co: {
    mass: 58.933,
    name_en: "Cobalt",
    name_fa: "کبالت",
    color: "#2563eb",
    group: "Transition Metal",
    ox: "+2, +3",
    config: "[Ar] 3d⁷ 4s²",
    eneg: 1.88,
    role_fa: "واکنش پاوسون-خاند و کاتالیز انتقال اتم هیدروژن",
    role_en: "Pauson-Khand cycloaddition & HAT catalysis",
  },
  Ni: {
    mass: 58.693,
    name_en: "Nickel",
    name_fa: "نیکل",
    color: "#10b981",
    group: "Transition Metal",
    ox: "0, +2",
    config: "[Ar] 3d⁸ 4s²",
    eneg: 1.91,
    role_fa: "جفت‌شدن متقاطع نیکل/فوتورداکس و نیکل رانی",
    role_en: "Metallaphotoredox C(sp³)–C(sp²) coupling & Raney Ni",
  },
  Cu: {
    mass: 63.546,
    name_en: "Copper",
    name_fa: "مس",
    color: "#ea580c",
    group: "Transition Metal",
    ox: "+1, +2",
    config: "[Ar] 3d¹⁰ 4s¹",
    eneg: 1.9,
    role_fa: "شیمی کلیک (CuAAC)، جفت‌شدن اولمن و سونوگاشیرا",
    role_en: "CuAAC Click chemistry, Ullmann & Sonogashira co-catalyst",
  },
  Zn: {
    mass: 65.38,
    name_en: "Zinc",
    name_fa: "روی",
    color: "#64748b",
    group: "Transition Metal",
    ox: "+2",
    config: "[Ar] 3d¹⁰ 4s²",
    eneg: 1.65,
    role_fa: "جفت‌شدن نگیشی و واکنش رفورماتسکی",
    role_en: "Negishi cross-coupling & Reformatsky reaction",
  },
  Br: {
    mass: 79.904,
    name_en: "Bromine",
    name_fa: "برم",
    color: "#9333ea",
    group: "Halogen",
    ox: "-1",
    config: "[Ar] 3d¹⁰ 4s² 4p⁵",
    eneg: 2.96,
    role_fa: "آریل برمیدها در واکنش‌های سوزوکی، هک و گرینیارد",
    role_en: "Standard aryl/alkyl bromides for cross-coupling & Grignard",
  },
  Ru: {
    mass: 101.07,
    name_en: "Ruthenium",
    name_fa: "روتنیوم",
    color: "#0891b2",
    group: "Transition Metal",
    ox: "+2, +3, +4",
    config: "[Kr] 4d⁷ 5s¹",
    eneg: 2.2,
    role_fa: "متاتز اولفین گرابز و فوتوکاتالیزور [Ru(bpy)3]²⁺",
    role_en: "Grubbs olefin metathesis & [Ru(bpy)3]²⁺ photoredox",
  },
  Rh: {
    mass: 102.91,
    name_en: "Rhodium",
    name_fa: "رودیوم",
    color: "#0284c7",
    group: "Transition Metal",
    ox: "+1, +3",
    config: "[Kr] 4d⁸ 5s¹",
    eneg: 2.28,
    role_fa: "کاتالیزور ویلکینسون، هیدروفرمیلاسیون و درج کاربن",
    role_en: "Wilkinson hydrogenation, hydroformylation & C–H insertion",
  },
  Pd: {
    mass: 106.42,
    name_en: "Palladium",
    name_fa: "پالادیوم",
    color: "#06b6d4",
    group: "Transition Metal",
    ox: "0, +2",
    config: "[Kr] 4d¹⁰",
    eneg: 2.2,
    role_fa: "قلب تپنده واکنش‌های سوزوکی، هک، باخوالد و سونوگاشیرا",
    role_en: "Cornerstone of Suzuki, Heck, Buchwald-Hartwig & Stille couplings",
  },
  Ag: {
    mass: 107.87,
    name_en: "Silver",
    name_fa: "نقره",
    color: "#94a3b8",
    group: "Transition Metal",
    ox: "+1",
    config: "[Kr] 4d¹⁰ 5s¹",
    eneg: 1.93,
    role_fa: "گیرنده هالید (AgOTf, Ag2CO3) و فعال‌سازی آلکین",
    role_en: "Halide scavenger (AgOTf, AgBF4) & C–H activation additive",
  },
  Sn: {
    mass: 118.71,
    name_en: "Tin",
    name_fa: "قلع",
    color: "#475569",
    group: "Post-Transition",
    ox: "+2, +4",
    config: "[Kr] 4d¹⁰ 5s² 5p²",
    eneg: 1.96,
    role_fa: "استنان‌های آلی در واکنش جفت‌شدن استیل (Stille)",
    role_en: "Organostannanes in Stille cross-coupling",
  },
  I: {
    mass: 126.9,
    name_en: "Iodine",
    name_fa: "ید",
    color: "#7e22ce",
    group: "Halogen",
    ox: "-1, +1, +3, +5",
    config: "[Kr] 4d¹⁰ 5s² 5p⁵",
    eneg: 2.66,
    role_fa: "واکنش‌پذیرترین آریل هالید و معرف‌های ید ظرفیت بالا (DMP)",
    role_en: "Highly reactive aryl iodides & hypervalent iodine (DMP)",
  },
  Cs: {
    mass: 132.91,
    name_en: "Cesium",
    name_fa: "سزیم",
    color: "#6d28d9",
    group: "Alkali Metal",
    ox: "+1",
    config: "[Xe] 6s¹",
    eneg: 0.79,
    role_fa: "باز Cs2CO3 با حلالیت عالی در حلال‌های آلی",
    role_en: "Cs2CO3 base & CsF desilylation reagent",
  },
  Ir: {
    mass: 192.22,
    name_en: "Iridium",
    name_fa: "ایریدیوم",
    color: "#4f46e5",
    group: "Transition Metal",
    ox: "+1, +3",
    config: "[Xe] 4f¹⁴ 5d⁷ 6s²",
    eneg: 2.2,
    role_fa: "فوتوکاتالیزورهای نور مرئی و بوریلاسیون C-H",
    role_en: "Visible-light photoredox catalysts & C–H borylation",
  },
  Pt: {
    mass: 195.08,
    name_en: "Platinum",
    name_fa: "پلاتین",
    color: "#475569",
    group: "Transition Metal",
    ox: "+2, +4",
    config: "[Xe] 4f¹⁴ 5d⁹ 6s¹",
    eneg: 2.28,
    role_fa: "کاتالیزور آدامز (PtO2)، هیدروسیلیلاسیون و سیس‌پلاتین",
    role_en: "Adams' catalyst (PtO2), hydrosilylation & Cisplatin",
  },
  Au: {
    mass: 196.97,
    name_en: "Gold",
    name_fa: "طلا",
    color: "#eab308",
    group: "Transition Metal",
    ox: "+1, +3",
    config: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
    eneg: 2.54,
    role_fa: "کاتالیزور اسید π ملایم برای حلقه‌زایی آلکین‌ها",
    role_en: "Soft carbophilic π-acid catalyst for alkyne cyclizations",
  },
};

// Expand common chemical shorthand abbreviations before parsing formula
function expandChemicalAbbreviations(formula: string): string {
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

// Parse a chemical formula (supports hydrates like CuSO4.5H2O and nested parentheses like Pd(PPh3)4)
export function parseChemicalFormula(rawFormula: string): {
  mw: number;
  composition: { element: string; count: number; mass: number; percent: number }[];
  valid: boolean;
} {
  const cleaned = rawFormula.trim().replace(/·/g, ".");
  if (!cleaned) return { mw: 0, composition: [], valid: false };

  const totalCounts: Record<string, number> = {};

  function parseSegment(segment: string, multiplier: number): boolean {
    const expanded = expandChemicalAbbreviations(segment.replace(/\[/g, "(").replace(/\]/g, ")"));
    const stack: { counts: Record<string, number> }[] = [{ counts: {} }];
    let i = 0;

    while (i < expanded.length) {
      const ch = expanded[i];
      if (ch === "(") {
        stack.push({ counts: {} });
        i++;
      } else if (ch === ")") {
        i++;
        let numStr = "";
        while (i < expanded.length && /\d/.test(expanded[i])) {
          numStr += expanded[i];
          i++;
        }
        const subMult = numStr ? parseInt(numStr, 10) : 1;
        const popped = stack.pop();
        if (!popped || stack.length === 0) return false;
        const top = stack[stack.length - 1].counts;
        for (const [el, cnt] of Object.entries(popped.counts)) {
          top[el] = (top[el] || 0) + cnt * subMult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let el = ch;
        i++;
        while (i < expanded.length && /[a-z]/.test(expanded[i])) {
          el += expanded[i];
          i++;
        }
        if (!ATOMIC_WEIGHTS[el]) return false;
        let numStr = "";
        while (i < expanded.length && /\d/.test(expanded[i])) {
          numStr += expanded[i];
          i++;
        }
        const count = numStr ? parseInt(numStr, 10) : 1;
        const top = stack[stack.length - 1].counts;
        top[el] = (top[el] || 0) + count;
      } else if (/\s/.test(ch)) {
        i++;
      } else {
        return false;
      }
    }

    if (stack.length !== 1) return false;
    for (const [el, cnt] of Object.entries(stack[0].counts)) {
      totalCounts[el] = (totalCounts[el] || 0) + cnt * multiplier;
    }
    return true;
  }

  // Handle hydrate dot notation e.g. CuSO4.5H2O
  const parts = cleaned.split(".");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\d+)(.*)$/);
    const mult = match ? parseInt(match[1], 10) : 1;
    const rest = match ? match[2] : trimmed;
    if (!parseSegment(rest, mult)) {
      return { mw: 0, composition: [], valid: false };
    }
  }

  let totalMass = 0;
  for (const [el, cnt] of Object.entries(totalCounts)) {
    totalMass += ATOMIC_WEIGHTS[el].mass * cnt;
  }

  if (totalMass <= 0) return { mw: 0, composition: [], valid: false };

  const composition = Object.entries(totalCounts)
    .map(([element, count]) => {
      const mass = ATOMIC_WEIGHTS[element].mass * count;
      return {
        element,
        count,
        mass: Number(mass.toFixed(3)),
        percent: Number(((mass / totalMass) * 100).toFixed(2)),
      };
    })
    .sort((a, b) => b.mass - a.mass);

  return {
    mw: Number(totalMass.toFixed(2)),
    composition,
    valid: true,
  };
}

export type StoichRow = {
  id: string;
  name: string;
  formula: string;
  mw: number;
  equiv: number;
  role: "limiting" | "reactant" | "catalyst" | "base";
  density?: number; // g/mL
};

export type StoichPreset = {
  id: string;
  title_en: string;
  title_fa: string;
  baseScaleMmol: number;
  solvent: string;
  concentrationM: number;
  tempC: number;
  timeH: number;
  rows: StoichRow[];
  product: {
    name: string;
    formula: string;
    mw: number;
    actualMassMg: number;
  };
};

const STOICH_PRESETS: StoichPreset[] = [
  {
    id: "suzuki",
    title_en: "Suzuki-Miyaura Cross-Coupling",
    title_fa: "واکنش جفت‌شدن سوزوکی-میاورا",
    baseScaleMmol: 1.0,
    solvent: "DMF / H2O (4:1)",
    concentrationM: 0.2,
    tempC: 80,
    timeH: 6,
    rows: [
      {
        id: "r1",
        name: "4-Bromoanisole",
        formula: "C7H7BrO",
        mw: 187.03,
        equiv: 1.0,
        role: "limiting",
        density: 1.494,
      },
      {
        id: "r2",
        name: "Phenylboronic acid",
        formula: "C6H7BO2",
        mw: 121.93,
        equiv: 1.2,
        role: "reactant",
      },
      {
        id: "r3",
        name: "Pd(PPh3)4",
        formula: "Pd(PPh3)4",
        mw: 1155.56,
        equiv: 0.05,
        role: "catalyst",
      },
      { id: "r4", name: "K2CO3", formula: "K2CO3", mw: 138.21, equiv: 2.0, role: "base" },
    ],
    product: {
      name: "4-Methoxybiphenyl",
      formula: "C13H12O",
      mw: 184.23,
      actualMassMg: 169.5,
    },
  },
  {
    id: "click",
    title_en: "CuAAC Click Cycloaddition",
    title_fa: "واکنش شیمی کلیک (CuAAC)",
    baseScaleMmol: 1.0,
    solvent: "t-BuOH / H2O (1:1)",
    concentrationM: 0.25,
    tempC: 25,
    timeH: 4,
    rows: [
      {
        id: "c1",
        name: "Benzyl azide",
        formula: "C7H7N3",
        mw: 133.15,
        equiv: 1.0,
        role: "limiting",
        density: 1.065,
      },
      {
        id: "c2",
        name: "Phenylacetylene",
        formula: "C8H6",
        mw: 102.13,
        equiv: 1.05,
        role: "reactant",
        density: 0.93,
      },
      {
        id: "c3",
        name: "CuSO4·5H2O",
        formula: "CuSO4.5H2O",
        mw: 249.68,
        equiv: 0.05,
        role: "catalyst",
      },
      {
        id: "c4",
        name: "Sodium ascorbate",
        formula: "C6H7NaO6",
        mw: 198.11,
        equiv: 0.15,
        role: "base",
      },
    ],
    product: {
      name: "1-Benzyl-4-phenyl-1H-1,2,3-triazole",
      formula: "C15H13N3",
      mw: 235.28,
      actualMassMg: 225.8,
    },
  },
  {
    id: "aspirin",
    title_en: "Fischer Esterification (Aspirin)",
    title_fa: "سنتز آسپرین (استری‌شدن)",
    baseScaleMmol: 5.0,
    solvent: "Neat / Acetic anhydride",
    concentrationM: 1.0,
    tempC: 85,
    timeH: 0.5,
    rows: [
      {
        id: "a1",
        name: "Salicylic acid",
        formula: "C7H6O3",
        mw: 138.12,
        equiv: 1.0,
        role: "limiting",
      },
      {
        id: "a2",
        name: "Acetic anhydride",
        formula: "C4H6O3",
        mw: 102.09,
        equiv: 2.0,
        role: "reactant",
        density: 1.082,
      },
      {
        id: "a3",
        name: "H2SO4 (conc.)",
        formula: "H2SO4",
        mw: 98.08,
        equiv: 0.05,
        role: "catalyst",
        density: 1.84,
      },
    ],
    product: {
      name: "Acetylsalicylic acid (Aspirin)",
      formula: "C9H8O4",
      mw: 180.16,
      actualMassMg: 792.0,
    },
  },
];

interface StoichiometryLabProps {
  onSelectReactionText?: (text: string) => void;
  onOpenStudio?: () => void;
}

export function StoichiometryLab({ onSelectReactionText, onOpenStudio }: StoichiometryLabProps) {
  const { locale, isRtl, l } = useI18n();

  const [activeTab, setActiveTab] = useState<
    "stoich" | "balancer" | "molarity" | "buffers" | "solvents" | "periodic"
  >("balancer");

  // --- TAB 1: STOICHIOMETRY WORKBENCH STATE ---
  const [baseScaleMmol, setBaseScaleMmol] = useState<number>(STOICH_PRESETS[0].baseScaleMmol);
  const [solvent, setSolvent] = useState<string>(STOICH_PRESETS[0].solvent);
  const [concentrationM, setConcentrationM] = useState<number>(STOICH_PRESETS[0].concentrationM);
  const [tempC, setTempC] = useState<number>(STOICH_PRESETS[0].tempC);
  const [timeH, setTimeH] = useState<number>(STOICH_PRESETS[0].timeH);
  const [rows, setRows] = useState<StoichRow[]>(STOICH_PRESETS[0].rows);
  const [product, setProduct] = useState(STOICH_PRESETS[0].product);
  const [copiedProc, setCopiedProc] = useState(false);

  // --- TAB 2: MOLAR MASS & SOLUTIONS STATE ---
  const [formulaInput, setFormulaInput] = useState<string>("Pd(PPh3)4");
  const [solConcM, setSolConcM] = useState<number>(0.1);
  const [solVolMl, setSolVolMl] = useState<number>(50);
  const [solMw, setSolMw] = useState<number>(180.16);

  // Dilution C1V1 = C2V2
  const [c1Stock, setC1Stock] = useState<number>(2.0);
  const [c2Target, setC2Target] = useState<number>(0.1);
  const [v2FinalMl, setV2FinalMl] = useState<number>(100);

  function applyPreset(preset: StoichPreset) {
    setBaseScaleMmol(preset.baseScaleMmol);
    setSolvent(preset.solvent);
    setConcentrationM(preset.concentrationM);
    setTempC(preset.tempC);
    setTimeH(preset.timeH);
    setRows(preset.rows.map((r) => ({ ...r })));
    setProduct({ ...preset.product });
    toast.success(
      isRtl
        ? `جدول استوکیومتری «${preset.title_fa}» بارگذاری شد`
        : `Loaded "${preset.title_en}" stoichiometry table`,
    );
  }

  function handleUpdateRow(id: string, patch: Partial<StoichRow>) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, ...patch };
        if (patch.formula !== undefined) {
          const parsed = parseChemicalFormula(patch.formula);
          if (parsed.valid && parsed.mw > 0) {
            updated.mw = parsed.mw;
          }
        }
        return updated;
      }),
    );
  }

  function handleAddRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        name: "New Reagent",
        formula: "C6H6",
        mw: 78.11,
        equiv: 1.0,
        role: "reactant",
      },
    ]);
  }

  function handleRemoveRow(id: string) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  // Computed stoichiometry metrics
  const computedRows = useMemo(() => {
    return rows.map((row) => {
      const mmol = baseScaleMmol * row.equiv;
      const massMg = mmol * row.mw;
      const massG = massMg / 1000;
      const volUl = row.density && row.density > 0 ? massMg / row.density : null;
      return {
        ...row,
        mmol,
        massMg,
        massG,
        volUl,
      };
    });
  }, [rows, baseScaleMmol]);

  const solventVolumeMl = useMemo(() => {
    if (!concentrationM || concentrationM <= 0) return 0;
    return baseScaleMmol / concentrationM;
  }, [baseScaleMmol, concentrationM]);

  const theoreticalYieldMg = useMemo(() => {
    return baseScaleMmol * product.mw;
  }, [baseScaleMmol, product.mw]);

  const percentYield = useMemo(() => {
    if (theoreticalYieldMg <= 0) return 0;
    return Math.min(100, Math.max(0, (product.actualMassMg / theoreticalYieldMg) * 100));
  }, [product.actualMassMg, theoreticalYieldMg]);

  const atomEconomy = useMemo(() => {
    const reactantMwSum = rows
      .filter((r) => r.role === "limiting" || r.role === "reactant")
      .reduce((acc, r) => acc + r.mw * r.equiv, 0);
    if (reactantMwSum <= 0) return 0;
    return Math.min(100, (product.mw / reactantMwSum) * 100);
  }, [rows, product.mw]);

  // Live Publication Experimental Procedure Text
  const experimentalProcedureText = useMemo(() => {
    const limiting = computedRows.find((r) => r.role === "limiting") || computedRows[0];
    const reactants = computedRows.filter((r) => r.id !== limiting?.id && r.role === "reactant");
    const catalysts = computedRows.filter((r) => r.role === "catalyst");
    const bases = computedRows.filter((r) => r.role === "base");

    const formatReagent = (r: (typeof computedRows)[0]) => {
      const eqStr =
        r.role === "catalyst"
          ? `${(r.equiv * 100).toFixed(1)} mol%`
          : `${r.equiv.toFixed(2)} equiv`;
      const volPart = r.volUl ? `, ${r.volUl.toFixed(0)} μL` : "";
      return `${r.name} (${r.massMg.toFixed(1)} mg${volPart}, ${r.mmol.toFixed(2)} mmol, ${eqStr})`;
    };

    const parts: string[] = [];
    if (limiting) {
      parts.push(`Reaction of ${formatReagent(limiting)}`);
    }
    if (reactants.length > 0) {
      parts.push(`with ${reactants.map(formatReagent).join(" and ")}`);
    }
    if (catalysts.length > 0) {
      parts.push(`catalyzed by ${catalysts.map(formatReagent).join(", ")}`);
    }
    if (bases.length > 0) {
      parts.push(`in the presence of ${bases.map(formatReagent).join(", ")}`);
    }
    parts.push(
      `in ${solvent} (${solventVolumeMl.toFixed(1)} mL, ${concentrationM} M) at ${tempC} °C for ${timeH} h affords ${product.name} (${product.formula}, ${product.actualMassMg.toFixed(1)} mg, ${percentYield.toFixed(0)}% yield).`,
    );

    return parts.join(" ");
  }, [computedRows, solvent, solventVolumeMl, concentrationM, tempC, timeH, product, percentYield]);

  // Formula parser result for Tab 2
  const parsedFormula = useMemo(() => parseChemicalFormula(formulaInput), [formulaInput]);

  // Solution mass in mg: C (mol/L) * V (mL) * MW (g/mol) = mg
  const requiredSolutionMassMg = useMemo(() => {
    return solConcM * solVolMl * solMw;
  }, [solConcM, solVolMl, solMw]);

  // Dilution V1 in mL: (C2 * V2) / C1
  const requiredStockV1Ml = useMemo(() => {
    if (c1Stock <= 0) return 0;
    return (c2Target * v2FinalMl) / c1Stock;
  }, [c1Stock, c2Target, v2FinalMl]);

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Clean Icon-First Sub-Tool Bar (Icon on top, smaller text underneath) */}
      <div className="p-2 rounded-2xl bg-card border border-border shadow-xs">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("balancer")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "balancer"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#06B6D4]/12 border border-[#06B6D4]/25 flex items-center justify-center text-[#06B6D4]">
              <FlaskConical className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "موازنه معادلات" : "Balancer"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stoich")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "stoich"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#6366F1]/12 border border-[#6366F1]/25 flex items-center justify-center text-[#6366F1]">
              <Scale className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "جدول استوکیومتری" : "Stoichiometry"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("molarity")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "molarity"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#10B981]/12 border border-[#10B981]/25 flex items-center justify-center text-[#10B981]">
              <Beaker className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "غلظت و جرم مولی" : "Molarity & Mass"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("buffers")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "buffers"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#F43F5E]/12 border border-[#F43F5E]/25 flex items-center justify-center text-[#F43F5E]">
              <Droplets className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "بافرساز و pH" : "Buffers & pH"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("solvents")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "solvents"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-amber-500/12 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Gauge className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "حلال‌ها و روتواپ" : "Solvents"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("periodic")}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "periodic"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#4F46E5]/12 border border-[#4F46E5]/25 flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
              <Atom className="size-5 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-full">
              {isRtl ? "جدول تناوبی" : "Periodic Table"}
            </span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: REACTION STOICHIOMETRY & YIELD WORKBENCH ================= */}
      {activeTab === "stoich" && (
        <div className="flex flex-col gap-5">
          {/* Reaction Presets & Scale Controls */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {isRtl ? "بارگذاری واکنش نمونه:" : "Load Benchmark Reaction:"}
                </span>
                {STOICH_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-secondary/70 hover:bg-secondary text-foreground border border-border/70 transition-colors"
                  >
                    {isRtl ? preset.title_fa : preset.title_en}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-muted-foreground me-1">
                  {isRtl ? "مقیاس سریع:" : "Quick Scale:"}
                </span>
                {[0.25, 0.5, 1.0, 2.5, 5.0].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setBaseScaleMmol(sc)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      baseScaleMmol === sc
                        ? "bg-accent-strong text-accent-foreground font-bold"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sc} mmol
                  </button>
                ))}
              </div>
            </div>

            {/* Reaction Parameters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "مقیاس واکنش (mmol)" : "Base Scale (mmol)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={baseScaleMmol}
                  onChange={(e) =>
                    setBaseScaleMmol(Math.max(0.001, parseFloat(e.target.value) || 0))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "سیستم حلال" : "Solvent System"}
                </label>
                <input
                  type="text"
                  value={solvent}
                  onChange={(e) => setSolvent(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "غلظت (M) → حجم حلال" : "Molarity (M) → Vol"}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={concentrationM}
                    onChange={(e) =>
                      setConcentrationM(Math.max(0.01, parseFloat(e.target.value) || 0.1))
                    }
                    className="w-20 h-9 px-2.5 rounded-lg border border-border bg-background font-mono text-xs text-foreground tabular-nums"
                  />
                  <span className="text-xs font-mono text-[#06B6D4] font-semibold tabular-nums">
                    = {solventVolumeMl.toFixed(1)} mL
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "دما (°C)" : "Temperature (°C)"}
                </label>
                <input
                  type="number"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value) || 25)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "زمان واکنش (h)" : "Reaction Time (h)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={timeH}
                  onChange={(e) => setTimeH(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground tabular-nums"
                />
              </div>
            </div>

            {/* Stoichiometry Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/70 border-b border-border text-muted-foreground font-mono text-[11px]">
                    <th className="py-2.5 px-3 text-start">
                      {isRtl ? "نام ماده / واکنشگر" : "Compound / Reagent"}
                    </th>
                    <th className="py-2.5 px-3 text-start">
                      {isRtl ? "فرمول شیمیایی" : "Formula (Auto-MW)"}
                    </th>
                    <th className="py-2.5 px-3 text-start">{isRtl ? "نقش" : "Role"}</th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "جرم مولی (g/mol)" : "MW (g/mol)"}
                    </th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "اکی‌والان (Equiv)" : "Equiv"}
                    </th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "مول (mmol)" : "Moles (mmol)"}
                    </th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "جرم مورد نیاز (mg)" : "Required Mass"}
                    </th>
                    <th className="py-2.5 px-3 text-end">{isRtl ? "حجم (μL)" : "Vol (μL)"}</th>
                    <th className="py-2.5 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {computedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(row.id, { name: e.target.value })}
                          className="w-full min-w-[130px] h-8 px-2.5 rounded border border-border/80 bg-background text-xs font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.formula}
                          onChange={(e) => handleUpdateRow(row.id, { formula: e.target.value })}
                          placeholder="e.g. C7H7BrO"
                          className="w-28 h-8 px-2.5 rounded border border-border/80 bg-background font-mono text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.role}
                          onChange={(e) =>
                            handleUpdateRow(row.id, { role: e.target.value as StoichRow["role"] })
                          }
                          className="h-8 px-2 rounded border border-border/80 bg-background text-xs"
                        >
                          <option value="limiting">
                            {isRtl ? "محدودکننده (1.0 eq)" : "Limiting"}
                          </option>
                          <option value="reactant">{isRtl ? "واکنش‌دهنده" : "Reactant"}</option>
                          <option value="catalyst">{isRtl ? "کاتالیزور" : "Catalyst"}</option>
                          <option value="base">{isRtl ? "باز / معرف" : "Base / Reagent"}</option>
                        </select>
                      </td>
                      <td className="p-2 text-end">
                        <input
                          type="number"
                          step="0.01"
                          value={row.mw}
                          onChange={(e) =>
                            handleUpdateRow(row.id, {
                              mw: Math.max(1, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-24 h-8 px-2 rounded border border-border/80 bg-background font-mono text-xs text-end tabular-nums"
                        />
                      </td>
                      <td className="p-2 text-end">
                        <input
                          type="number"
                          step="0.05"
                          value={row.equiv}
                          onChange={(e) =>
                            handleUpdateRow(row.id, {
                              equiv: Math.max(0.001, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-20 h-8 px-2 rounded border border-border/80 bg-background font-mono text-xs text-end tabular-nums"
                        />
                      </td>
                      <td className="p-2 text-end font-mono tabular-nums font-semibold text-foreground">
                        {row.mmol.toFixed(3)}
                      </td>
                      <td className="p-2 text-end font-mono tabular-nums">
                        <span className="font-bold text-[#06B6D4]">{row.massMg.toFixed(1)} mg</span>
                        <span className="block text-[10px] text-muted-foreground">
                          ({row.massG.toFixed(3)} g)
                        </span>
                      </td>
                      <td className="p-2 text-end font-mono tabular-nums text-muted-foreground">
                        {row.volUl ? `${row.volUl.toFixed(0)} μL` : "—"}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title={isRtl ? "حذف ردیف" : "Remove row"}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="h-8 text-xs gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>{isRtl ? "افزودن واکنشگر جدید" : "Add Reagent Row"}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const headers = [
                      "Compound",
                      "Formula",
                      "Role",
                      "MW (g/mol)",
                      "Equiv",
                      "Moles (mmol)",
                      "Mass (mg)",
                      "Volume (uL)",
                    ];
                    const csvLines = [
                      headers.join(","),
                      ...computedRows.map((r) =>
                        [
                          `"${r.name}"`,
                          `"${r.formula}"`,
                          r.role,
                          r.mw,
                          r.equiv,
                          r.mmol.toFixed(3),
                          r.massMg.toFixed(1),
                          r.volUl ? r.volUl.toFixed(0) : "",
                        ].join(","),
                      ),
                    ];
                    const blob = new Blob([csvLines.join("\n")], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `stoichiometry-${product.formula || "reaction"}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(
                      isRtl
                        ? "فایل CSV جدول استوکیومتری دانلود شد"
                        : "Exported stoichiometry table as CSV",
                    );
                  }}
                  className="h-8 text-xs gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span>{isRtl ? "خروجی اکسل (CSV)" : "Export CSV"}</span>
                </Button>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRtl
                  ? "نکته: با تایپ فرمول شیمیایی، جرم مولی به صورت خودکار محاسبه می‌شود."
                  : "Tip: Typing a valid chemical formula automatically updates its Molecular Weight."}
              </span>
            </div>
          </div>

          {/* Product Yield & Experimental Procedure Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Product & Yield Card */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  {isRtl ? "محاسبه بازده و اقتصاد اتمی" : "Yield & Atom Economy"}
                </div>
                <h3 className="text-sm font-bold font-display text-foreground mb-3">
                  {isRtl ? "مشخصات محصول نهایی" : "Target Product Specifications"}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                      {isRtl ? "نام محصول" : "Product Name"}
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                      {isRtl ? "فرمول محصول" : "Product Formula"}
                    </label>
                    <input
                      type="text"
                      value={product.formula}
                      onChange={(e) => {
                        const f = e.target.value;
                        const parsed = parseChemicalFormula(f);
                        setProduct((p) => ({
                          ...p,
                          formula: f,
                          mw: parsed.valid && parsed.mw > 0 ? parsed.mw : p.mw,
                        }));
                      }}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                      {isRtl ? "جرم مولی (g/mol)" : "Product MW"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.mw}
                      onChange={(e) =>
                        setProduct((p) => ({
                          ...p,
                          mw: Math.max(1, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                      {isRtl
                        ? "جرم محصول خالص به‌دست‌آمده در آزمایشگاه (mg)"
                        : "Actual Isolated Mass (mg)"}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={product.actualMassMg}
                      onChange={(e) =>
                        setProduct((p) => ({
                          ...p,
                          actualMassMg: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#06B6D4]/50 bg-background font-mono text-sm font-bold text-foreground tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Computed Yield Metrics */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border/70 font-mono">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">
                    {isRtl ? "بازده تئوری" : "Theoretical"}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {theoreticalYieldMg.toFixed(1)} mg
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                    {isRtl ? "بازده درصدی" : "% Yield"}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {percentYield.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">
                    {isRtl ? "اقتصاد اتمی" : "Atom Econ."}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {atomEconomy.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-Generated Publication Experimental Procedure Card */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-muted-foreground">
                    <span>ACS / RSC Standard Format</span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span>Auto-Synced with Table</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold font-display text-foreground">
                  {isRtl
                    ? "متن استاندارد بخش تجربی (Experimental Section) و ورودی گرافیکال ابسترکت"
                    : "Publication-Ready Experimental Procedure & Abstract Prompt"}
                </h3>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border font-mono text-xs leading-relaxed text-foreground select-all">
                  {experimentalProcedureText}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/70">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(experimentalProcedureText);
                    setCopiedProc(true);
                    setTimeout(() => setCopiedProc(false), 2000);
                    toast.success(
                      isRtl ? "متن بخش تجربی کپی شد" : "Experimental procedure copied to clipboard",
                    );
                  }}
                  className="h-9 text-xs gap-1.5"
                >
                  {copiedProc ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{isRtl ? "کپی متن بخش تجربی" : "Copy Experimental Procedure"}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onSelectReactionText?.(experimentalProcedureText);
                    onOpenStudio?.();
                    toast.success(
                      isRtl
                        ? "متن استوکیومتری واکنش به استودیو گرافیکال ابسترکت منتقل شد!"
                        : "Reaction stoichiometry loaded into Graphical Abstract Studio!",
                    );
                  }}
                  className="h-9 px-4 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
                >
                  <Sparkles className="size-3.5" />
                  <span>
                    {isRtl
                      ? "تولید گرافیکال ابسترکت از این واکنش"
                      : "Generate Graphical Abstract from Table"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MOLAR MASS, MOLARITY & DILUTION CALCULATOR ================= */}
      {activeTab === "molarity" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Formula Molar Mass & Elemental Composition Analyzer */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground">
                {isRtl
                  ? "تجزیه‌گر فرمول شیمیایی و درصد عنصری"
                  : "Chemical Formula & Elemental Analyzer"}
              </div>
              <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                {isRtl
                  ? "محاسبه دقیق جرم مولی و درصد عناصر"
                  : "Exact Molar Mass & Elemental Composition"}
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  placeholder="e.g. C9H8O4, Pd(PPh3)4, CuSO4.5H2O"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background font-mono text-sm text-foreground"
                />
                {parsedFormula.valid && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSolMw(parsedFormula.mw);
                      toast.success(
                        isRtl
                          ? `جرم مولی ${parsedFormula.mw} g/mol در ماشین‌حساب محلول‌سازی قرار گرفت`
                          : `Transferred ${parsedFormula.mw} g/mol to Solution Calculator`,
                      );
                    }}
                    className="h-10 text-xs gap-1"
                  >
                    <span>{isRtl ? "ارسال به محلول‌ساز" : "Use MW"}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {isRtl ? "فرمول‌های نمونه:" : "Samples:"}
                </span>
                {["C9H8O4", "Pd(PPh3)4", "CuSO4.5H2O", "C8H10N4O2", "Pd2(dba)3", "C21H20O6"].map(
                  (sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setFormulaInput(sample)}
                      className="px-2 py-0.5 rounded bg-secondary/70 hover:bg-secondary font-mono text-[11px] text-foreground border border-border/60"
                    >
                      {sample}
                    </button>
                  ),
                )}
              </div>
            </div>

            {parsedFormula.valid ? (
              <div className="flex flex-col gap-4 pt-2">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground block">
                      {isRtl ? "جرم مولکولی استاندارد" : "Molecular Weight"}
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-[#06B6D4] tabular-nums">
                      {parsedFormula.mw.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">g/mol</span>
                    </span>
                  </div>
                  <div className="text-end font-mono text-xs text-muted-foreground">
                    <span>{parsedFormula.composition.reduce((a, b) => a + b.count, 0)} atoms</span>
                    <span className="block">{parsedFormula.composition.length} elements</span>
                  </div>
                </div>

                {/* Visual Mass % Bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-secondary">
                  {parsedFormula.composition.map((item) => (
                    <div
                      key={item.element}
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: ATOMIC_WEIGHTS[item.element]?.color || "#06B6D4",
                      }}
                      title={`${item.element}: ${item.percent}%`}
                    />
                  ))}
                </div>

                {/* Elemental Breakdown Table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-secondary/60 border-b border-border text-muted-foreground text-[11px]">
                        <th className="py-2 px-3 text-start">{isRtl ? "عنصر" : "Element"}</th>
                        <th className="py-2 px-3 text-end">{isRtl ? "تعداد اتم" : "Count"}</th>
                        <th className="py-2 px-3 text-end">
                          {isRtl ? "جرم کل (g/mol)" : "Subtotal Mass"}
                        </th>
                        <th className="py-2 px-3 text-end">{isRtl ? "درصد جرمی" : "Mass %"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {parsedFormula.composition.map((item) => (
                        <tr key={item.element}>
                          <td className="py-2 px-3 flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: ATOMIC_WEIGHTS[item.element]?.color || "#64748b",
                              }}
                            />
                            <span className="font-bold text-foreground">{item.element}</span>
                            <span className="text-muted-foreground text-[11px] font-sans">
                              (
                              {isRtl
                                ? ATOMIC_WEIGHTS[item.element]?.name_fa
                                : ATOMIC_WEIGHTS[item.element]?.name_en}
                              )
                            </span>
                          </td>
                          <td className="py-2 px-3 text-end tabular-nums">{item.count}</td>
                          <td className="py-2 px-3 text-end tabular-nums">
                            {item.mass.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-end font-bold text-foreground tabular-nums">
                            {item.percent.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                {isRtl
                  ? "فرمول شیمیایی معتبر وارد کنید (حروف بزرگ و کوچک رعایت شود، مثال: C9H8O4 یا Pd(PPh3)4)"
                  : "Enter a valid case-sensitive chemical formula (e.g., C9H8O4 or Pd(PPh3)4)"}
              </div>
            )}
          </div>

          {/* Right Column: Solution Preparation & Stock Dilution */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Solution Preparation from Solid */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground">m = C × V × MW</div>
                <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                  {isRtl
                    ? "محاسبه جرم ماده برای تهیه محلول با غلظت مشخص"
                    : "Solution Preparation from Solid"}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "غلظت هدف (M)" : "Target Molarity (M)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={solConcM}
                    onChange={(e) => setSolConcM(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "حجم نهایی (mL)" : "Final Volume (mL)"}
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={solVolMl}
                    onChange={(e) => setSolVolMl(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "جرم مولی (g/mol)" : "Molar Mass (g/mol)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={solMw}
                    onChange={(e) => setSolMw(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between font-mono">
                <span className="text-xs text-muted-foreground">
                  {isRtl ? "مقدار دقیق توزین روی ترازو:" : "Required Mass to Weigh:"}
                </span>
                <div className="text-end">
                  <span className="text-lg font-extrabold text-[#10B981] tabular-nums">
                    {requiredSolutionMassMg.toFixed(1)} mg
                  </span>
                  <span className="text-xs text-muted-foreground ms-2 tabular-nums">
                    ({(requiredSolutionMassMg / 1000).toFixed(4)} g)
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Solution Dilution Calculator */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground">C₁V₁ = C₂V₂</div>
                <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                  {isRtl
                    ? "ماشین‌حساب رقیق‌سازی محلول استوک"
                    : "Stock Solution Dilution Calculator"}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "غلظت استوک C₁ (M)" : "Stock Conc. C₁ (M)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={c1Stock}
                    onChange={(e) => setC1Stock(Math.max(0.0001, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "غلظت هدف C₂ (M)" : "Target Conc. C₂ (M)"}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={c2Target}
                    onChange={(e) => setC2Target(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                    {isRtl ? "حجم نهایی V₂ (mL)" : "Final Vol. V₂ (mL)"}
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={v2FinalMl}
                    onChange={(e) => setV2FinalMl(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">
                    {isRtl ? "حجم برداشت از محلول استوک (V₁):" : "Stock Aliquot (V₁): "}
                  </span>
                  <span className="font-bold text-[#06B6D4] text-sm ms-1 tabular-nums">
                    {requiredStockV1Ml.toFixed(2)} mL ({(requiredStockV1Ml * 1000).toFixed(0)} μL)
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {isRtl ? "+ حلال رقیق‌کننده:" : "+ Diluent Volume: "}
                  </span>
                  <span className="font-bold text-foreground ms-1 tabular-nums">
                    {Math.max(0, v2FinalMl - requiredStockV1Ml).toFixed(2)} mL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 0: CHEMICAL EQUATION BALANCER ================= */}
      {activeTab === "balancer" && (
        <EquationBalancer
          isRtl={isRtl}
          onLoadIntoStoichiometry={(balanced) => {
            if (!balanced.valid || balanced.reactants.length === 0) return;
            const baseCoeff = balanced.reactants[0].balancedCoeff || 1;
            const newRows: StoichRow[] = balanced.reactants.map((sp, idx) => ({
              id: `bal-${idx}-${Date.now()}`,
              name: sp.formula,
              formula: sp.formula,
              mw: sp.mw,
              equiv: Number((sp.balancedCoeff / baseCoeff).toFixed(3)),
              role: idx === 0 ? "limiting" : "reactant",
            }));
            setRows(newRows);
            if (balanced.products.length > 0) {
              const firstProd = balanced.products[0];
              const prodEquiv = firstProd.balancedCoeff / baseCoeff;
              const theoMg = baseScaleMmol * prodEquiv * firstProd.mw;
              setProduct({
                name: firstProd.formula,
                formula: firstProd.formula,
                mw: firstProd.mw,
                actualMassMg: Number((theoMg * 0.9).toFixed(1)),
              });
            }
            setActiveTab("stoich");
            toast.success(
              isRtl
                ? "واکنش موازنه‌شده با ضرایب استوکیومتری به جدول منتقل شد"
                : "Loaded balanced equation and molar ratios into Stoichiometry Workbench",
            );
          }}
          onSendToStudio={(txt) => {
            onSelectReactionText?.(txt);
            onOpenStudio?.();
            toast.success(
              isRtl
                ? "معادله موازنه‌شده به استودیو گرافیکال ابسترکت منتقل شد"
                : "Balanced equation loaded into Graphical Abstract Studio",
            );
          }}
        />
      )}

      {/* ================= TAB 2B: BUFFERS & PH/PKA DESIGNER ================= */}
      {activeTab === "buffers" && <BufferAndPhLab isRtl={isRtl} />}

      {/* ================= TAB 2C: VACUUM ROTAVAP, SOLVENTS & GREEN CHEMISTRY ================= */}
      {activeTab === "solvents" && <VacuumAndGreenChemLab isRtl={isRtl} />}

      {/* ================= TAB 3: INTERACTIVE PERIODIC TABLE & CATALYSTS ================= */}
      {activeTab === "periodic" && (
        <PeriodicCatalystHub
          isRtl={isRtl}
          onAddElementToFormula={(sym) => {
            setFormulaInput((prev) => prev + sym);
            setActiveTab("molarity");
            toast.success(
              isRtl ? `عنصر ${sym} به فرمول‌ساز اضافه شد` : `Added ${sym} to Formula Analyzer`,
            );
          }}
          onAddPrecatalystToStoich={(precat) => {
            setRows((prev) => [
              ...prev,
              {
                id: `cat-${Date.now()}`,
                name: precat.name,
                formula: precat.formula,
                mw: precat.mw,
                equiv: precat.equiv,
                role: "catalyst",
              },
            ]);
            setActiveTab("stoich");
            toast.success(
              isRtl
                ? `کاتالیزور ${precat.name} به جدول استوکیومتری اضافه شد`
                : `Added precatalyst ${precat.name} to Stoichiometry Table`,
            );
          }}
          onSendCatalystToStudio={(promptText) => {
            onSelectReactionText?.(promptText);
            onOpenStudio?.();
            toast.success(
              isRtl
                ? "مکانیزم کاتالیزوری به استودیو گرافیکال ابسترکت منتقل شد"
                : "Catalytic mechanism loaded into Graphical Abstract Studio",
            );
          }}
        />
      )}
    </div>
  );
}
