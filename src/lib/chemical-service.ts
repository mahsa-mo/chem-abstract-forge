export type ChemicalCompoundData = {
  name_en: string;
  name_fa: string;
  iupac: string;
  formula: string;
  mw: number;
  smiles: string;
  cas?: string;
  logp?: number;
  tpsa?: number;
  h_donors?: number;
  h_acceptors?: number;
  description_fa: string;
  description_en: string;
  safety?: string[];
  uses?: string[];
  imageUrl?: string;
};

// Common fast-cache dictionary for instant responses
export const COMMON_COMPOUNDS: Record<string, ChemicalCompoundData> = {
  aspirin: {
    name_en: "Aspirin",
    name_fa: "آسپرین (استیل‌سالیسیلیک اسید)",
    iupac: "2-acetoxybenzoic acid",
    formula: "C9H8O4",
    mw: 180.16,
    smiles: "CC(=O)Oc1ccccc1C(=O)O",
    cas: "50-78-2",
    logp: 1.19,
    tpsa: 63.6,
    h_donors: 1,
    h_acceptors: 4,
    description_fa:
      "آسپرین یا استیل‌سالیسیلیک اسید داروی مسکن، ضدالتهاب غیراستروئیدی (NSAID) و ضدپلاکت خون است که از استیلاسیون اسید سالیسیلیک تهیه می‌شود.",
    description_en:
      "Aspirin (acetylsalicylic acid) is a widely used analgesic, antipyretic, and nonsteroidal anti-inflammatory drug (NSAID) that inhibits COX-1 and COX-2 enzymes.",
    safety: ["GHS07 (تحریک‌کننده / مضر)", "GHS08 (هشدار سلامتی)"],
    uses: ["مسکن و ضدالتهاب", "پیشگیری از ترومبوز و حمله قلبی", "سنتز دارویی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/aspirin/image",
  },
  caffeine: {
    name_en: "Caffeine",
    name_fa: "کافئین",
    iupac: "1,3,7-trimethylxanthine",
    formula: "C8H10N4O2",
    mw: 194.19,
    smiles: "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
    cas: "58-08-2",
    logp: -0.07,
    tpsa: 58.4,
    h_donors: 0,
    h_acceptors: 3,
    description_fa:
      "کافئین یک آلکالوئید پورینی با اثر محرک سیستم عصبی مرکزی است که به طور طبیعی در دانه قهوه، برگ چای و کاکائو یافت می‌شود.",
    description_en:
      "Caffeine is a methylxanthine alkaloid and central nervous system stimulant acting as an antagonist at adenosine receptors.",
    safety: ["GHS07 (مضر در بلع)"],
    uses: ["محرک سیستم عصبی مرکزی", "افزودنی در داروها و نوشیدنی‌ها", "مطالعات فارماکولوژی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/caffeine/image",
  },
  paracetamol: {
    name_en: "Paracetamol (Acetaminophen)",
    name_fa: "استامینوفن (پاراستامول)",
    iupac: "N-(4-hydroxyphenyl)acetamide",
    formula: "C8H9NO2",
    mw: 151.16,
    smiles: "CC(=O)Nc1ccc(O)cc1",
    cas: "103-90-2",
    logp: 0.46,
    tpsa: 49.3,
    h_donors: 2,
    h_acceptors: 2,
    description_fa:
      "استامینوفن داروی ضد درد و تب‌بر پرمصرف است که از استیلاسیون ۴-آمینوفنول در آزمایشگاه‌های سنتز آلی به دست می‌آید.",
    description_en:
      "Paracetamol (acetaminophen) is a prominent analgesic and antipyretic agent synthesized via acetylation of 4-aminophenol.",
    safety: ["GHS07 (تحریک پوستی و گوارشی)"],
    uses: ["تسکین دردهای خفیف تا متوسط", "کاهش تب", "پیش‌ماده در سنتز دارویی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/paracetamol/image",
  },
  ibuprofen: {
    name_en: "Ibuprofen",
    name_fa: "ایبوپروفن",
    iupac: "(2RS)-2-[4-(2-methylpropyl)phenyl]propanoic acid",
    formula: "C13H18O2",
    mw: 206.28,
    smiles: "CC(C)Cc1ccc(C(C)C(=O)O)cc1",
    cas: "15687-27-1",
    logp: 3.5,
    tpsa: 37.3,
    h_donors: 1,
    h_acceptors: 2,
    description_fa:
      "ایبوپروفن از شاخص‌ترین داروهای ضدالتهاب غیراستروئیدی است که نمونه کلاسیک شیمی سنتز سبز به شمار می‌رود.",
    description_en:
      "Ibuprofen is a widely studied nonsteroidal anti-inflammatory drug and a textbook benchmark for atom-economy green synthesis.",
    safety: ["GHS07 (مضر)"],
    uses: ["ضدالتهاب و مسکن", "سنتز سبز و کاتالیزوری"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/ibuprofen/image",
  },
  ferrocene: {
    name_en: "Ferrocene",
    name_fa: "فروسن",
    iupac: "bis(eta5-cyclopentadienyl)iron",
    formula: "C10H10Fe",
    mw: 186.03,
    smiles: "[Fe].[cH-]1cccc1.[cH-]1cccc1",
    cas: "102-54-5",
    logp: 2.66,
    tpsa: 0.0,
    h_donors: 0,
    h_acceptors: 0,
    description_fa:
      "فروسن ترکیب ساندویچی نمادین در شیمی آلی فلزی با ساختار متالوسن پایدار و آروماتیک است که کاربرد وسیعی در الکتروشیمی و کاتالیز دارد.",
    description_en:
      "Ferrocene is the prototypical metallocene sandwich complex, featuring extraordinary chemical and thermal stability with extensive applications in electrochemistry and catalysis.",
    safety: ["GHS07 (مضر)", "GHS09 (خطر برای محیط زیست)"],
    uses: ["استاندارد الکتروشیمی (پتانسیل ردوکس)", "لیگاند در کاتالیز", "افزودنی سوخت"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/ferrocene/image",
  },
  benzene: {
    name_en: "Benzene",
    name_fa: "بنزن",
    iupac: "benzene",
    formula: "C6H6",
    mw: 78.11,
    smiles: "c1ccccc1",
    cas: "71-43-2",
    logp: 2.13,
    tpsa: 0.0,
    h_donors: 0,
    h_acceptors: 0,
    description_fa:
      "بنزن ساده‌ترین هیدروکربن آروماتیک و بنیادی‌ترین بلوک ساختمانی در سنتز ترکیبات آلی، دارویی و پلیمری است.",
    description_en:
      "Benzene is the fundamental parent aromatic hydrocarbon, serving as the cornerstone building block in organic synthesis and industrial chemistry.",
    safety: ["GHS02 (اشتعال‌پذیر شدید)", "GHS08 (سرطان‌زا)", "GHS07"],
    uses: ["حلال غیرقطبی", "بلوک سازنده در سنتز دارویی و پلیمر"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/benzene/image",
  },
  benzoic_acid: {
    name_en: "Benzoic acid",
    name_fa: "بنزوئیک اسید",
    iupac: "benzoic acid",
    formula: "C7H6O2",
    mw: 122.12,
    smiles: "C1=CC=C(C=C1)C(=O)O",
    cas: "65-85-0",
    logp: 1.87,
    tpsa: 37.3,
    h_donors: 1,
    h_acceptors: 1,
    description_fa:
      "بنزوئیک اسید یک کربوکسیلیک اسید آروماتیک و نگهدارنده شاخص در صنایع غذایی و دارویی است.",
    description_en:
      "Benzoic acid is the simplest aromatic carboxylic acid, widely used as a food preservative and chemical intermediate.",
    safety: ["GHS05 (خورنده/تحریک)", "GHS07"],
    uses: ["نگهدارنده مواد غذایی", "سنتز پلاستیک‌کننده‌ها", "واسطه دارویی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/benzoic%20acid/image",
  },
  salicylic_acid: {
    name_en: "Salicylic acid",
    name_fa: "سالیسیلیک اسید",
    iupac: "2-hydroxybenzoic acid",
    formula: "C7H6O3",
    mw: 138.12,
    smiles: "c1ccc(c(c1)C(=O)O)O",
    cas: "69-72-7",
    logp: 2.26,
    tpsa: 57.5,
    h_donors: 2,
    h_acceptors: 3,
    description_fa:
      "سالیسیلیک اسید یک بتاهیدروکسی اسید (BHA) است که به عنوان پیش‌ماده آسپرین و در محصولات درمان پوست استفاده می‌شود.",
    description_en:
      "Salicylic acid is a lipophilic monohydroxybenzoic acid, key precursor to aspirin and common dermatological keratolytic agent.",
    safety: ["GHS05", "GHS07"],
    uses: ["سنتز آسپرین", "محصولات پوستی و کراتولیتیک", "نگهدارنده"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/salicylic%20acid/image",
  },
  ethanol: {
    name_en: "Ethanol",
    name_fa: "اتانول",
    iupac: "ethanol",
    formula: "C2H6O",
    mw: 46.07,
    smiles: "CCO",
    cas: "64-17-5",
    logp: -0.31,
    tpsa: 20.23,
    h_donors: 1,
    h_acceptors: 1,
    description_fa:
      "اتانول یک الکل فرار، بی‌رنگ و قابل اشتعال است که به عنوان حلال صنعتی و ضدعفونی‌کننده کاربرد گسترده‌ای دارد.",
    description_en:
      "Ethanol is a volatile, flammable, colorless liquid that serves as a common solvent and antiseptic agent.",
    safety: ["GHS02 (اشتعال‌پذیر)", "GHS07 (تحریک چشمی)"],
    uses: ["حلال صنعتی", "ضدعفونی‌کننده", "سوخت زیستی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/CCO/image",
  },
  curcumin: {
    name_en: "Curcumin",
    name_fa: "کورکومین (زردچوبه)",
    iupac: "(1E,6E)-1,7-bis(4-hydroxy-3-methoxyphenyl)hepta-1,6-diene-3,5-dione",
    formula: "C21H20O6",
    mw: 368.38,
    smiles: "COc1cc(/C=C/C(=O)CC(=O)/C=C/c2ccc(O)c(OC)c2)ccc1O",
    cas: "458-37-7",
    logp: 3.2,
    tpsa: 93.1,
    h_donors: 2,
    h_acceptors: 6,
    description_fa:
      "کورکومین رنگدانه زرد طبیعی و پلی‌فنول فعال موجود در زردچوبه است که خواص آنتی‌اکسیدانی و ضدالتهابی قوی دارد.",
    description_en:
      "Curcumin is a bright yellow natural polyphenolic curcuminoid produced by turmeric plants with renowned antioxidant properties.",
    safety: ["GHS07"],
    uses: ["آنتی‌اکسیدان قوی", "تحقیقات بیوشیمی و درمان سرطان", "رنگ‌دهنده طبیعی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/curcumin/image",
  },
  glucose: {
    name_en: "D-Glucose",
    name_fa: "گلوکز (دکستروز)",
    iupac: "(2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal",
    formula: "C6H12O6",
    mw: 180.16,
    smiles: "C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O",
    cas: "50-99-7",
    logp: -3.24,
    tpsa: 110.0,
    h_donors: 5,
    h_acceptors: 6,
    description_fa:
      "گلوکز مهم‌ترین قند ساده مونوساکاریدی و منبع اصلی تأمین انرژی در متابولیسم سلول‌های زنده است.",
    description_en:
      "D-Glucose is the most ubiquitous monosaccharide in biology, serving as the primary source of cellular metabolic energy.",
    safety: ["ایمن (غیرسمی)"],
    uses: ["منبع انرژی زیستی", "محیط‌های کشت بیولوژیک", "صنایع دارویی و غذایی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/glucose/image",
  },
  acetone: {
    name_en: "Acetone",
    name_fa: "استون (پروپانون)",
    iupac: "propan-2-one",
    formula: "C3H6O",
    mw: 58.08,
    smiles: "CC(=O)C",
    cas: "67-64-1",
    logp: -0.24,
    tpsa: 17.1,
    h_donors: 0,
    h_acceptors: 1,
    description_fa:
      "استون ساده‌ترین کتون و حلالی قطبی و آپروتیک با کارایی بالا در شستشوی ظروف آزمایشگاهی و سنتز ترکیبات آلی است.",
    description_en:
      "Acetone is the simplest aliphatic ketone and an indispensable polar aprotic solvent in organic synthesis and cleaning.",
    safety: ["GHS02 (اشتعال‌پذیر شدید)", "GHS07 (تحریک چشمی)"],
    uses: ["حلال قطبی آزمایشگاهی", "سنتز متیل متاکریلات", "شستشوی شیشه‌آلات"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/acetone/image",
  },
  phenol: {
    name_en: "Phenol",
    name_fa: "فنول (هیدروکسی‌بنزن)",
    iupac: "phenol",
    formula: "C6H6O",
    mw: 94.11,
    smiles: "c1ccc(cc1)O",
    cas: "108-95-2",
    logp: 1.46,
    tpsa: 20.2,
    h_donors: 1,
    h_acceptors: 1,
    description_fa:
      "فنول ترکیبی آروماتیک با گروه هیدروکسیل متصل مستقیم به حلقه بنزن است که در سنتز رزین‌ها و داروها استفاده می‌شود.",
    description_en:
      "Phenol is the parent aromatic alcohol, fundamentally important in the industrial production of polycarbonates and phenolic resins.",
    safety: ["GHS06 (بسیار سمی)", "GHS05 (خورنده شدید)"],
    uses: ["تولید بیسفنول A و رزین فنولی", "سنتز سالیسیلیک اسید", "ضدعفونی‌کننده کلاسیک"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/phenol/image",
  },
  aniline: {
    name_en: "Aniline",
    name_fa: "آنیلین (آمینو‌بنزن)",
    iupac: "aniline",
    formula: "C6H7N",
    mw: 93.13,
    smiles: "c1ccc(cc1)N",
    cas: "62-53-3",
    logp: 0.9,
    tpsa: 26.0,
    h_donors: 1,
    h_acceptors: 1,
    description_fa:
      "آنیلین ساده‌ترین آمین آروماتیک و پیش‌ماده حیاتی در صنایع تولید رنگ‌های آزو، پلی‌اورتان‌ها و داروهای گروه سولفا است.",
    description_en:
      "Aniline is the prototypical aromatic amine and an essential precursor in polyurethane manufacturing, azo dyes, and pharmaceuticals.",
    safety: ["GHS06 (سمی شدید)", "GHS08 (خطر سلامتی)"],
    uses: ["تولید ایزوسیانات‌ها و پلی‌اورتان", "سنتز رنگ‌های آزو", "پیش‌ماده دارویی"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/aniline/image",
  },
  toluene: {
    name_en: "Toluene",
    name_fa: "تولوئن (متیل‌بنزن)",
    iupac: "toluene",
    formula: "C7H8",
    mw: 92.14,
    smiles: "Cc1ccccc1",
    cas: "108-88-3",
    logp: 2.73,
    tpsa: 0.0,
    h_donors: 0,
    h_acceptors: 0,
    description_fa:
      "تولوئن هیدروکربنی آروماتیک با یک استخلاف متیل است که به عنوان حلال صنعتی استاندارد و جانشین ایمن‌تر بنزن به کار می‌رود.",
    description_en:
      "Toluene is a mono-substituted benzene derivative commonly employed as an industrial solvent and precursor to polyurethane chemicals.",
    safety: ["GHS02 (اشتعال‌پذیر)", "GHS08 (خطر تنفسی)"],
    uses: ["حلال غیرقطبی در واکنش‌های رفلاکس", "پیش‌ساز بنزن و زایلن", "افزودنی سوخت"],
    imageUrl: "https://cactus.nci.nih.gov/chemical/structure/toluene/image",
  },
};

export async function lookupChemicalCompound(query: string): Promise<ChemicalCompoundData | null> {
  const cleanQuery = query.trim().toLowerCase();

  // 1. Check local fast-cache
  for (const [key, data] of Object.entries(COMMON_COMPOUNDS)) {
    if (
      cleanQuery === key ||
      cleanQuery.includes(key) ||
      data.name_en.toLowerCase().includes(cleanQuery) ||
      data.name_fa.includes(cleanQuery) ||
      data.formula.toLowerCase() === cleanQuery ||
      data.cas === cleanQuery
    ) {
      return data;
    }
  }

  // 2. Query Cactus NCI resolver directly if English or CAS/formula
  try {
    const encoded = encodeURIComponent(query.trim());
    const [smilesRes, formulaRes, mwRes] = await Promise.all([
      fetch(`https://cactus.nci.nih.gov/chemical/structure/${encoded}/smiles`),
      fetch(`https://cactus.nci.nih.gov/chemical/structure/${encoded}/formula`),
      fetch(`https://cactus.nci.nih.gov/chemical/structure/${encoded}/mw`),
    ]);

    if (smilesRes.ok && formulaRes.ok) {
      const smiles = (await smilesRes.text()).trim();
      const formula = (await formulaRes.text()).trim();
      const mwText = mwRes.ok ? (await mwRes.text()).trim() : "0";
      const mw = parseFloat(mwText) || 0;

      if (smiles && formula && !smiles.includes("<!DOCTYPE") && !smiles.includes("<html")) {
        return {
          name_en: query.trim(),
          name_fa: query.trim(),
          iupac: query.trim(),
          formula,
          mw,
          smiles,
          description_fa: `ترکیب شیمیایی ${query.trim()} با فرمول مولکولی ${formula} و وزن مولکولی ${mw} g/mol استخراج‌شده از پایگاه داده NCI NIH.`,
          description_en: `Chemical compound ${query.trim()} with molecular formula ${formula} and molecular weight ${mw} g/mol resolved via NCI NIH database.`,
          imageUrl: `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image`,
        };
      }
    }
  } catch {
    // continue to Gemini
  }

  // 3. Query Gemini for multilingual & complex parsing
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (!geminiKey) return null;

  const prompt = [
    "You are an authoritative chemical database engine (like PubChem/ChemSpider).",
    `Identify the chemical compound for input: "${query}" (which may be in Persian, English, CAS, formula, or SMILES).`,
    "Return STRICT JSON only matching this exact shape:",
    "{",
    '  "name_en": "Standard English Name",',
    '  "name_fa": "نام فارسی دقیق ترکیب",',
    '  "iupac": "Systematic IUPAC name",',
    '  "formula": "Hill system molecular formula e.g. C8H10N4O2",',
    '  "mw": numeric molecular weight in g/mol,',
    '  "smiles": "Valid canonical SMILES",',
    '  "cas": "CAS Registry Number e.g. 50-78-2",',
    '  "logp": numeric octanol-water partition coefficient,',
    '  "tpsa": numeric topological polar surface area in Å²,',
    '  "h_donors": integer hydrogen bond donor count,',
    '  "h_acceptors": integer hydrogen bond acceptor count,',
    '  "description_fa": "شرح جامع خواص، رده دارویی/شیمیایی و کاربردها به فارسی (۲ تا ۳ جمله)",',
    '  "description_en": "Concise scientific description in English (2 sentences)",',
    '  "safety": ["GHS02", "GHS07"],',
    '  "uses": ["Application 1", "Application 2"]',
    "}",
    "Return plain text JSON only, no markdown ticks.",
  ].join("\n");

  const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 },
          }),
        },
      );

      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        let rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const firstBrace = rawText.indexOf("{");
          const lastBrace = rawText.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            rawText = rawText.substring(firstBrace, lastBrace + 1);
          } else {
            rawText = rawText
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();
          }
          const parsed = JSON.parse(rawText) as ChemicalCompoundData;
          if (typeof parsed.mw === "string") parsed.mw = parseFloat(parsed.mw) || 0;
          if (typeof parsed.logp === "string") parsed.logp = parseFloat(parsed.logp) || 0;
          if (typeof parsed.tpsa === "string") parsed.tpsa = parseFloat(parsed.tpsa) || 0;
          parsed.imageUrl = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(
            parsed.smiles || parsed.name_en,
          )}/image`;
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[chemical-service] ${model} failed:`, err);
    }
  }

  return null;
}
