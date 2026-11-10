import fs from "node:fs";
import path from "node:path";
import {
  JOURNAL_STANDARDS,
  COLOR_SCHEMES,
  type JournalId,
  type ColorSchemeId,
} from "./journal-standards";
import { parseAndAuditReaction } from "./reaction-parser";

export interface DetectedApparatus {
  en: string;
  fa: string;
}

/**
 * Detects if the user's text explicitly mentions laboratory equipment,
 * glassware, reactors, or vessels in either Persian or English.
 */
export function detectMentionedApparatus(text: string): DetectedApparatus[] {
  const lower = text.toLowerCase();
  const apparatusTerms: { en: string; fa: string; keywords: string[] }[] = [
    { en: "Beaker", fa: "بشر", keywords: ["بشر", "beaker"] },
    {
      en: "Erlenmeyer flask",
      fa: "ارلن / ارلن‌مایر",
      keywords: ["ارلن", "erlenmeyer", "conical flask"],
    },
    {
      en: "Round-bottom flask",
      fa: "بالن ته‌گرد / بالن",
      keywords: ["بالن", "round-bottom", "florence flask"],
    },
    { en: "Test tube", fa: "لوله آزمایش", keywords: ["لوله آزمایش", "test tube"] },
    {
      en: "Reflux condenser",
      fa: "مبرد / کندانسور",
      keywords: ["مبرد", "کندانسور", "condenser", "reflux setup"],
    },
    {
      en: "Autoclave / hydrothermal vessel",
      fa: "اتوکلاو / هیدروترمال",
      keywords: ["اتوکلاو", "autoclave", "hydrothermal"],
    },
    {
      en: "Chemical reactor",
      fa: "رآکتور شیمیایی",
      keywords: ["رآکتور", "راکتور", "chemical reactor", "batch reactor"],
    },
    {
      en: "Bioreactor / fermenter",
      fa: "بیوراکتور / فرمنتر",
      keywords: ["بیوراکتور", "bioreactor", "fermenter"],
    },
    {
      en: "Electrochemical cell / electrodes",
      fa: "سل الکتروشیمیایی / الکترود",
      keywords: ["سل الکترو", "سلول الکترو", "electrochemical cell", "electrode"],
    },
    {
      en: "Chromatography column",
      fa: "ستون کروماتوگرافی",
      keywords: ["ستون کروماتوگرافی", "column", "chromatography"],
    },
    {
      en: "Magnetic stirrer / hotplate",
      fa: "همزن مغناطیسی / هیتر",
      keywords: ["همزن", "استیرر", "magnetic stirrer", "hotplate"],
    },
    { en: "Centrifuge", fa: "سانتریفیوژ", keywords: ["سانتریفیوژ", "centrifuge"] },
    {
      en: "Microscope (SEM/TEM/AFM)",
      fa: "میکروسکوپ الکترونی",
      keywords: ["میکروسکوپ", "microscope", "tem", "sem", "afm"],
    },
  ];

  const found: DetectedApparatus[] = [];
  for (const item of apparatusTerms) {
    if (item.keywords.some((k) => lower.includes(k))) {
      found.push({ en: item.en, fa: item.fa });
    }
  }
  return found;
}

/**
 * Builds a local scene description from the parsed chemical text.
 * Strictly guarantees 1:1 fidelity with user text:
 * - If apparatus was described, it includes it.
 * - If apparatus was NOT described, it excludes random unmentioned glassware.
 */
export async function buildLocalFallbackDescription(
  text: string,
  journalId: JournalId = "acs",
): Promise<string> {
  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const audit = await parseAndAuditReaction(text);
  const apparatus = detectMentionedApparatus(text);

  const reactantsStr =
    audit.reactants.map((r) => `${r.name} (${r.formula})`).join(" + ") || "Starting materials";
  const catalystsStr =
    audit.catalysts.map((c) => c.name).join(", ") ||
    (audit.conditions.light ? `hν (${audit.conditions.light})` : "catalytic system");
  const conditionsStr = [
    audit.conditions.solvent,
    audit.conditions.temperature,
    audit.conditions.time,
  ]
    .filter(Boolean)
    .join(", ");
  const productsStr =
    audit.products.map((p) => `${p.name} (${p.formula})`).join(" and ") || "Target product";

  const apparatusClause =
    apparatus.length > 0 ? ` carried out using ${apparatus.map((a) => a.en).join(" and ")}` : "";
  const fidelityDirective =
    apparatus.length > 0
      ? `Accurately include the described apparatus (${apparatus.map((a) => a.en).join(", ")}) as specified.`
      : `Focus strictly on the described chemical and process components with no unmentioned decorative glassware.`;

  return `2D scientific graphical abstract scheme in ${standard.name} journal style: ${reactantsStr} converts to ${productsStr}${apparatusClause}. Reaction arrow annotated with ${catalystsStr}${conditionsStr ? ` in ${conditionsStr}` : ""}. Crisp 2D molecular structures, IUPAC chemical notation, and reaction yield annotations on pure white background #ffffff. ${fidelityDirective}`;
}

/**
 * Step 1 — Analyze the user's chemistry/scientific text (in Persian or English)
 * and convert it into a highly detailed, faithful visual scene description.
 *
 * Strict 1:1 fidelity rule:
 * - Depicts EXACTLY what the user described.
 * - Includes glassware/apparatus IF AND ONLY IF explicitly mentioned in the text.
 */
