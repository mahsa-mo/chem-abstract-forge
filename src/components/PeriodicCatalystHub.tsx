import React, { useState, useMemo } from "react";
import {
  Atom,
  Sparkles,
  Plus,
  Layers,
  FlaskConical,
  Scale,
  Activity,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RichElementData {
  z: number;
  symbol: string;
  name_en: string;
  name_fa: string;
  mass: number;
  row: number; // 1-7
  col: number; // 1-18
  category:
    | "nonmetal"
    | "noble"
    | "alkali"
    | "alkaline"
    | "metalloid"
    | "post-transition"
    | "transition"
    | "pgm"
    | "halogen"
    | "lanthanide";
  cpkColor: string;
  ox: string;
  config: string;
  eneg: number;
  ionizationKj: number;
  radiusPm: number;
  nmrNucleus: string;
  isotopes: { massNum: number; abundance: number }[];
  role_fa: string;
  role_en: string;
  precatalysts?: {
    name: string;
    formula: string;
    mw: number;
    defaultMolPercent: number;
    ligand_en: string;
    ligand_fa: string;
    reaction_en: string;
    reaction_fa: string;
    sensitivity: "Air-stable" | "Moderate" | "Glovebox / Schlenk";
  }[];
}

export const PERIODIC_CATALYST_ELEMENTS: RichElementData[] = [
  // Period 1
  {
    z: 1,
    symbol: "H",
    name_en: "Hydrogen",
    name_fa: "هیدروژن",
    mass: 1.008,
    row: 1,
    col: 1,
    category: "nonmetal",
    cpkColor: "#64748b",
    ox: "+1, -1",
    config: "1s¹",
    eneg: 2.2,
    ionizationKj: 1312,
    radiusPm: 53,
    nmrNucleus: "¹H (I = 1/2, 99.98%, 400 MHz)",
    isotopes: [
      { massNum: 1, abundance: 99.98 },
      { massNum: 2, abundance: 0.02 },
    ],
    role_fa: "هیدروژناسیون کاتالیزوری، انتقال پروتون و هسته اصلی طیف‌سنجی ¹H NMR",
    role_en: "Catalytic hydrogenation, proton transfer, and primary ¹H NMR probe nucleus",
  },
  {
    z: 2,
    symbol: "He",
    name_en: "Helium",
    name_fa: "هلیوم",
    mass: 4.0026,
    row: 1,
    col: 18,
    category: "noble",
    cpkColor: "#38bdf8",
    ox: "0",
    config: "1s²",
    eneg: 0,
    ionizationKj: 2372,
    radiusPm: 31,
    nmrNucleus: "³He (I = 1/2, trace)",
    isotopes: [{ massNum: 4, abundance: 100 }],
    role_fa: "گاز حامل بی‌اثر در کروماتوگرافی گازی (GC-MS) و خنک‌کننده ابررسانای NMR",
    role_en: "Ultrapure carrier gas in GC-MS and cryogen for superconducting NMR magnets",
  },
  // Period 2
  {
    z: 3,
    symbol: "Li",
    name_en: "Lithium",
    name_fa: "لیتیوم",
    mass: 6.94,
    row: 2,
    col: 1,
    category: "alkali",
    cpkColor: "#a855f7",
    ox: "+1",
    config: "[He] 2s¹",
    eneg: 0.98,
    ionizationKj: 520,
    radiusPm: 167,
    nmrNucleus: "⁷Li (I = 3/2, 92.4%)",
    isotopes: [
      { massNum: 6, abundance: 7.6 },
      { massNum: 7, abundance: 92.4 },
    ],
    role_fa: "سنتز معرف‌های ارگانولیتیوم (n-BuLi, t-BuLi) و بازهای فضای ممانعت‌دار (LDA, LiHMDS)",
    role_en: "Organolithium reagents (n-BuLi) for directed ortho-metalation & LDA enolates",
    precatalysts: [
      {
        name: "LiHMDS",
        formula: "C6H18LiNSi2",
        mw: 167.33,
        defaultMolPercent: 120,
        ligand_en: "Hexamethyldisilazide",
        ligand_fa: "هگزامتیل‌دی‌سیلازید",
        reaction_en: "Kinetic Enolate Formation & Buchwald-Hartwig Amination",
        reaction_fa: "تشکیل انولات سینتیکی و آمیناسیون باخوالد-هارتویگ",
        sensitivity: "Glovebox / Schlenk",
      },
    ],
  },
  {
    z: 5,
    symbol: "B",
    name_en: "Boron",
    name_fa: "بور",
    mass: 10.81,
    row: 2,
    col: 13,
    category: "metalloid",
    cpkColor: "#fb7185",
    ox: "+3",
    config: "[He] 2s² 2p¹",
    eneg: 2.04,
    ionizationKj: 801,
    radiusPm: 87,
    nmrNucleus: "¹¹B (I = 3/2, 80.1%, 128 MHz)",
    isotopes: [
      { massNum: 10, abundance: 19.9 },
      { massNum: 11, abundance: 80.1 },
    ],
    role_fa:
      "بورونیک اسیدها و استرهای Bpin در جفت‌شدن سوزوکی-میاورا، هیدروبوراسیون و کاتالیزور CBS",
    role_en: "Boronic acids/Bpin esters in Suzuki-Miyaura cross-coupling & hydroboration",
    precatalysts: [
      {
        name: "B2pin2 (Bis(pinacolato)diboron)",
        formula: "C12H24B2O4",
        mw: 253.94,
        defaultMolPercent: 110,
        ligand_en: "Pinacolato",
        ligand_fa: "پیناکولاتو",
        reaction_en: "Miyaura Borylation & Ir-Catalyzed C–H Borylation",
        reaction_fa: "بوریلاسیون میاورا و بوریلاسیون C-H",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 6,
    symbol: "C",
    name_en: "Carbon",
    name_fa: "کربن",
    mass: 12.011,
    row: 2,
    col: 14,
    category: "nonmetal",
    cpkColor: "#334155",
    ox: "+4, +2, -4",
    config: "[He] 2s² 2p²",
    eneg: 2.55,
    ionizationKj: 1086,
    radiusPm: 67,
    nmrNucleus: "¹³C (I = 1/2, 1.1%, 100 MHz)",
    isotopes: [
      { massNum: 12, abundance: 98.9 },
      { massNum: 13, abundance: 1.1 },
    ],
    role_fa: "ستون فقرات تمام مولکول‌های آلی، لیگاندهای کاربن NHC و پایه طیف‌سنجی ¹³C NMR",
    role_en: "Backbone of organic architecture, NHC carbene ligands, and ¹³C NMR spectroscopy",
  },
  {
    z: 7,
    symbol: "N",
    name_en: "Nitrogen",
    name_fa: "نیتروژن",
    mass: 14.007,
    row: 2,
    col: 15,
    category: "nonmetal",
    cpkColor: "#2563eb",
    ox: "-3, +3, +5",
    config: "[He] 2s² 2p³",
    eneg: 3.04,
    ionizationKj: 1402,
    radiusPm: 56,
    nmrNucleus: "¹⁵N (I = 1/2, 0.37%, 40 MHz)",
    isotopes: [
      { massNum: 14, abundance: 99.63 },
      { massNum: 15, abundance: 0.37 },
    ],
    role_fa: "لیگاندهای پیریدین و بی‌پیريدین (bpy)، آمین‌های کاتالیزور ارگانیک و اتمسفر خنثی",
    role_en: "Bipyridine/phenanthroline ligands, organocatalysts, and inert Schlenk atmosphere",
  },
  {
    z: 8,
    symbol: "O",
    name_en: "Oxygen",
    name_fa: "اکسیژن",
    mass: 15.999,
    row: 2,
    col: 16,
    category: "nonmetal",
    cpkColor: "#e11d48",
    ox: "-2",
    config: "[He] 2s² 2p⁴",
    eneg: 3.44,
    ionizationKj: 1314,
    radiusPm: 48,
    nmrNucleus: "¹⁷O (I = 5/2, 0.04%)",
    isotopes: [{ massNum: 16, abundance: 99.76 }],
    role_fa: "اکسیدان سبز در اکسیداسیون‌های هوازی، گروه‌های کربونیل و لیگاندهای آلکوکسید",
    role_en: "Terminal green oxidant in aerobic catalysis, carbonyls, and alkoxide ligands",
  },
  {
    z: 9,
    symbol: "F",
    name_en: "Fluorine",
    name_fa: "فلوئور",
    mass: 18.998,
    row: 2,
    col: 17,
    category: "halogen",
    cpkColor: "#10b981",
    ox: "-1",
    config: "[He] 2s² 2p⁵",
    eneg: 3.98,
    ionizationKj: 1681,
    radiusPm: 42,
    nmrNucleus: "¹⁹F (I = 1/2, 100%, 376 MHz)",
    isotopes: [{ massNum: 19, abundance: 100 }],
    role_fa: "ردیابی سریع بازده واکنش با ¹⁹F NMR و افزایش نفوذپذیری غشایی و پایداری داروها",
    role_en:
      "Quantitative ¹⁹F NMR reaction monitoring & metabolic stabilization in medicinal chemistry",
  },
  // Period 3
  {
    z: 11,
    symbol: "Na",
    name_en: "Sodium",
    name_fa: "سدیم",
    mass: 22.99,
    row: 3,
    col: 1,
    category: "alkali",
    cpkColor: "#8b5cf6",
    ox: "+1",
    config: "[Ne] 3s¹",
    eneg: 0.93,
    ionizationKj: 496,
    radiusPm: 190,
    nmrNucleus: "²³Na (I = 3/2, 100%)",
    isotopes: [{ massNum: 23, abundance: 100 }],
    role_fa: "کاهنده‌های هیدریدی (NaBH4, NaBH3CN) و باز NaOtBu در جفت‌شدن باخوالد-هارتویگ",
    role_en: "Hydride reductants (NaBH4) and NaOtBu base in Buchwald-Hartwig cross-coupling",
  },
  {
    z: 12,
    symbol: "Mg",
    name_en: "Magnesium",
    name_fa: "منیزیم",
    mass: 24.305,
    row: 3,
    col: 2,
    category: "alkaline",
    cpkColor: "#14b8a6",
    ox: "+2",
    config: "[Ne] 3s²",
    eneg: 1.31,
    ionizationKj: 738,
    radiusPm: 145,
    nmrNucleus: "²⁵Mg (I = 5/2, 10%)",
    isotopes: [
      { massNum: 24, abundance: 79.0 },
      { massNum: 25, abundance: 10.0 },
      { massNum: 26, abundance: 11.0 },
    ],
    role_fa: "معرف‌های گرینیارد (RMgBr) و معرف توربو-گرینیارد (iPrMgCl·LiCl) در جفت‌شدن کومادا",
    role_en: "Grignard reagents (RMgX) & Turbo-Grignard (iPrMgCl·LiCl) in Kumada coupling",
  },
  {
    z: 13,
    symbol: "Al",
    name_en: "Aluminum",
    name_fa: "آلومینیوم",
    mass: 26.982,
    row: 3,
    col: 13,
    category: "post-transition",
    cpkColor: "#64748b",
    ox: "+3",
    config: "[Ne] 3s² 3p¹",
    eneg: 1.61,
    ionizationKj: 577,
    radiusPm: 118,
    nmrNucleus: "²⁷Al (I = 5/2, 100%)",
    isotopes: [{ massNum: 27, abundance: 100 }],
    role_fa: "اسید لوئیس قوی AlCl3 در آسیلاسیون فریدل-کرافتس و کاهنده انتخابی DIBAL-H",
    role_en: "AlCl3 Lewis acid catalyst in Friedel-Crafts acylation & DIBAL-H reductions",
  },
  {
    z: 14,
    symbol: "Si",
    name_en: "Silicon",
    name_fa: "سیلیسیم",
    mass: 28.085,
    row: 3,
    col: 14,
    category: "metalloid",
    cpkColor: "#d97706",
    ox: "+4",
    config: "[Ne] 3s² 3p²",
    eneg: 1.9,
    ionizationKj: 786,
    radiusPm: 111,
    nmrNucleus: "²⁹Si (I = 1/2, 4.7%, 79 MHz)",
    isotopes: [
      { massNum: 28, abundance: 92.2 },
      { massNum: 29, abundance: 4.7 },
      { massNum: 30, abundance: 3.1 },
    ],
    role_fa: "جفت‌شدن هیاما (Hiyama)، گروه‌های محافظ سیلیل (TBS, TIPS) و هیدروسیلیلاسیون",
    role_en: "Hiyama cross-coupling silanes, silyl protecting groups, and TTMS radical donor",
  },
  {
    z: 15,
    symbol: "P",
    name_en: "Phosphorus",
    name_fa: "فسفر",
    mass: 30.974,
    row: 3,
    col: 15,
    category: "nonmetal",
    cpkColor: "#ea580c",
    ox: "+3, +5",
    config: "[Ne] 3s² 3p³",
    eneg: 2.19,
    ionizationKj: 1012,
    radiusPm: 98,
    nmrNucleus: "³¹P (I = 1/2, 100%, 162 MHz)",
    isotopes: [{ massNum: 31, abundance: 100 }],
    role_fa: "قلب لیگاندهای فسفین (PPh3, XPhos, SPhos, BINAP) و ردیابی اکسیداسیون با ³¹P NMR",
    role_en: "Backbone of Buchwald dialkylbiaryl phosphine ligands & ³¹P NMR catalyst tracking",
  },
  {
    z: 16,
    symbol: "S",
    name_en: "Sulfur",
    name_fa: "گوگرد",
    mass: 32.06,
    row: 3,
    col: 16,
    category: "nonmetal",
    cpkColor: "#ca8a04",
    ox: "-2, +4, +6",
    config: "[Ne] 3s² 3p⁴",
    eneg: 2.58,
    ionizationKj: 1000,
    radiusPm: 88,
    nmrNucleus: "³³S (I = 3/2, 0.75%)",
    isotopes: [
      { massNum: 32, abundance: 95.0 },
      { massNum: 34, abundance: 4.2 },
    ],
    role_fa: "سولفونامیدها، شیمی کلیک SuFEx (فلوئوریدهای سولفونیل) و گروه‌های ترک‌کننده OTs/OTf",
    role_en: "SuFEx click chemistry, triflate/tosylate leaving groups, and chiral sulfinamides",
  },
  {
    z: 17,
    symbol: "Cl",
    name_en: "Chlorine",
    name_fa: "کلر",
    mass: 35.45,
    row: 3,
    col: 17,
    category: "halogen",
    cpkColor: "#16a34a",
    ox: "-1",
    config: "[Ne] 3s² 3p⁵",
    eneg: 3.16,
    ionizationKj: 1251,
    radiusPm: 79,
    nmrNucleus: "³⁵Cl (I = 3/2, 75.8%)",
    isotopes: [
      { massNum: 35, abundance: 75.8 },
      { massNum: 37, abundance: 24.2 },
    ],
    role_fa: "آریل کلریدهای ارزان‌قیمت صنعتی و الگوی ایزوتوپی شاخص ۳:۱ (M / M+2) در طیف جرمی",
    role_en: "Industrial aryl chloride substrates; diagnostic 3:1 (M / M+2) MS isotope doublet",
  },
  // Period 4
  {
    z: 19,
    symbol: "K",
    name_en: "Potassium",
    name_fa: "پتاسیم",
    mass: 39.098,
    row: 4,
    col: 1,
    category: "alkali",
    cpkColor: "#7c3aed",
    ox: "+1",
    config: "[Ar] 4s¹",
    eneg: 0.82,
    ionizationKj: 419,
    radiusPm: 243,
    nmrNucleus: "³⁹K (I = 3/2, 93.3%)",
    isotopes: [
      { massNum: 39, abundance: 93.3 },
      { massNum: 41, abundance: 6.7 },
    ],
    role_fa: "بازهای کلیدی K2CO3، K3PO4، KOAc و نمک‌های تری‌فلوئوروبورات پتاسیم (R-BF3K)",
    role_en: "Essential inorganic bases (K2CO3, K3PO4) & Molander organotrifluoroborate salts",
  },
  {
    z: 22,
    symbol: "Ti",
    name_en: "Titanium",
    name_fa: "تیتانیوم",
    mass: 47.867,
    row: 4,
    col: 4,
    category: "transition",
    cpkColor: "#6366f1",
    ox: "+4, +3",
    config: "[Ar] 3d² 4s²",
    eneg: 1.54,
    ionizationKj: 659,
    radiusPm: 176,
    nmrNucleus: "⁴⁷Ti / ⁴⁹Ti",
    isotopes: [
      { massNum: 46, abundance: 8.2 },
      { massNum: 47, abundance: 7.4 },
      { massNum: 48, abundance: 73.7 },
      { massNum: 49, abundance: 5.4 },
      { massNum: 50, abundance: 5.2 },
    ],
    role_fa: "اپوکسیداسیون نامتقارن شارپلس، متیلناسیون تبه (Tebbe) و جفت‌شدن مک‌موری",
    role_en: "Sharpless asymmetric epoxidation (Ti(OiPr)4), Kulinkovich & McMurry coupling",
    precatalysts: [
      {
        name: "Ti(OiPr)4 (Titanium isopropoxide)",
        formula: "C12H28O4Ti",
        mw: 284.22,
        defaultMolPercent: 10,
        ligand_en: "(+)- or (-)-Diethyl tartrate (DET)",
        ligand_fa: "دی‌اتیل تارتارات کایرال (DET)",
        reaction_en: "Sharpless Asymmetric Epoxidation of Allylic Alcohols",
        reaction_fa: "اپوکسیداسیون نامتقارن شارپلس الکل‌های آلیلیک",
        sensitivity: "Moderate",
      },
    ],
  },
  {
    z: 25,
    symbol: "Mn",
    name_en: "Manganese",
    name_fa: "منگنز",
    mass: 54.938,
    row: 4,
    col: 7,
    category: "transition",
    cpkColor: "#8b5cf6",
    ox: "+2, +3, +4, +7",
    config: "[Ar] 3d⁵ 4s²",
    eneg: 1.55,
    ionizationKj: 717,
    radiusPm: 161,
    nmrNucleus: "⁵⁵Mn (I = 5/2, 100%)",
    isotopes: [{ massNum: 55, abundance: 100 }],
    role_fa: "کاتالیزور سالن ژاکوبسن (Jacobsen epoxidation) و هیدروژناسیون رادیکالی HAT",
    role_en: "Jacobsen chiral Mn(salen) epoxidation & Mukaiyama/Shenvi HAT catalysis",
  },
  {
    z: 26,
    symbol: "Fe",
    name_en: "Iron",
    name_fa: "آهن",
    mass: 55.845,
    row: 4,
    col: 8,
    category: "transition",
    cpkColor: "#d97706",
    ox: "+2, +3",
    config: "[Ar] 3d⁶ 4s²",
    eneg: 1.83,
    ionizationKj: 762,
    radiusPm: 156,
    nmrNucleus: "⁵⁷Fe (I = 1/2, 2.1%)",
    isotopes: [
      { massNum: 54, abundance: 5.8 },
      { massNum: 56, abundance: 91.8 },
      { massNum: 57, abundance: 2.1 },
    ],
    role_fa: "کاتالیز سبز و پایدار جفت‌شدن فورستنبرگ (Fe(acac)3) و اسکلت لیگاند فروسنی dppf",
    role_en: "Earth-abundant Fürstner cross-coupling (Fe(acac)3) & dppf ferrocenyl ligand",
    precatalysts: [
      {
        name: "Fe(acac)3",
        formula: "C15H21FeO6",
        mw: 353.17,
        defaultMolPercent: 5,
        ligand_en: "NMP / TMEDA additive",
        ligand_fa: "افزودنی TMEDA یا NMP",
        reaction_en: "Fürstner Iron-Catalyzed Kumada Cross-Coupling",
        reaction_fa: "جفت‌شدن متقاطع سبز آهن با معرف‌های گرینیارد",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 27,
    symbol: "Co",
    name_en: "Cobalt",
    name_fa: "کبالت",
    mass: 58.933,
    row: 4,
    col: 9,
    category: "transition",
    cpkColor: "#2563eb",
    ox: "+1, +2, +3",
    config: "[Ar] 3d⁷ 4s²",
    eneg: 1.88,
    ionizationKj: 760,
    radiusPm: 152,
    nmrNucleus: "⁵⁹Co (I = 7/2, 100%)",
    isotopes: [{ massNum: 59, abundance: 100 }],
    role_fa: "حلقه‌زایی پاوسون-خاند (Co2(CO)8) و کاتالیز آزادسازی هیدروژن فتوکاتالیستی",
    role_en: "Pauson-Khand cyclopentenone synthesis & cobaloxime dual photoredox HAT",
  },
  {
    z: 28,
    symbol: "Ni",
    name_en: "Nickel",
    name_fa: "نیکل",
    mass: 58.693,
    row: 4,
    col: 10,
    category: "transition",
    cpkColor: "#10b981",
    ox: "0, +1, +2, +3",
    config: "[Ar] 3d⁸ 4s²",
    eneg: 1.91,
    ionizationKj: 737,
    radiusPm: 149,
    nmrNucleus: "⁶¹Ni (I = 3/2, 1.1%)",
    isotopes: [
      { massNum: 58, abundance: 68.1 },
      { massNum: 60, abundance: 26.2 },
      { massNum: 62, abundance: 3.6 },
    ],
    role_fa: "جفت‌شدن دوگانه نیکل/فوتورداکس (C(sp³)-C(sp²))، فعال‌سازی پیوند C-O و جفت‌شدن احیایی",
    role_en: "Metallaphotoredox C(sp³)–C(sp²) coupling, C–O bond activation & reductive XEC",
    precatalysts: [
      {
        name: "NiCl2·glyme",
        formula: "C4H10Cl2NiO2",
        mw: 219.72,
        defaultMolPercent: 5,
        ligand_en: "dtbbpy (4,4'-di-tert-butyl-2,2'-bipyridine)",
        ligand_fa: "لیگاند بی‌پیريدین dtbbpy",
        reaction_en: "MacMillan Metallaphotoredox Decarboxylative / Cross-Electrophile Coupling",
        reaction_fa: "جفت‌شدن متالافوتورداکس دکربوکسیلاتیو مک‌میلان",
        sensitivity: "Air-stable",
      },
      {
        name: "Ni(cod)2",
        formula: "C16H24Ni",
        mw: 275.06,
        defaultMolPercent: 5,
        ligand_en: "PCy3 or IPr (NHC)",
        ligand_fa: "تری‌سیکلوهگزیل‌فسفین (PCy3) یا کاربن IPr",
        reaction_en: "Suzuki Coupling of Aryl Ethers / Esters",
        reaction_fa: "جفت‌شدن سوزوکی اترها و استرهای آروماتیک",
        sensitivity: "Glovebox / Schlenk",
      },
    ],
  },
  {
    z: 29,
    symbol: "Cu",
    name_en: "Copper",
    name_fa: "مس",
    mass: 63.546,
    row: 4,
    col: 11,
    category: "transition",
    cpkColor: "#ea580c",
    ox: "+1, +2, +3",
    config: "[Ar] 3d¹⁰ 4s¹",
    eneg: 1.9,
    ionizationKj: 745,
    radiusPm: 145,
    nmrNucleus: "⁶³Cu (I = 3/2, 69.2%)",
    isotopes: [
      { massNum: 63, abundance: 69.2 },
      { massNum: 65, abundance: 30.8 },
    ],
    role_fa: "شیمی کلیک CuAAC، جفت‌شدن چن-لام (Chan-Lam)، اولمن-گلدبرگ و کو-کاتالیزور سونوگاشیرا",
    role_en: "CuAAC Click chemistry, Chan-Lam aerobic C–N/C–O coupling, Ullmann & Sonogashira",
    precatalysts: [
      {
        name: "CuI (Copper(I) iodide)",
        formula: "CuI",
        mw: 190.45,
        defaultMolPercent: 5,
        ligand_en: "DMEDA or L-Proline",
        ligand_fa: "لیگاند دی‌آمین DMEDA یا پرولین",
        reaction_en: "Ullmann C–N Coupling & Sonogashira Alkyne Coupling",
        reaction_fa: "جفت‌شدن اولمن و واکنش سونوگاشیرا",
        sensitivity: "Air-stable",
      },
      {
        name: "CuSO4·5H2O",
        formula: "CuSO4.5H2O",
        mw: 249.68,
        defaultMolPercent: 5,
        ligand_en: "Sodium ascorbate + TBTA",
        ligand_fa: "سدیم آسکوربات + لیگاند TBTA",
        reaction_en: "Sharpless-Meldal CuAAC Click Cycloaddition",
        reaction_fa: "واکنش حلقه‌زایی کلیک آزید-آلکین (CuAAC)",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 30,
    symbol: "Zn",
    name_en: "Zinc",
    name_fa: "روی",
    mass: 65.38,
    row: 4,
    col: 12,
    category: "transition",
    cpkColor: "#64748b",
    ox: "+2",
    config: "[Ar] 3d¹⁰ 4s²",
    eneg: 1.65,
    ionizationKj: 906,
    radiusPm: 142,
    nmrNucleus: "⁶⁷Zn (I = 5/2, 4.1%)",
    isotopes: [
      { massNum: 64, abundance: 49.2 },
      { massNum: 66, abundance: 27.7 },
      { massNum: 68, abundance: 18.5 },
    ],
    role_fa: "جفت‌شدن نگیشی (Negishi) با تحمل گروه‌های عاملی حساس و سیکلوپروپاناسیون سیمونز-اسمیت",
    role_en: "Negishi cross-coupling (RZnX), Reformatsky reaction & Simmons-Smith cyclopropanation",
  },
  {
    z: 35,
    symbol: "Br",
    name_en: "Bromine",
    name_fa: "برم",
    mass: 79.904,
    row: 4,
    col: 17,
    category: "halogen",
    cpkColor: "#9333ea",
    ox: "-1",
    config: "[Ar] 3d¹⁰ 4s² 4p⁵",
    eneg: 2.96,
    ionizationKj: 1140,
    radiusPm: 94,
    nmrNucleus: "⁷⁹Br / ⁸¹Br",
    isotopes: [
      { massNum: 79, abundance: 50.7 },
      { massNum: 81, abundance: 49.3 },
    ],
    role_fa: "متداول‌ترین آریل هالید در سنتز آزمایشگاهی؛ الگوی ایزوتوپی دوقلوی ۱:۱ (M / M+2) در MS",
    role_en: "Gold-standard aryl bromide electrophile; signature 1:1 (M / M+2) MS isotope doublet",
  },
  // Period 5 — Platinum Group Metals & Key Synthetic Elements
  {
    z: 44,
    symbol: "Ru",
    name_en: "Ruthenium",
    name_fa: "روتنیوم",
    mass: 101.07,
    row: 5,
    col: 8,
    category: "pgm",
    cpkColor: "#0891b2",
    ox: "+2, +3, +4, +8",
    config: "[Kr] 4d⁷ 5s¹",
    eneg: 2.2,
    ionizationKj: 710,
    radiusPm: 178,
    nmrNucleus: "⁹⁹Ru / ¹⁰¹Ru",
    isotopes: [
      { massNum: 100, abundance: 12.6 },
      { massNum: 101, abundance: 17.1 },
      { massNum: 102, abundance: 31.6 },
      { massNum: 104, abundance: 18.6 },
    ],
    role_fa:
      "متاتز اولفین گرابز (نوبل ۲۰۰۵)، هیدروژناسیون نامتقارن نویوری و فوتوکاتالیزور [Ru(bpy)3]²⁺",
    role_en: "Grubbs olefin metathesis, Noyori asymmetric hydrogenation & [Ru(bpy)3]²⁺ photoredox",
    precatalysts: [
      {
        name: "Grubbs Catalyst 2nd Gen (G-II)",
        formula: "C46H65Cl2N2PRu",
        mw: 848.97,
        defaultMolPercent: 2,
        ligand_en: "SIMes (NHC) + PCy3",
        ligand_fa: "کاربن SIMes + فسفین PCy3",
        reaction_en: "Ring-Closing & Cross Olefin Metathesis (RCM / CM)",
        reaction_fa: "متاتز بسته‌شدن حلقه و متاتز متقاطع اولفین‌ها",
        sensitivity: "Air-stable",
      },
      {
        name: "Ru(bpy)3Cl2·6H2O",
        formula: "C30H24Cl2N6Ru.6H2O",
        mw: 748.62,
        defaultMolPercent: 1,
        ligand_en: "2,2'-Bipyridine (452 nm Blue LED)",
        ligand_fa: "لیگاند بی‌پیريدین (نور آبی ۴۵۲ نانومتر)",
        reaction_en: "Visible-Light Photoredox Single-Electron Transfer (SET)",
        reaction_fa: "کاتالیز فوتورداکس انتقال تک‌الکترون با نور مرئی",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 45,
    symbol: "Rh",
    name_en: "Rhodium",
    name_fa: "رودیوم",
    mass: 102.91,
    row: 5,
    col: 9,
    category: "pgm",
    cpkColor: "#0284c7",
    ox: "+1, +2, +3",
    config: "[Kr] 4d⁸ 5s¹",
    eneg: 2.28,
    ionizationKj: 720,
    radiusPm: 173,
    nmrNucleus: "¹⁰³Rh (I = 1/2, 100%, 12.6 MHz)",
    isotopes: [{ massNum: 103, abundance: 100 }],
    role_fa:
      "کاتالیزور ویلکینسون، درج کاربن دایره دوفلزدی [Rh2(OAc)4] و فعال‌سازی C-H با Cp*Rh(III)",
    role_en: "Wilkinson hydrogenation, Dirhodium(II) donor-acceptor carbene C–H insertion & Cp*Rh",
    precatalysts: [
      {
        name: "Rh2(OAc)4 (Dirhodium tetraacetate)",
        formula: "C8H12O8Rh2",
        mw: 441.99,
        defaultMolPercent: 1,
        ligand_en: "Bridging Acetate Paddlewheel",
        ligand_fa: "ساختار چرخ‌پره‌ای استات",
        reaction_en: "Diazo Carbene Cyclopropanation & C–H Insertion",
        reaction_fa: "سیکلوپروپاناسیون و درج کاربن در پیوند C-H",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 46,
    symbol: "Pd",
    name_en: "Palladium",
    name_fa: "پالادیوم",
    mass: 106.42,
    row: 5,
    col: 10,
    category: "pgm",
    cpkColor: "#06b6d4",
    ox: "0, +2, +4",
    config: "[Kr] 4d¹⁰",
    eneg: 2.2,
    ionizationKj: 804,
    radiusPm: 169,
    nmrNucleus: "¹⁰⁵Pd (I = 5/2, 22.3%)",
    isotopes: [
      { massNum: 104, abundance: 11.1 },
      { massNum: 105, abundance: 22.3 },
      { massNum: 106, abundance: 27.3 },
      { massNum: 108, abundance: 26.5 },
      { massNum: 110, abundance: 11.7 },
    ],
    role_fa:
      "پادشاه واکنش‌های جفت‌شدن متقاطع (نوبل ۲۰۱۰): سوزوکی، هک، باخوالد-هارتویگ، سونوگاشیرا و استیل",
    role_en:
      "Nobel-winning cornerstone of Suzuki, Heck, Buchwald-Hartwig, Sonogashira & Stille couplings",
    precatalysts: [
      {
        name: "Pd(PPh3)4 (Tetrakis)",
        formula: "Pd(PPh3)4",
        mw: 1155.56,
        defaultMolPercent: 5,
        ligand_en: "Triphenylphosphine (PPh3)",
        ligand_fa: "تری‌فنیل‌فسفین (PPh3)",
        reaction_en: "Suzuki-Miyaura, Stille & Sonogashira Cross-Coupling",
        reaction_fa: "جفت‌شدن سوزوکی-میاورا، استیل و سونوگاشیرا",
        sensitivity: "Moderate",
      },
      {
        name: "Pd(dppf)Cl2",
        formula: "C34H28Cl2FeP2Pd",
        mw: 731.7,
        defaultMolPercent: 3,
        ligand_en: "1,1'-Bis(diphenylphosphino)ferrocene",
        ligand_fa: "لیگاند فروسنی دو دندانه‌ای dppf",
        reaction_en: "Miyaura Borylation & Challenging Alkyl/Heteroaryl Suzuki",
        reaction_fa: "بوریلاسیون میاورا و جفت‌شدن سوزوکی هتروآریل‌ها",
        sensitivity: "Air-stable",
      },
      {
        name: "Pd2(dba)3",
        formula: "Pd2(dba)3",
        mw: 915.72,
        defaultMolPercent: 2.5,
        ligand_en: "Pair with XPhos, SPhos, RuPhos, or BINAP",
        ligand_fa: "قابل جفت‌شدن با لیگاندهای باخوالد (XPhos, SPhos) یا BINAP",
        reaction_en: "Buchwald-Hartwig C–N Amination & Aryl Chloride Coupling",
        reaction_fa: "آمیناسیون باخوالد-هارتویگ (تشکیل پیوند C-N)",
        sensitivity: "Air-stable",
      },
    ],
  },
  {
    z: 47,
    symbol: "Ag",
    name_en: "Silver",
    name_fa: "نقره",
    mass: 107.87,
    row: 5,
    col: 11,
    category: "transition",
    cpkColor: "#94a3b8",
    ox: "+1",
    config: "[Kr] 4d¹⁰ 5s¹",
    eneg: 1.93,
    ionizationKj: 731,
    radiusPm: 165,
    nmrNucleus: "¹⁰⁷Ag / ¹⁰⁹Ag (I = 1/2)",
    isotopes: [
      { massNum: 107, abundance: 51.8 },
      { massNum: 109, abundance: 48.2 },
    ],
    role_fa: "حذف هالید و تولید کمپلکس‌های کاتیونی فعال (AgOTf, AgSbF6) و اکسیدان در فعال‌سازی C-H",
    role_en: "Halide abstractor (AgOTf, AgBF4) to generate cationic Au/Pd catalysts & C–H oxidant",
  },
  {
    z: 50,
    symbol: "Sn",
    name_en: "Tin",
    name_fa: "قلع",
    mass: 118.71,
    row: 5,
    col: 14,
    category: "post-transition",
    cpkColor: "#475569",
    ox: "+2, +4",
    config: "[Kr] 4d¹⁰ 5s² 5p²",
    eneg: 1.96,
    ionizationKj: 709,
    radiusPm: 145,
    nmrNucleus: "¹¹⁹Sn (I = 1/2, 8.6%, 149 MHz)",
    isotopes: [
      { massNum: 116, abundance: 14.5 },
      { massNum: 118, abundance: 24.2 },
      { massNum: 119, abundance: 8.6 },
      { massNum: 120, abundance: 32.6 },
    ],
    role_fa: "معرف‌های ارگانواستنان (Bu3Sn-R) در جفت‌شدن کاملاً خنثای استیل (Stille Coupling)",
    role_en: "Organostannanes in neutral Stille cross-coupling of complex natural products",
  },
  {
    z: 53,
    symbol: "I",
    name_en: "Iodine",
    name_fa: "ید",
    mass: 126.9,
    row: 5,
    col: 17,
    category: "halogen",
    cpkColor: "#7e22ce",
    ox: "-1, +3, +5",
    config: "[Kr] 4d¹⁰ 5s² 5p⁵",
    eneg: 2.66,
    ionizationKj: 1008,
    radiusPm: 115,
    nmrNucleus: "¹²⁷I (I = 5/2, 100%)",
    isotopes: [{ massNum: 127, abundance: 100 }],
    role_fa:
      "واکنش‌پذیرترین آریل هالید در دمای محیط و معرف‌های ید فوق‌ظرفیت (پریودینان دس-مارتین DMP)",
    role_en: "Fastest oxidative-addition aryl halide & hypervalent iodine oxidants (DMP, PIDA)",
  },
  // Period 6
  {
    z: 55,
    symbol: "Cs",
    name_en: "Cesium",
    name_fa: "سزیم",
    mass: 132.91,
    row: 6,
    col: 1,
    category: "alkali",
    cpkColor: "#6d28d9",
    ox: "+1",
    config: "[Xe] 6s¹",
    eneg: 0.79,
    ionizationKj: 376,
    radiusPm: 298,
    nmrNucleus: "¹³³Cs (I = 7/2, 100%)",
    isotopes: [{ massNum: 133, abundance: 100 }],
    role_fa: "باز طلایی Cs2CO3 (اثر سزیم) با حلالیت عالی در حلال‌های آپروتیک مثل دی‌اکسان و DMF",
    role_en:
      "Cs2CO3 ('Cesium Effect') soft base with superior solubility in aprotic organic solvents",
  },
  {
    z: 62,
    symbol: "Sm",
    name_en: "Samarium",
    name_fa: "ساماریوم",
    mass: 150.36,
    row: 6,
    col: 3,
    category: "lanthanide",
    cpkColor: "#ec4899",
    ox: "+2, +3",
    config: "[Xe] 4f⁶ 6s²",
    eneg: 1.17,
    ionizationKj: 545,
    radiusPm: 238,
    nmrNucleus: "¹⁴⁷Sm / ¹⁴⁹Sm",
    isotopes: [
      { massNum: 147, abundance: 15.0 },
      { massNum: 152, abundance: 26.7 },
      { massNum: 154, abundance: 22.7 },
    ],
    role_fa: "معرف کاگان (SmI2) برای کاهش‌های تک‌الکترونی رادیکالی و حلقه‌زایی کتون-اولفین",
    role_en: "Kagan's Reagent (SmI2) for chemoselective single-electron radical cyclizations",
  },
  {
    z: 77,
    symbol: "Ir",
    name_en: "Iridium",
    name_fa: "ایریدیوم",
    mass: 192.22,
    row: 6,
    col: 9,
    category: "pgm",
    cpkColor: "#4f46e5",
    ox: "+1, +3",
    config: "[Xe] 4f¹⁴ 5d⁷ 6s²",
    eneg: 2.2,
    ionizationKj: 880,
    radiusPm: 180,
    nmrNucleus: "¹⁹¹Ir / ¹⁹³Ir",
    isotopes: [
      { massNum: 191, abundance: 37.3 },
      { massNum: 193, abundance: 62.7 },
    ],
    role_fa:
      "فوتوکاتالیزورهای قدرتمند نور آبی، کاتالیزور کربوهیدروژناسیون کراب‌تری و بوریلاسیون C-H",
    role_en:
      "High-potential blue-LED photoredox catalysts, Crabtree hydrogenation & C–H borylation",
    precatalysts: [
      {
        name: "[Ir(dF(CF3)ppy)2(dtbbpy)]PF6",
        formula: "C42H34F16IrN4P",
        mw: 1121.91,
        defaultMolPercent: 1,
        ligand_en: "Fluorinated Phenylpyridine + dtbbpy",
        ligand_fa: "فنیل‌پیریدین فلوئوردار + dtbbpy",
        reaction_en: "Visible-Light Metallaphotoredox & Energy Transfer Catalysis",
        reaction_fa: "کاتالیز متالافوتورداکس و انتقال انرژی با LED آبی",
        sensitivity: "Air-stable",
      },
      {
        name: "[Ir(cod)(OMe)]2",
        formula: "C18H30Ir2O2",
        mw: 662.86,
        defaultMolPercent: 1.5,
        ligand_en: "dtbbpy (4,4'-di-tert-butylbipyridine)",
        ligand_fa: "لیگاند dtbbpy",
        reaction_en: "Hartwig-Miyaura Sterically Directed C–H Borylation",
        reaction_fa: "بوریلاسیون مستقیم C-H آروماتیک هارتویگ-میاورا",
        sensitivity: "Moderate",
      },
    ],
  },
  {
    z: 78,
    symbol: "Pt",
    name_en: "Platinum",
    name_fa: "پلاتین",
    mass: 195.08,
    row: 6,
    col: 10,
    category: "pgm",
    cpkColor: "#475569",
    ox: "0, +2, +4",
    config: "[Xe] 4f¹⁴ 5d⁹ 6s¹",
    eneg: 2.28,
    ionizationKj: 870,
    radiusPm: 177,
    nmrNucleus: "¹⁹⁵Pt (I = 1/2, 33.8%, 86 MHz)",
    isotopes: [
      { massNum: 194, abundance: 32.9 },
      { massNum: 195, abundance: 33.8 },
      { massNum: 196, abundance: 25.2 },
      { massNum: 198, abundance: 7.2 },
    ],
    role_fa:
      "کاتالیزور کارستد (Karstedt) در هیدروسیلیلاسیون صنعتی، کاتالیزور آدامز و داروی ضدسرطان سیس‌پلاتین",
    role_en: "Karstedt hydrosilylation catalyst, Adams' PtO2 hydrogenation & Cisplatin oncology",
  },
  {
    z: 79,
    symbol: "Au",
    name_en: "Gold",
    name_fa: "طلا",
    mass: 196.97,
    row: 6,
    col: 11,
    category: "pgm",
    cpkColor: "#eab308",
    ox: "+1, +3",
    config: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
    eneg: 2.54,
    ionizationKj: 890,
    radiusPm: 174,
    nmrNucleus: "¹⁹⁷Au (I = 3/2, 100%)",
    isotopes: [{ massNum: 197, abundance: 100 }],
    role_fa:
      "اسید π کاربوفیل ملایم و بی‌رقیب برای فعال‌سازی انتخابی پیوند سه‌گانه آلکین‌ها و آلن‌ها",
    role_en:
      "Relativistic soft carbophilic π-acid for chemoselective alkyne & allene hydrofunctionalization",
    precatalysts: [
      {
        name: "Ph3PAuCl + AgNTf2",
        formula: "C18H15AuClP",
        mw: 494.71,
        defaultMolPercent: 2,
        ligand_en: "PPh3 or JohnPhos",
        ligand_fa: "لیگاند فسفین PPh3 یا JohnPhos",
        reaction_en: "Gold(I)-Catalyzed Alkyne Hydration & Enyne Cycloisomerization",
        reaction_fa: "حلقه‌زایی و هیدراتاسیون کاتالیزوری آلکین‌ها با طلا(I)",
        sensitivity: "Air-stable",
      },
    ],
  },
];

interface PeriodicCatalystHubProps {
  isRtl: boolean;
  onAddElementToFormula: (symbol: string) => void;
  onAddPrecatalystToStoich: (precatalyst: {
    name: string;
    formula: string;
    mw: number;
    equiv: number;
  }) => void;
  onSendCatalystToStudio: (promptText: string) => void;
}

export function PeriodicCatalystHub({
  isRtl,
  onAddElementToFormula,
  onAddPrecatalystToStoich,
  onSendCatalystToStudio,
}: PeriodicCatalystHubProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("Pd");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [heatmapMode, setHeatmapMode] = useState<"cpk" | "eneg" | "radius">("cpk");

  const activeEl = useMemo(
    () =>
      PERIODIC_CATALYST_ELEMENTS.find((e) => e.symbol === selectedSymbol) ||
      PERIODIC_CATALYST_ELEMENTS.find((e) => e.symbol === "Pd")!,
    [selectedSymbol],
  );

  function getTileColor(el: RichElementData): string {
    if (heatmapMode === "cpk") return el.cpkColor;
    if (heatmapMode === "eneg") {
      if (!el.eneg) return "#64748b";
      const ratio = Math.min(1, Math.max(0, (el.eneg - 0.7) / 3.3));
      // Interpolate from Indigo (#4f46e5) to Emerald (#10b981) to Rose (#f43f5e)
      if (ratio < 0.5) return "#06b6d4";
      if (ratio < 0.75) return "#10b981";
      return "#f43f5e";
    }
    // radius mode
    if (el.radiusPm > 180) return "#8b5cf6";
    if (el.radiusPm > 130) return "#06b6d4";
    return "#10b981";
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Filter & Heatmap Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", fa: "همه عناصر کلیدی", en: "All Synthetic Elements" },
            {
              id: "pgm",
              fa: "فلزات گروه پلاتین (Pd, Ir, Ru, Rh, Au)",
              en: "Precious Catalysts (PGM)",
            },
            {
              id: "transition",
              fa: "فلزات واسطه پایه (Ni, Cu, Fe, Ti)",
              en: "Earth-Abundant Metals",
            },
            { id: "main", fa: "عناصر گروه اصلی و هالوژن‌ها", en: "Main Group & Halogens" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat.id
                  ? "bg-accent-strong text-accent-foreground font-bold shadow-2xs"
                  : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {isRtl ? cat.fa : cat.en}
            </button>
          ))}
        </div>

        {/* Heatmap Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/70 border border-border/70 text-xs font-mono">
          {[
            { id: "cpk" as const, label: isRtl ? "رنگ استاندارد CPK" : "CPK Color" },
            { id: "eneg" as const, label: isRtl ? "الکترونگاتیوی (χ)" : "Electronegativity" },
            { id: "radius" as const, label: isRtl ? "شعاع اتمی (pm)" : "Atomic Radius" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setHeatmapMode(m.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                heatmapMode === m.id
                  ? "bg-card text-foreground font-bold border border-border shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Periodic Table Matrix + Deep Element & Isotope/NMR Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Periodic Table Grid */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-muted-foreground">
                  IUPAC Periodic Table · NMR Nuclei & Catalytic Properties
                </span>
                <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                  {isRtl
                    ? "جدول تناوبی تعاملی، هسته‌های فعال NMR و کاتالیزورها"
                    : "Interactive Periodic Table, NMR Nuclei & Catalyst Matrix"}
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Z = {activeEl.z} ({activeEl.symbol})
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PERIODIC_CATALYST_ELEMENTS.filter((el) => {
                if (categoryFilter === "all") return true;
                if (categoryFilter === "pgm") return el.category === "pgm";
                if (categoryFilter === "transition")
                  return el.category === "transition" || el.category === "lanthanide";
                return (
                  el.category !== "pgm" &&
                  el.category !== "transition" &&
                  el.category !== "lanthanide"
                );
              }).map((el) => {
                const isSelected = el.symbol === selectedSymbol;
                const tileColor = getTileColor(el);
                const hasCatalysts = el.precatalysts && el.precatalysts.length > 0;

                return (
                  <button
                    key={el.symbol}
                    type="button"
                    onClick={() => setSelectedSymbol(el.symbol)}
                    className={`relative p-2.5 rounded-xl border text-start transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-accent-strong bg-secondary ring-2 ring-accent-strong/40 shadow-xs"
                        : "border-border/80 bg-background hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-mono text-[10px]">
                      <span className="font-bold text-muted-foreground">{el.z}</span>
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: tileColor }}
                      />
                    </div>

                    <div className="my-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold font-mono text-foreground leading-none">
                          {el.symbol}
                        </span>
                        {hasCatalysts && (
                          <span
                            className="text-[9px] font-mono text-[#06B6D4] font-bold"
                            title="Catalyst Presets Available"
                          >
                            ★ Cat
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block mt-1">
                        {isRtl ? el.name_fa : el.name_en}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-muted-foreground tabular-nums border-t border-border/50 pt-1 flex items-center justify-between">
                      <span>
                        {heatmapMode === "eneg"
                          ? `χ=${el.eneg || "—"}`
                          : heatmapMode === "radius"
                            ? `${el.radiusPm}pm`
                            : el.mass.toFixed(1)}
                      </span>
                      <span>{el.ox.split(",")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Isotope Pattern & NMR Active Nucleus Bar inside Left Card */}
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/80 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-[#06B6D4]" />
                <span className="text-xs font-bold text-foreground">
                  {isRtl
                    ? `ویژگی‌های طیف‌سنجی جرمی (MS) و رزونانس مغناطیسی (NMR) عنصر ${activeEl.symbol}:`
                    : `NMR & Mass Spec Isotopic Profile for ${activeEl.name_en} (${activeEl.symbol}):`}
                </span>
              </div>
              <span className="text-xs font-mono text-[#06B6D4] font-semibold">
                NMR: {activeEl.nmrNucleus}
              </span>
            </div>

            {/* Visual Natural Isotope Abundance Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              {activeEl.isotopes.map((iso) => (
                <div
                  key={iso.massNum}
                  className="p-2 rounded-lg bg-card border border-border/70 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">
                      <sup>{iso.massNum}</sup>
                      {activeEl.symbol}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{iso.abundance}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-[#06B6D4]" style={{ width: `${iso.abundance}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Deep Element Inspector & Catalyst/Ligand Advisor */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            {/* Element Header */}
            <div className="flex items-start justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="size-14 rounded-2xl flex flex-col items-center justify-center text-white font-mono shadow-xs"
                  style={{ backgroundColor: activeEl.cpkColor }}
                >
                  <span className="text-[10px] leading-none opacity-80">{activeEl.z}</span>
                  <span className="text-2xl font-extrabold leading-tight">{activeEl.symbol}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-foreground">
                    {isRtl ? activeEl.name_fa : activeEl.name_en}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {activeEl.config} · {activeEl.ox}
                  </p>
                </div>
              </div>
              <div className="text-end font-mono">
                <span className="text-[10px] text-muted-foreground block">Standard Atomic Wt</span>
                <span className="text-base font-extrabold text-foreground tabular-nums">
                  {activeEl.mass} g/mol
                </span>
              </div>
            </div>

            {/* 4 Key Atomic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "الکترونگاتیوی" : "Pauling χ"}
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {activeEl.eneg || "—"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "شعاع اتمی" : "Radius"}
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {activeEl.radiusPm} pm
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "انرژی یونش اول" : "1st Ionization"}
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {activeEl.ionizationKj} kJ
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "اعداد اکسایش" : "Ox. States"}
                </span>
                <span className="font-bold text-[#06B6D4] truncate block">{activeEl.ox}</span>
              </div>
            </div>

            {/* Role in Synthesis */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70">
              <span className="text-[11px] font-mono text-muted-foreground block mb-1">
                {isRtl
                  ? "نقش کلیدی در سنتز آلی، کاتالیز و طیف‌سنجی:"
                  : "Key Role in Synthesis, Catalysis & Spectroscopy:"}
              </span>
              <p className="text-xs text-foreground leading-relaxed">
                {isRtl ? activeEl.role_fa : activeEl.role_en}
              </p>
            </div>

            {/* Industrial & Lab Precatalyst / Ligand Selector (if available for this element) */}
            {activeEl.precatalysts && activeEl.precatalysts.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FlaskConical className="size-3.5 text-[#06B6D4]" />
                    <span>
                      {isRtl
                        ? `پیش‌کاتالیزورها و لیگاندهای استاندارد ${activeEl.name_fa}:`
                        : `Benchmark ${activeEl.name_en} Precatalysts & Ligands:`}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {activeEl.precatalysts.map((cat) => (
                    <div
                      key={cat.name}
                      className="p-3 rounded-xl bg-background border border-border/80 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold font-mono text-foreground block">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {isRtl ? cat.reaction_fa : cat.reaction_en}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#06B6D4] shrink-0 tabular-nums">
                          MW: {cat.mw} · {cat.defaultMolPercent} mol%
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground border-t border-border/60 pt-2">
                        <span className="truncate">
                          {isRtl ? `لیگاند: ${cat.ligand_fa}` : `Ligand: ${cat.ligand_en}`}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onAddPrecatalystToStoich({
                                name: cat.name,
                                formula: cat.formula,
                                mw: cat.mw,
                                equiv: Number((cat.defaultMolPercent / 100).toFixed(3)),
                              })
                            }
                            className="h-7 px-2.5 text-[11px] gap-1"
                          >
                            <Scale className="size-3 text-[#10B981]" />
                            <span>{isRtl ? "افزودن به جدول استوکیومتری" : "Add to Stoich"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions: Add to Formula or Generate Catalytic Abstract */}
          <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddElementToFormula(activeEl.symbol)}
              className="h-9 text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>
                {isRtl
                  ? `افزودن ${activeEl.symbol} به فرمول‌ساز`
                  : `Add ${activeEl.symbol} to Formula`}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                const promptText = `${activeEl.name_en} (${activeEl.symbol}, oxidation states ${activeEl.ox}) catalytic mechanism: ${activeEl.role_en}`;
                onSendCatalystToStudio(promptText);
              }}
              className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
            >
              <Sparkles className="size-3.5" />
              <span>
                {isRtl
                  ? `تولید ابسترکت کاتالیزوری ${activeEl.name_fa}`
                  : `Generate ${activeEl.symbol} Catalytic Abstract`}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
