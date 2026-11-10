export type JournalId = "acs" | "elsevier" | "rsc" | "nature" | "wiley" | "general";

export type ColorSchemeId =
  "academic-clean" | "colorblind-safe" | "high-contrast" | "nature-editorial";

export interface JournalStandard {
  id: JournalId;
  name: string;
  fullName: string;
  publisher: string;
  badge: string;
  widthCm: number;
  heightCm: number;
  aspectRatio: string;
  ratioValue: number;
  canvasWidth: number;
  canvasHeight: number;
  minDpi: number;
  recommendedDpi: number;
  color: string;
  descriptionEn: string;
  descriptionFa: string;
  editorialRules: string[];
  promptInstructions: string;
}

export interface ColorScheme {
  id: ColorSchemeId;
  nameEn: string;
  nameFa: string;
  descriptionEn: string;
  descriptionFa: string;
  colors: string[];
  promptModifier: string;
}

export const JOURNAL_STANDARDS: Record<JournalId, JournalStandard> = {
  acs: {
    id: "acs",
    name: "ACS (JACS)",
    fullName: "American Chemical Society TOC Graphic",
    publisher: "ACS Publications (JACS, ACS Nano, Org. Lett.)",
    badge: "ACS TOC",
    widthCm: 8.25,
    heightCm: 4.45,
    aspectRatio: "1.85:1",
    ratioValue: 1.854,
    canvasWidth: 1950,
    canvasHeight: 1052,
    minDpi: 300,
    recommendedDpi: 600,
    color: "#2563EB",
    descriptionEn:
      "Standard Table of Contents (TOC) graphic: 8.25 × 4.45 cm (ratio ~1.85:1), pure white background, no outer frame.",
    descriptionFa:
      "استاندارد کادر TOC انجمن شیمی آمریکا: ۸.۲۵ در ۴.۴۵ سانتی‌متر (نسبت ۱.۸۵:۱)، پس‌زمینه سفید خالص، بدون کادر دور.",
    editorialRules: [
      "Maximum physical size: 8.25 cm wide by 4.45 cm high (3.25 × 1.75 in)",
      "Strictly pure white background (#ffffff) with zero background noise",
      "No decorative outer frames or solid black bounding boxes",
      "Directional horizontal flow from left (reactants) to right (products)",
      "Clear IUPAC molecular structures with legible Helvetica/Arial typography",
      "Minimum 300 DPI resolution for print reproduction",
    ],
    promptInstructions:
      "STRICT ACS (American Chemical Society) TOC GUIDELINE: Horizontal 1.85:1 aspect ratio. Strictly pure white background (#ffffff). No outer borders or bounding frames. Clean, elegant chemistry illustration flowing logically from left (reactants/precursors) through center arrows (catalyst, reagents, physical conditions) to right (isolated products, characterization, application). Sans-serif IUPAC legible chemical structures.",
  },
  elsevier: {
    id: "elsevier",
    name: "Elsevier",
    fullName: "Elsevier ScienceDirect Graphical Abstract",
    publisher: "Elsevier (Cell, Tetrahedron, Biomaterials)",
    badge: "Elsevier 2.5:1",
    widthCm: 13.0,
    heightCm: 5.0,
    aspectRatio: "2.6:1",
    ratioValue: 2.6,
    canvasWidth: 2000,
    canvasHeight: 769,
    minDpi: 300,
    recommendedDpi: 531,
    color: "#EA580C",
    descriptionEn:
      "Wide panorama graphical abstract: 13 × 5 cm (minimum 1328 × 531 px at 300 DPI), high thumbnail legibility.",
    descriptionFa:
      "استاندارد عریض الزیویر: ۱۳ در ۵ سانتی‌متر (حداقل ۵۳۱ در ۱۳۲۸ پیکسل در ۳۰۰ DPI)، خوانایی بالا در تصویر بندانگشتی.",
    editorialRules: [
      "Standard dimensions: 5 cm high × 13 cm wide (minimum 531 × 1328 pixels)",
      "Wide panorama layout optimized for ScienceDirect online previews",
      "Essential visual story legible when scaled down to 200px thumbnail",
      "High visual contrast and clear step-by-step progressional arrows",
      "Minimalist text labels, avoiding dense paragraphs",
    ],
    promptInstructions:
      "STRICT ELSEVIER GRAPHICAL ABSTRACT GUIDELINE: Wide panoramic 2.5:1 to 2.6:1 aspect ratio. Clean high-contrast visual summary designed to be instantly readable when scaled down to a 200-pixel thumbnail on ScienceDirect. Step-by-step linear workflow, bold chemical structures, clean white background, high data-to-ink ratio with clear mechanistic transitions.",
  },
  rsc: {
    id: "rsc",
    name: "RSC",
    fullName: "Royal Society of Chemistry TOC Scheme",
    publisher: "RSC (Chem. Sci., Chem. Comm., Green Chem.)",
    badge: "RSC 2:1",
    widthCm: 8.0,
    heightCm: 4.0,
    aspectRatio: "2:1",
    ratioValue: 2.0,
    canvasWidth: 1890,
    canvasHeight: 945,
    minDpi: 300,
    recommendedDpi: 600,
    color: "#059669",
    descriptionEn:
      "Royal Society of Chemistry standard: exactly 8 × 4 cm (ratio 2:1), 80 × 40 mm, clean single-column scheme.",
    descriptionFa:
      "استاندارد انجمن سلطنتی شیمی بریتانیا: ۸ در ۴ سانتی‌متر (نسبت دقیق ۲:۱)، ۸۰ در ۴۰ میلی‌متر، متناسب با تک‌ستون.",
    editorialRules: [
      "Physical dimension: 80 mm wide by 40 mm high (ratio 2:1)",
      "Fits cleanly into the journal table-of-contents single column",
      "Pure white background, clean ChemDraw-style line bonds",
      "Reaction conditions clearly annotated above/below reaction arrow",
      "Clear stereochemistry and functional group transformations",
    ],
    promptInstructions:
      "STRICT RSC (Royal Society of Chemistry) TOC GUIDELINE: Exact 2:1 aspect ratio (80mm x 40mm). Pure white background, high-definition chemical schematic, publication-grade ChemDraw aesthetic. Explicit reaction conditions, temperature, and catalysts cleanly aligned with reaction arrows. Balanced and symmetrical visual weight.",
  },
  nature: {
    id: "nature",
    name: "Nature",
    fullName: "Springer Nature Visual Abstract",
    publisher: "Nature Portfolio (Nat. Chem., Nat. Commun.)",
    badge: "Nature 16:9",
    widthCm: 16.0,
    heightCm: 9.0,
    aspectRatio: "16:9",
    ratioValue: 1.778,
    canvasWidth: 1920,
    canvasHeight: 1080,
    minDpi: 300,
    recommendedDpi: 600,
    color: "#DC2626",
    descriptionEn:
      "Modern scientific visual abstract: 16:9 widescreen, colorblind-safe accessible palette, editorial elegance.",
    descriptionFa:
      "استاندارد نیچر و اسپرینگر: نسبت ۱۶:۹، پالت رنگی مناسب کوررنگی و دسترسی‌پذیر، طراحی گرافیکی علمی و مدرن.",
    editorialRules: [
      "Standard widescreen 16:9 visual abstract format",
      "Accessible, colorblind-friendly palette (avoids red-green ambiguity)",
      "High data-to-ink ratio with clean vector-like hierarchy",
      "Combines nanoscale/molecular insight with macroscopic impact",
      "Minimalist typography, clean callouts, no visual fluff",
    ],
    promptInstructions:
      "STRICT NATURE RESEARCH VISUAL ABSTRACT GUIDELINE: 16:9 widescreen ratio. Accessible, colorblind-safe scientific palette (blues, oranges, teals; strictly avoiding confusing red-green pairs). High data density with sophisticated editorial elegance. Modern laboratory diagram combining atomic/molecular precision with impactful mechanistic storytelling.",
  },
  wiley: {
    id: "wiley",
    name: "Wiley (Angewandte)",
    fullName: "Wiley-VCH Table of Contents Graphic",
    publisher: "Wiley (Angew. Chem. Int. Ed., Adv. Mater.)",
    badge: "Wiley 1.6:1",
    widthCm: 8.0,
    heightCm: 5.0,
    aspectRatio: "1.6:1",
    ratioValue: 1.6,
    canvasWidth: 1920,
    canvasHeight: 1200,
    minDpi: 300,
    recommendedDpi: 600,
    color: "#7C3AED",
    descriptionEn:
      "Wiley Angewandte Chemie format: 8 × 5 cm (1.6:1 ratio), compact, high visual impact and clarity.",
    descriptionFa:
      "استاندارد وایلی و انگوانته: ۸ در ۵ سانتی‌متر (نسبت ۱.۶:۱)، فشرده با جلوه بصری و وضوح مفهومی بسیار بالا.",
    editorialRules: [
      "Standard size: 8 cm wide by 5 cm high (1.6:1 aspect ratio)",
      "Compact, punchy visual punchline representing the paper's key novelty",
      "Crisp molecular renderings and high-contrast mechanistic graphics",
      "Sharp contrast on white background",
      "300+ DPI publication ready for digital and print versions",
    ],
    promptInstructions:
      "STRICT WILEY / ANGEWANDTE CHEMIE GUIDELINE: 1.6:1 aspect ratio (8cm x 5cm proportions). Compact, punchy, and visually compelling graphical abstract. Highlights the central chemical breakthrough with impeccable molecular structures, distinct arrow pathways, and crisp publication-ready clarity on pure white.",
  },
  general: {
    id: "general",
    name: "General TOC",
    fullName: "Multipurpose Scientific Graphical Abstract",
    publisher: "Conferences, Theses, Grant Proposals & Preprints",
    badge: "General 16:9",
    widthCm: 16.0,
    heightCm: 9.0,
    aspectRatio: "16:9",
    ratioValue: 1.778,
    canvasWidth: 1920,
    canvasHeight: 1080,
    minDpi: 300,
    recommendedDpi: 300,
    color: "#0891B2",
    descriptionEn:
      "Standard multipurpose 16:9 format suitable for arXiv/ChemRxiv preprints, presentations, theses, and grant slides.",
    descriptionFa:
      "فرمت چندمنظوره ۱۶:۹ مناسب برای پیش‌نویس‌های ChemRxiv، ارائه‌ها، پوسترهای کنفرانس و پروپوزال‌های پژوهشی.",
    editorialRules: [
      "Versatile 16:9 aspect ratio compatible with digital screens and posters",
      "High-resolution 1920×1080 canvas with 300 DPI print capability",
      "Balanced layout with clear chemical progression and reaction arrows",
      "Clean white background for versatile slide embedding",
    ],
    promptInstructions:
      "Publication-grade scientific graphical abstract illustration in 16:9 aspect ratio. Clean white background, crisp molecular structures, logical left-to-right reaction progression, balanced typography, and maximum scientific fidelity.",
  },
};

