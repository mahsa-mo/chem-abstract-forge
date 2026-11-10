export type NamedReaction = {
  id: string;
  name_en: string;
  name_fa: string;
  category: "coupling" | "addition" | "substitution" | "rearrangement" | "carbonyl";
  year: number;
  nobelPrize?: string;
  description_fa: string;
  description_en: string;
  scheme: string;
  reactants: string[];
  reagentsAndCatalyst: string;
  product: string;
  conditions: string;
  mechanismSteps: { fa: string; en: string }[];
  abstractPromptText: string;
};

export const NAMED_REACTIONS: NamedReaction[] = [
  {
    id: "suzuki-coupling",
    name_en: "Suzuki-Miyaura Cross-Coupling",
    name_fa: "جفت‌شدن سوزوکی-میاورا",
    category: "coupling",
    year: 1979,
    nobelPrize: "Nobel Prize in Chemistry 2010 (Akira Suzuki)",
    description_fa:
      "واکنش جفت‌شدن متقاطع کربن-کربن بین آریل/وینیل هالیدها و ارگانوبورونیک اسیدها با کاتالیزور پالادیوم و در حضور یک باز مناسب.",
    description_en:
      "The palladium-catalyzed cross-coupling reaction between organoboron species and organic halides or pseudohalides to form biaryls and conjugated olefins.",
    scheme: "Ar-X + Ar'-B(OH)2  —[ Pd(0), Base ]→  Ar-Ar'",
    reactants: ["4-Bromoanisole", "Phenylboronic acid"],
    reagentsAndCatalyst: "Pd(PPh3)4 (5 mol%), K2CO3 (2.0 equiv)",
    product: "4-Methoxybiphenyl",
    conditions: "DMF/H2O (4:1), 80 °C, 6 h",
    mechanismSteps: [
      {
        fa: "افزایش اکسایشی آریل هالید به پالادیوم(0)",
        en: "Oxidative addition of aryl halide to Pd(0)",
      },
      {
        fa: "جابجایی متالاسیون توسط ترکیب بور با واسطه باز",
        en: "Base-mediated transmetalation with organoboron",
      },
      {
        fa: "حذف کاهشی و تشکیل پیوند C-C همراه با بازتولید پالادیوم(0)",
        en: "Reductive elimination affording coupled biaryl and regenerating Pd(0)",
      },
    ],
    abstractPromptText:
      "Palladium-catalyzed Suzuki-Miyaura cross-coupling: 4-bromoanisole (1.0 equiv) reacts with phenylboronic acid (1.2 equiv) in the presence of Pd(PPh3)4 (5 mol%) and K2CO3 (2.0 equiv) in DMF/H2O (4:1) at 80 °C for 6 h to afford 4-methoxybiphenyl in 92% yield.",
  },
  {
    id: "heck-reaction",
    name_en: "Mizoroki-Heck Reaction",
    name_fa: "واکنش میزوروکی-هک",
    category: "coupling",
    year: 1971,
    nobelPrize: "Nobel Prize in Chemistry 2010 (Richard F. Heck)",
    description_fa:
      "جفت‌شدن اولفین‌های فعال با آریل یا وینیل هالیدها با کاتالیزور پالادیوم جهت تولید اولفین‌های استخلاف‌شده با انتخاب‌پذیری فضاویژه بالا.",
    description_en:
      "The palladium-catalyzed coupling of aryl, benzyl, or vinyl halides with alkenes in the presence of a base to generate substituted alkenes.",
    scheme: "Ar-X + CH2=CH-R  —[ Pd(OAc)2, PPh3, Et3N ]→  Ar-CH=CH-R",
    reactants: ["Iodobenzene", "Methyl acrylate"],
    reagentsAndCatalyst: "Pd(OAc)2 (2 mol%), PPh3 (4 mol%), Et3N (1.5 equiv)",
    product: "Methyl (E)-cinnamate",
    conditions: "DMF, 100 °C, 12 h",
    mechanismSteps: [
      { fa: "افزایش اکسایشی آریل یدید به پالادیوم", en: "Oxidative addition of Ar-I to Pd(0)" },
      { fa: "افزایش سین به پیوند دوگانه اولفین", en: "Syn-migratory insertion into the alkene" },
      {
        fa: "بتا-هیدرید الیمیناسیون و خروج محصول ترانس",
        en: "Beta-hydride elimination to release (E)-alkene",
      },
    ],
    abstractPromptText:
      "Palladium-catalyzed Mizoroki-Heck cross-coupling: iodobenzene (1.0 equiv) couples with methyl acrylate (1.2 equiv) in the presence of Pd(OAc)2 (2 mol%), PPh3 (4 mol%), and triethylamine (1.5 equiv) in DMF at 100 °C for 12 h, affording methyl (E)-cinnamate in 89% yield with excellent stereoselectivity.",
  },
  {
    id: "diels-alder",
    name_en: "Diels-Alder [4+2] Cycloaddition",
    name_fa: "حلقه‌زایی دیلز-آلدر [4+2]",
    category: "addition",
    year: 1928,
    nobelPrize: "Nobel Prize in Chemistry 1950 (Otto Diels & Kurt Alder)",
    description_fa:
      "واکنش پری‌سیکلیک هماهنگ بین یک دی‌ان کونژوگه و یک دینوفیل برای ساخت حلقه‌های سیکلوهگزن با کنترل فضاویژه بالا (قانون اندو).",
    description_en:
      "A concerted pericyclic [4+2] cycloaddition between a conjugated diene and a dienophile, forming a substituted cyclohexene ring with stereospecific endo selectivity.",
    scheme: "1,3-Diene + Dienophile  —[ Heat / Lewis Acid ]→  Cyclohexene adduct",
    reactants: ["Cyclopentadiene", "Maleic anhydride"],
    reagentsAndCatalyst: "Thermal or Lewis Acid (AlCl3 10 mol%)",
    product: "cis-Norbornene-5,6-endo-dicarboxylic anhydride",
    conditions: "Dichloromethane / Toluene, 25 °C, 2 h",
    mechanismSteps: [
      {
        fa: "برهمکنش اوربیتال‌های مرزی HOMO دی‌ان و LUMO دینوفیل",
        en: "Frontier orbital interaction: Diene HOMO + Dienophile LUMO",
      },
      {
        fa: "حالت گذار ۶ عضوی معطر آروماتیک پایدار",
        en: "Concerted 6-membered aromatic transition state",
      },
      {
        fa: "پایدارسازی ثانویه اربیتالی منجر به انتخاب فضاویژه اندو",
        en: "Secondary orbital overlap directing stereoselective endo addition",
      },
    ],
    abstractPromptText:
      "Diels-Alder [4+2] cycloaddition: freshly cracked cyclopentadiene (1.2 equiv) reacts smoothly with maleic anhydride (1.0 equiv) in dichloromethane at room temperature (25 °C) for 2 h to afford cis-norbornene-5,6-endo-dicarboxylic anhydride as pure white crystals in 95% yield.",
  },
  {
    id: "click-chemistry",
    name_en: "CuAAC Click Chemistry (Azide-Alkyne Cycloaddition)",
    name_fa: "شیمی کلیک (سیکلوادیشن آزید-آلکین کاتالیز شده با مس)",
    category: "addition",
    year: 2001,
    nobelPrize: "Nobel Prize in Chemistry 2022 (K. Barry Sharpless & Morten Meldal)",
    description_fa:
      "واکنش فوق‌العاده با بازده بالا و زیست‌سازگار بین آزیدها و آلکین‌های انتهایی برای تشکیل اختصاصی حلقه‌های ۱،۴-دی‌استخلاف تریازول.",
    description_en:
      "Copper(I)-catalyzed azide-alkyne cycloaddition (CuAAC) yielding 1,4-disubstituted 1,2,3-triazoles with near-quantitative conversions under mild aqueous conditions.",
    scheme: "R-N3 + R'-C≡CH  —[ Cu(I), Sodium ascorbate ]→  1,4-Triazole",
    reactants: ["Benzyl azide", "Phenylacetylene"],
    reagentsAndCatalyst: "CuSO4·5H2O (5 mol%), Sodium ascorbate (15 mol%)",
    product: "1-Benzyl-4-phenyl-1H-1,2,3-triazole",
    conditions: "t-BuOH/H2O (1:1), 25 °C, 4 h",
    mechanismSteps: [
      {
        fa: "احیای درجا مس(II) به مس(I) توسط سدیم آسکوربات",
        en: "In situ reduction of Cu(II) to active Cu(I) by ascorbate",
      },
      {
        fa: "تشکیل کمپلکس مس-استیلید دوهسته‌ای",
        en: "Formation of dinuclear copper-acetylide complex",
      },
      {
        fa: "حلقه‌زایی با آزید و تولید تریازول ۱،۴ اختصاصی",
        en: "Cycloaddition with organoazide delivering strictly 1,4-regioisomer",
      },
    ],
    abstractPromptText:
      "Copper-catalyzed azide-alkyne cycloaddition (CuAAC Click reaction): benzyl azide (1.0 equiv) and phenylacetylene (1.0 equiv) react in the presence of CuSO4·5H2O (5 mol%) and sodium ascorbate (15 mol%) in t-BuOH/H2O (1:1) at 25 °C for 4 h, providing 1-benzyl-4-phenyl-1H-1,2,3-triazole in 96% yield.",
  },
  {
    id: "friedel-crafts-acylation",
    name_en: "Friedel-Crafts Acylation",
    name_fa: "آسیلاسیون فریدل-کرافتس",
    category: "substitution",
    year: 1877,
    description_fa:
      "جانشینی الکترون‌دوستی آروماتیک بر روی حلقه‌های آرن با آسیل کلریدها در حضور اسید لوئیس جهت سنتز آریل کتون‌ها بدون بازآرایی کربوکاتیونی.",
    description_en:
      "Electrophilic aromatic substitution of arenes with acyl chlorides or anhydrides in the presence of a Lewis acid to produce aryl ketones cleanly without polyalkylation.",
    scheme: "Ar-H + R-CO-Cl  —[ AlCl3 ]→  Ar-CO-R + HCl",
    reactants: ["Anisole", "Acetyl chloride"],
    reagentsAndCatalyst: "AlCl3 (1.1 equiv)",
    product: "4-Methoxyacetophenone",
    conditions: "DCM, 0 °C to room temperature, 3 h",
    mechanismSteps: [
      {
        fa: "تولید یون استخلاف الکترون‌دوست آسیلیوم (R-C≡O+)",
        en: "Generation of resonance-stabilized acylium ion (R-C≡O+)",
      },
      {
        fa: "حمله الکترون‌دوست حلقه آروماتیک و تشکیل کمپلکس آرنیوم (سیگما)",
        en: "Electrophilic attack by arene generating arenium sigma complex",
      },
      {
        fa: "آروماتیک شدن مجدد با حذف پروتون و آزاد شدن HCl",
        en: "Deprotonation restoring aromaticity to afford aryl ketone",
      },
    ],
    abstractPromptText:
      "Friedel-Crafts acylation of anisole: anisole (1.0 equiv) reacts with acetyl chloride (1.1 equiv) in the presence of anhydrous AlCl3 (1.1 equiv) in dry dichloromethane at 0 °C to room temperature for 3 h, affording 4-methoxyacetophenone regioselectively in 91% yield.",
  },
  {
    id: "grignard-reaction",
    name_en: "Grignard Reaction",
    name_fa: "واکنش گرینیارد",
    category: "addition",
    year: 1900,
    nobelPrize: "Nobel Prize in Chemistry 1912 (Victor Grignard)",
    description_fa:
      "افزایش هسته‌دوستی ترکیبات ارگانومنزیم (معرف گرینیارد) به ترکیبات کربونیل (آلدهید، کتون، استر) برای ساخت الکل‌های مرتبه اول، دوم و سوم.",
    description_en:
      "The organomagnesium (Grignard reagent) nucleophilic addition to aldehydes, ketones, or esters, furnishing primary, secondary, and tertiary alcohols with new C-C bonds.",
    scheme: "R-MgX + R'-CO-R''  —[ Dry THF / Et2O ]→  R'-C(OH)(R)(R'')",
    reactants: ["Phenylmagnesium bromide", "Benzaldehyde"],
    reagentsAndCatalyst: "Dry diethyl ether / THF, then mild acid quench (NH4Cl)",
    product: "Diphenylmethanol (Benzhydrol)",
    conditions: "0 °C to 25 °C, anhydrous N2 atmosphere, 2 h",
    mechanismSteps: [
      {
        fa: "حمله کربن هسته‌دوست با بار جزئی منفی گرینیارد به کربن کربونیل",
        en: "Nucleophilic addition of nucleophilic carbon to electrophilic carbonyl",
      },
      {
        fa: "تشکیل منیزیم آلکوکسید واسطه در شبکه اتر خشک",
        en: "Formation of cyclic magnesium alkoxide intermediate",
      },
      {
        fa: "خنثی‌سازی اسیدی ملایم و تولید الکل ثانویه خالص",
        en: "Aqueous acidic workup releasing pure alcohol product",
      },
    ],
    abstractPromptText:
      "Grignard nucleophilic addition: phenylmagnesium bromide (1.0 M in THF, 1.1 equiv) is added dropwise to benzaldehyde (1.0 equiv) in anhydrous THF at 0 °C under nitrogen, followed by saturated NH4Cl quenching to afford diphenylmethanol in 94% yield.",
  },
  {
    id: "wittig-reaction",
    name_en: "Wittig Olefination",
    name_fa: "اولفیناسیون ویتیگ",
    category: "carbonyl",
    year: 1954,
    nobelPrize: "Nobel Prize in Chemistry 1979 (Georg Wittig)",
    description_fa:
      "تبدیل مستقیم و گزینش‌پذیر پیوند دوگانه کربونیل (C=O) در آلدهیدها و کتون‌ها به پیوند دوگانه کربن-کربن (C=C) با استفاده از فسفر ایلویدها.",
    description_en:
      "The coupling of aldehydes or ketones with phosphonium ylides (phosphoranes) to convert C=O bonds into C=C alkenes with predictable double-bond regiochemistry.",
    scheme: "R2C=O + Ph3P=CH-R'  —[ THF ]→  R2C=CH-R' + Ph3P=O",
    reactants: ["Benzaldehyde", "Methyltriphenylphosphonium bromide"],
    reagentsAndCatalyst: "n-BuLi or NaHMDS (1.1 equiv)",
    product: "Styrene",
    conditions: "Dry THF, -78 °C to 25 °C, 4 h",
    mechanismSteps: [
      {
        fa: "برهمکنش [2+2] ایلوید فسفر با گروه کربونیل",
        en: "[2+2] cycloaddition between phosphonium ylide and carbonyl",
      },
      {
        fa: "تشکیل حلقه چهارعضوی اکسافسفتان",
        en: "Formation of four-membered oxaphosphetane intermediate",
      },
      {
        fa: "شکست هماهنگ حلقه با نیروی محرکه تشکیل پیوند فوق‌العاده قوی P=O",
        en: "Spontaneous cycloreversion driven by thermodynamic stability of P=O bond",
      },
    ],
    abstractPromptText:
      "Wittig olefination: benzaldehyde (1.0 equiv) reacts with the ylide generated from methyltriphenylphosphonium bromide and n-BuLi (1.1 equiv) in dry THF at 0 °C for 3 h, delivering styrene in 88% yield alongside triphenylphosphine oxide byproduct.",
  },
  {
    id: "aldol-condensation",
    name_en: "Asymmetric Aldol Condensation",
    name_fa: "تراکم آلدول نامتقارن",
    category: "carbonyl",
    year: 1872,
    description_fa:
      "اتصال هسته‌دوستی انولات یا انول به ترکیب کربونیل دیگر برای ساخت ترکیبات بتا-هیدروکسی کربونیل یا آلکن‌های کونژوگه انون با کاتالیزورهای آلی (اورگانوکاتالیز).",
    description_en:
      "The organocatalytic or base-mediated coupling of enolizable carbonyl compounds with aldehydes to synthesize beta-hydroxy carbonyls or alpha,beta-unsaturated systems.",
    scheme: "R-CH2-CHO + R'-CHO  —[ Organocatalyst / Base ]→  Beta-hydroxy aldehyde / Enone",
    reactants: ["Cyclohexanone", "4-Nitrobenzaldehyde"],
    reagentsAndCatalyst: "L-Proline (20 mol%)",
    product: "(2S,1'R)-2-(hydroxy(4-nitrophenyl)methyl)cyclohexan-1-one",
    conditions: "DMSO, 25 °C, 24 h",
    mechanismSteps: [
      {
        fa: "تشکیل انامین کایرال با پیوند هیدروژنی سازمان‌یافته با پرولین",
        en: "Formation of organized chiral enamine with L-proline",
      },
      {
        fa: "حمله فضابرگزین صورت Si/Re به آلدهید الکترون‌دوست",
        en: "Facial-selective attack on electrophilic aldehyde via Zimmerman-Traxler model",
      },
      {
        fa: "هیدرولیز و بازتولید کاتالیزور با بازدهی بالا و درصد انانتیومری بیش از ۹۵٪",
        en: "Catalytic cycle turnover yielding enantiopure aldol adduct (96% ee)",
      },
    ],
    abstractPromptText:
      "Asymmetric direct aldol reaction: cyclohexanone (5.0 equiv) and 4-nitrobenzaldehyde (1.0 equiv) react in the presence of 20 mol% L-proline organocatalyst in DMSO at 25 °C for 24 h to produce (2S,1'R)-2-(hydroxy(4-nitrophenyl)methyl)cyclohexan-1-one in 88% yield and 96% enantiomeric excess (ee).",
  },
  {
    id: "buchwald-hartwig",
    name_en: "Buchwald-Hartwig Amination",
    name_fa: "آمیناسیون باخوالد-هارتویگ",
    category: "coupling",
    year: 1994,
    description_fa:
      "پیوند متقاطع مستقیم کربن-نیتروژن (C-N) بین آریل هالیدها و آمین‌های اولیه یا ثانویه با کاتالیزور پالادیوم و لیگاند‌های حجیم فسفینی.",
    description_en:
      "The palladium-catalyzed cross-coupling of aryl halides with primary or secondary amines to construct aryl amines (anilines), essential for pharmaceutical discovery.",
    scheme: "Ar-X + H-NR2  —[ Pd(0), Phosphine Ligand, Base ]→  Ar-NR2",
    reactants: ["Bromobenzene", "Morpholine"],
    reagentsAndCatalyst: "Pd2(dba)3 (2 mol%), RuPhos (4 mol%), NaOtBu (1.4 equiv)",
    product: "4-Phenylmorpholine",
    conditions: "Toluene, 90 °C, 8 h",
    mechanismSteps: [
      {
        fa: "افزایش اکسایشی آریل برمید به کمپلکس پالادیوم-روفس",
        en: "Oxidative addition of Ar-Br to active Pd(0)-RuPhos",
      },
      {
        fa: "هماهنگی آمین و دپروتونه شدن با باز قوی سدیم ترت-بوتوکسید",
        en: "Amine coordination and deprotonation by strong base NaOtBu",
      },
      {
        fa: "حذف کاهشی سریع برای تشکیل پیوند پایدار C-N آروماتیک",
        en: "Reductive elimination to forge pharmaceutical-grade aryl amine",
      },
    ],
    abstractPromptText:
      "Buchwald-Hartwig amination: bromobenzene (1.0 equiv) couples with morpholine (1.2 equiv) in the presence of Pd2(dba)3 (2 mol%), RuPhos (4 mol%), and sodium tert-butoxide (1.4 equiv) in toluene at 90 °C for 8 h, affording 4-phenylmorpholine in 93% yield.",
  },
];