function getGeminiApiKey(): string | undefined {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim().length > 10) {
    return envKey.trim();
  }
  try {
    const cwd = typeof process !== "undefined" && process.cwd ? process.cwd() : ".";
    const envPath = path.resolve(cwd, ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const match = line.match(/^GEMINI_API_KEY=(.+)$/);
        if (match && match[1] && match[1].trim() !== "MY_GEMINI_API_KEY") {
          const key = match[1].trim();
          if (typeof process !== "undefined" && process.env) {
            process.env["GEMINI_API_KEY"] = key;
          }
          return key;
        }
      }
    }
  } catch (err) {
    console.warn("[abstract-prompt] Could not read .env file:", err);
  }
  return envKey;
}

export async function buildStructuredSceneDescription(
  text: string,
  journalId: JournalId = "acs",
  colorSchemeId: ColorSchemeId = "academic-clean",
): Promise<string> {
  const geminiKey = getGeminiApiKey();
  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const colorScheme = COLOR_SCHEMES[colorSchemeId] ?? COLOR_SCHEMES["academic-clean"];
  const apparatus = detectMentionedApparatus(text);

  if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
    return await buildLocalFallbackDescription(text, journalId);
  }

  // Tested working models list in order of availability and speed
  const models = [
    "gemini-3.8-flash",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  const apparatusRulePrompt =
    apparatus.length > 0
      ? `The user's text explicitly mentions laboratory equipment: ${apparatus.map((a) => a.en).join(", ")}. You MUST faithfully depict these specific apparatus elements in the visual scheme.`
      : `The user's text DOES NOT mention glassware or apparatus. DO NOT add random beakers, Erlenmeyer flasks, test tubes, or decorative lab items. Only illustrate the described molecules, mechanisms, materials, and reaction flow.`;

  const instruction = [
    `You are an expert scientific illustrator and academic journal Graphical Abstract / TOC graphic designer specializing in ${standard.fullName} guidelines.`,
    "Read the user's scientific/chemical text below (which may be in Persian, English, or another language).",
    "Your goal is to write a laser-focused, accurate visual prompt in English (65 to 110 words) that translates EXACTLY what the user described into a publication diagram.",
    "",
    "CRITICAL USER REQUIREMENT — STRICT 1:1 FIDELITY TO USER TEXT (NO RANDOM ADDITIONS, NO OMISSIONS):",
    "1. Every single element in the visual prompt MUST trace directly back to a concept, molecule, material, or apparatus explicitly described in the user's text.",
    `2. APPARATUS & GLASSWARE FIDELITY: ${apparatusRulePrompt}`,
    "3. Accurate chemical structures: describe explicit IUPAC chemical groups, ring systems, stereochemistry, coordination complexes, or nanomaterials clearly.",
    "4. Start the prompt immediately with the exact subject and process from the text.",
    "5. Background must be pure white (#FFFFFF) with zero ambient tint, no borders, no dark frames.",
    "6. Target layout: publication schematic in " +
      standard.fullName +
      " (" +
      standard.aspectRatio +
      " aspect ratio).",
    "7. Palette guidance: " + colorScheme.promptModifier,
    "8. Output ONLY the single English prompt paragraph without markdown, bullet points, or introductory commentary.",
    "",
    "USER TEXT:",
    text,
  ].join("\n");

  for (const model of models) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 6500);
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: instruction }] }],
          generationConfig: {
            temperature: 0.15,
          },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const parts = json.candidates?.[0]?.content?.parts ?? [];
      const description = parts
        .map((p) => p.text ?? "")
        .join("")
        .trim();

      if (description && description.length > 30) {
        console.log(
          `[abstract-prompt] Generated scene from ${model} for ${standard.name}:\n`,
          description,
        );
        return description;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[abstract-prompt] ${model} error:`, err instanceof Error ? err.message : err);
    }
  }

  // Smart fallback preserving the user's exact chemicals and reaction
  console.log(
    `[abstract-prompt] Using local intelligent fallback preserving user text for ${standard.name}`,
  );
  return await buildLocalFallbackDescription(text, journalId);
}

/**
 * Formats the final prompt for the image generation model.
 * Enforces strict semantic fidelity:
 * - If apparatus was mentioned, requires accurate depiction of that apparatus.
 * - If not mentioned, forbids unmentioned decorative glassware.
 */
export function buildAbstractPrompt(
  sceneDescription: string,
  userText: string = "",
  journalId: JournalId = "acs",
  colorSchemeId: ColorSchemeId = "academic-clean",
): string {
  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const colorScheme = COLOR_SCHEMES[colorSchemeId] ?? COLOR_SCHEMES["academic-clean"];
  const apparatus = detectMentionedApparatus(userText || sceneDescription);

  const apparatusRule =
    apparatus.length > 0
      ? `Faithfully illustrate the described experimental apparatus (${apparatus.map((a) => a.en).join(", ")}) as specified in the text.`
      : `Strict semantic fidelity: no unmentioned random decorative glassware or flasks; focus purely on the described chemical and process components.`;

  return `2D scientific graphical abstract scheme on pure white background (#ffffff): ${sceneDescription}. ${apparatusRule} Crisp IUPAC chemical structures, clean vector arrows, publication-ready journal TOC graphic in ${standard.name} style (${standard.aspectRatio} aspect ratio). ${colorScheme.promptModifier}`;
}