export const COLOR_SCHEMES: Record<ColorSchemeId, ColorScheme> = {
  "academic-clean": {
    id: "academic-clean",
    nameEn: "Classic Academic",
    nameFa: "آکادمیک کلاسیک",
    descriptionEn: "Standard IUPAC CPK colors with navy and cyan accents on pure white",
    descriptionFa: "رنگ‌بندی استاندارد CPK شیمی با تم سرمه‌ای و فیروزه‌ای روی پس‌زمینه سفید خالص",
    colors: ["#1E293B", "#2563EB", "#06B6D4", "#10B981"],
    promptModifier:
      "Color scheme: Classic academic chemistry palette. Pure white background (#FFFFFF). Standard IUPAC CPK atom colors (Carbon gray/black, Oxygen red, Nitrogen blue, Hydrogen white, Sulfur yellow). High contrast navy blue and cyan graphical accents.",
  },
  "colorblind-safe": {
    id: "colorblind-safe",
    nameEn: "Colorblind-Friendly",
    nameFa: "مناسب کوررنگی (دسترسی‌پذیر)",
    descriptionEn: "Wong / Okabe-Ito accessible palette ensuring clarity for all readers",
    descriptionFa:
      "پالت دسترسی‌پذیر Okabe-Ito بدون تداخل قرمز-سبز، خوانا برای تمام پژوهشگران و داوران",
    colors: ["#0072B2", "#D55E00", "#009E73", "#E69F00"],
    promptModifier:
      "Color scheme: Strictly colorblind-friendly accessible scientific palette (Okabe-Ito / Wong model: deep blue #0072B2, vermilion #D55E00, bluish green #009E73, reddish purple #CC79A7). Absolutely avoid ambiguous red-green combinations. Maintain high lightness contrast against pure white background.",
  },
  "high-contrast": {
    id: "high-contrast",
    nameEn: "High-Contrast Monochrome",
    nameFa: "کنتراست بالا (تک‌رنگ/طوسی)",
    descriptionEn: "Crisp black-and-white linework with subtle primary accent, optimal for print",
    descriptionFa:
      "خطوط مشکی پررنگ و شارپ با یک رنگ تاکیدی مینیمال، ایده‌آل برای چاپ ژورنال و فتوکپی",
    colors: ["#0F172A", "#475569", "#2563EB", "#F8FAFC"],
    promptModifier:
      "Color scheme: Ultra high-contrast crisp monochrome styling. Deep black outlines (#000000), subtle slate gray secondary tones, with a single electric cobalt blue accent. Pristine pure white background. Optimal for black-and-white journal printing and grayscale readers.",
  },
  "nature-editorial": {
    id: "nature-editorial",
    nameEn: "Nature Editorial",
    nameFa: "ژورنالی مدرن (Nature Style)",
    descriptionEn: "Sophisticated modern palette seen in Nature and Science feature articles",
    descriptionFa: "پالت شیک و مدرن برگرفته از مقالات ویژه مجلات Nature و Science",
    colors: ["#0F766E", "#BE123C", "#B45309", "#0369A1"],
    promptModifier:
      "Color scheme: Elegant Nature / Science editorial palette. Sophisticated deep teal (#0F766E), carmine accent (#BE123C), warm amber (#B45309), and crisp deep sapphire on a pure white background. Modern, refined, professional graphic design aesthetic.",
  },
};
