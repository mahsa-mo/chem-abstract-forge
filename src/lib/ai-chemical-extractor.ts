/**
 * AI-Powered Chemical Semantic Extractor (Universal Reaction Intelligence)
 *
 * Uses Gemini API (@google/genai) to understand ANY scientific, chemical,
 * or pharmacological text in any language (English, Persian, etc.) without
 * relying on brittle hardcoded if/else statements.
 *
 * Automatically resolves verified chemical structures (SMILES) and integrates
 * with PubChem REST API for complete 1:1 text-to-graphics fidelity.
 */

import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI, Type } from "@google/genai";
import { lookupPubChemUniversal } from "./pubchem-service";

export interface ExtractedChemicalEntity {
  name: string;
  nameFa?: string | undefined;
  formula: string;
  smiles?: string | undefined;
  mw?: number | undefined;
  equiv?: number | undefined;
  yieldPercent?: number | undefined;
  role: "reactant" | "catalyst" | "reagent" | "product" | "byproduct";
  description?: string | undefined;
}

export interface ExtractedBiologicalContext {
  organism?: string | undefined;
  organismFa?: string | undefined;
  environment?: string | undefined;
  environmentFa?: string | undefined;
  details?: string | undefined;
  detailsFa?: string | undefined;
}

export interface ExtractedDiffusingGas {
  name: string;
  nameFa?: string | undefined;
  formula: string;
  smiles?: string | undefined;
  mw?: number | undefined;
  volumeOrConcentration?: string | undefined;
  role?: string | undefined;
}

export interface ExtractedTargetMatrix {
  name: string;
  nameFa?: string | undefined;
  formula?: string | undefined;
  architecture?: string | undefined;
  details?: string | undefined;
  detailsFa?: string | undefined;
}

export interface ExtractedProcessDynamics {
  motion: string;
  motionFa?: string | undefined;
  mechanism?: string | undefined;
  fluxOrRate?: string | undefined;
}

export interface ExtractedReactionCascade {
  title: string;
  titleFa?: string | undefined;
  category: string;
  domain:
    | "organic-synthesis"
    | "enzyme-pathway"
    | "pharmacology"
    | "catalytic-cycle"
    | "nanomaterials"
    | "environmental-transport"
    | "bio-environmental"
    | "macromolecular"
    | "general-chemistry";
  summary: string;
  summaryFa?: string | undefined;
  reactants: ExtractedChemicalEntity[];
  catalysts: ExtractedChemicalEntity[];
  reagents: ExtractedChemicalEntity[];
  products: ExtractedChemicalEntity[];
  byproducts: ExtractedChemicalEntity[];
  biologicalContext?: ExtractedBiologicalContext | undefined;
  diffusingGas?: ExtractedDiffusingGas | undefined;
  targetMatrix?: ExtractedTargetMatrix | undefined;
  dynamics?: ExtractedProcessDynamics | undefined;
  conditions: {
    solvent?: string | undefined;
    temperature?: string | undefined;
    time?: string | undefined;
    light?: string | undefined;
    atmosphere?: string | undefined;
    pressure?: string | undefined;
  };
  keyFindings: string[];
  keyFindingsFa?: string[] | undefined;
  visualArchitecture?:
    | "environmental-transport"
    | "dual-track-pathway"
    | "reaction-cascade"
    | "catalytic-loop"
    | "nanomaterial-process"
    | "macromolecule-interaction"
    | "general-conversion"
    | undefined;
  divergentTracks?:
    | {
        track1: {
          name: string;
          nameFa?: string | undefined;
          enzymeOrPath: string;
          targetOrTissue: string;
          normalFunction: string;
          drugImpact: string;
          clinicalOutcome: string;
          isAdverse: boolean;
        };
        track2: {
          name: string;
          nameFa?: string | undefined;
          enzymeOrPath: string;
          targetOrTissue: string;
          normalFunction: string;
          drugImpact: string;
          clinicalOutcome: string;
          isAdverse: boolean;
        };
      }
    | undefined;
  selectiveAgent?:
    | {
        name: string;
        nameFa?: string | undefined;
        smiles?: string | undefined;
        formula?: string | undefined;
        mw?: number | undefined;
        selectivityRationale?: string | undefined;
        selectivityRationaleFa?: string | undefined;
      }
    | undefined;
  mechanisticCallout?:
    | {
        label: string;
        detail: string;
        labelFa?: string | undefined;
        detailFa?: string | undefined;
      }
    | undefined;
}

const MODELS_PRIORITY = [
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-4-argon",
];

const extractionCache = new Map<string, { res: ExtractedReactionCascade; exp: number }>();

function getGeminiApiKey(): string | undefined {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim().length > 10) {
    return envKey.trim();
  }
  const searchPaths = [
    ".env",
    "/app/applet/.env",
    "/app/applet/app/applet/.env",
    path.resolve(process.cwd(), ".env"),
  ];
  for (const envPath of searchPaths) {
    try {
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
    } catch {
      /* continue */
    }
  }
  return envKey;
}

/**
 * Extracts a complete, chemically verified reaction JSON schema from any natural language text.
 */
export async function extractChemicalReactionWithAI(
  text: string,
): Promise<ExtractedReactionCascade | null> {
  const cacheKey = text.trim();
  const cached = extractionCache.get(cacheKey);
  if (cached && cached.exp > Date.now()) {
    console.log(`[ai-chemical-extractor] Returning cached extraction for "${cached.res.title}"`);
    return cached.res;
  }

  const apiKey = getGeminiApiKey();
  try {
    fs.writeFileSync(
      "./user-inputs.log",
      `\n==============================\n[${new Date().toISOString()}] (len: ${text.length})\n${text}\n==============================\n`,
      { flag: "a" },
    );
    fs.writeFileSync(
      "/tmp/user-input.log",
      `\n==============================\n[${new Date().toISOString()}] (len: ${text.length})\n${text}\n==============================\n`,
      { flag: "a" },
    );
    fs.writeFileSync(
      "/tmp/ai-extractor.log",
      `[${new Date().toISOString()}] apiKey prefix: ${apiKey ? apiKey.slice(0, 8) : "NONE"}, text length: ${text.length}\n`,
      { flag: "a" },
    );
  } catch {
    /* ignore */
  }
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || text.trim().length < 5) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `You are a world-class computational scientist, chemist, and academic editor for Nature, Nature Chemistry, JACS, and Environmental Science & Technology.
Read the user's scientific, chemical, biological, environmental, or materials text (which may be in Persian, English, or mixed) and extract an authoritative, structurally precise scientific breakdown.

Strict Universal Guidelines:
1. NEVER discard macroscopic, biological, or environmental entities (e.g. fauna/animals like donkey/خر, flora/meadow/چمن, plants, tissues, natural environments, atmospheric dispersion).
2. If the text describes living organisms, environmental settings, dispersing gas clouds, or movement towards a material/polymer (e.g. donkey in meadow with methane moving to non-linear polyethylene):
   - Set domain to "environmental-transport" and visualArchitecture to "environmental-transport".
   - Extract "biologicalContext" with the exact organism (in English and Persian) and environment setting.
   - Extract "diffusingGas" with chemical formula (e.g., CH4 for methane, CO2, etc.) and Persian name.
   - Extract "targetMatrix" with the material/polymer name, non-linear/branched architecture, and formula.
   - Extract "dynamics" detailing the directional transport or diffusion.
   - Populate "reactants" with the biological source and diffusing gas, and "products" with the target matrix/adsorption complex.
3. If the text discusses pharmacological mechanisms, enzymes (e.g., COX-1 vs. COX-2), or receptor inhibition:
   - Set domain to "enzyme-pathway" or "pharmacology", visualArchitecture to "dual-track-pathway", and populate "divergentTracks".
4. If the text describes nanomaterials or green synthesis (e.g., plant extract reducing metal ions):
   - Set domain to "nanomaterials" and visualArchitecture to "nanomaterial-process".
5. For small organic molecules, provide valid canonical SMILES and accurate molecular formulas.
6. Provide Persian translations ("titleFa", "summaryFa", "nameFa") for every element.`;

  for (const model of MODELS_PRIORITY) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `${systemPrompt}\n\nUSER SCIENTIFIC TEXT:\n${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Academic title suitable for a Journal TOC graphic",
              },
              titleFa: {
                type: Type.STRING,
                description: "Academic title in Persian (فارسی)",
              },
              category: { type: Type.STRING, description: "Scientific field/subdiscipline" },
              domain: {
                type: Type.STRING,
                description:
                  "One of: environmental-transport, bio-environmental, macromolecular, organic-synthesis, enzyme-pathway, pharmacology, catalytic-cycle, nanomaterials, general-chemistry",
              },
              visualArchitecture: {
                type: Type.STRING,
                description:
                  "One of: environmental-transport, dual-track-pathway, reaction-cascade, catalytic-loop, nanomaterial-process, macromolecule-interaction, general-conversion",
              },
              summary: { type: Type.STRING, description: "1-2 sentence core scientific takeaway" },
              summaryFa: { type: Type.STRING, description: "Persian translation of the summary" },
              biologicalContext: {
                type: Type.OBJECT,
                properties: {
                  organism: {
                    type: Type.STRING,
                    description: "Organism or animal name, e.g. Donkey / Equus asinus",
                  },
                  organismFa: { type: Type.STRING, description: "Persian name, e.g. خر" },
                  environment: {
                    type: Type.STRING,
                    description: "Setting or habitat, e.g. Meadow / Pasture",
                  },
                  environmentFa: { type: Type.STRING, description: "Persian setting, e.g. چمنزار" },
                  details: { type: Type.STRING },
                  detailsFa: { type: Type.STRING },
                },
              },
              diffusingGas: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  nameFa: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  smiles: { type: Type.STRING },
                  volumeOrConcentration: { type: Type.STRING },
                },
              },
              targetMatrix: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  nameFa: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  architecture: {
                    type: Type.STRING,
                    description: "e.g. Non-linear, branched, LDPE",
                  },
                  details: { type: Type.STRING },
                },
              },
              dynamics: {
                type: Type.OBJECT,
                properties: {
                  motion: { type: Type.STRING },
                  motionFa: { type: Type.STRING },
                  mechanism: { type: Type.STRING },
                },
              },
              reactants: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    nameFa: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    smiles: { type: Type.STRING },
                    mw: { type: Type.NUMBER },
                    equiv: { type: Type.NUMBER },
                    role: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name"],
                },
              },
              catalysts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    nameFa: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    smiles: { type: Type.STRING },
                    mw: { type: Type.NUMBER },
                    role: { type: Type.STRING },
                  },
                  required: ["name"],
                },
              },
              reagents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    nameFa: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    smiles: { type: Type.STRING },
                    mw: { type: Type.NUMBER },
                  },
                  required: ["name"],
                },
              },
              products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    nameFa: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    smiles: { type: Type.STRING },
                    mw: { type: Type.NUMBER },
                    yieldPercent: { type: Type.NUMBER },
                  },
                  required: ["name"],
                },
              },
              byproducts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    nameFa: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    smiles: { type: Type.STRING },
                    mw: { type: Type.NUMBER },
                  },
                  required: ["name"],
                },
              },
              conditions: {
                type: Type.OBJECT,
                properties: {
                  solvent: { type: Type.STRING },
                  temperature: { type: Type.STRING },
                  time: { type: Type.STRING },
                  light: { type: Type.STRING },
                  atmosphere: { type: Type.STRING },
                  pressure: { type: Type.STRING },
                },
              },
              keyFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              keyFindingsFa: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              divergentTracks: {
                type: Type.OBJECT,
                properties: {
                  track1: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      nameFa: { type: Type.STRING },
                      enzymeOrPath: { type: Type.STRING },
                      targetOrTissue: { type: Type.STRING },
                      normalFunction: { type: Type.STRING },
                      drugImpact: { type: Type.STRING },
                      clinicalOutcome: { type: Type.STRING },
                      isAdverse: { type: Type.BOOLEAN },
                    },
                    required: [
                      "name",
                      "enzymeOrPath",
                      "normalFunction",
                      "drugImpact",
                      "clinicalOutcome",
                    ],
                  },
                  track2: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      nameFa: { type: Type.STRING },
                      enzymeOrPath: { type: Type.STRING },
                      targetOrTissue: { type: Type.STRING },
                      normalFunction: { type: Type.STRING },
                      drugImpact: { type: Type.STRING },
                      clinicalOutcome: { type: Type.STRING },
                      isAdverse: { type: Type.BOOLEAN },
                    },
                    required: [
                      "name",
                      "enzymeOrPath",
                      "normalFunction",
                      "drugImpact",
                      "clinicalOutcome",
                    ],
                  },
                },
              },
              selectiveAgent: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  nameFa: { type: Type.STRING },
                  smiles: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  mw: { type: Type.NUMBER },
                  selectivityRationale: { type: Type.STRING },
                  selectivityRationaleFa: { type: Type.STRING },
                },
              },
              mechanisticCallout: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  labelFa: { type: Type.STRING },
                  detailFa: { type: Type.STRING },
                },
              },
            },
            required: ["title", "category", "domain"],
          },
        },
      });

      if (!response.text) continue;
      const parsed = JSON.parse(response.text) as ExtractedReactionCascade;

      // Post-process: ensure SMILES and MW are populated via PubChem if missing
      await enrichSpeciesWithPubChem(parsed.reactants);
      await enrichSpeciesWithPubChem(parsed.products);
      await enrichSpeciesWithPubChem(parsed.catalysts);

      console.log(
        `[ai-chemical-extractor] Successfully extracted "${parsed.title}" (domain: ${parsed.domain}) via ${model}`,
      );
      extractionCache.set(cacheKey, { res: parsed, exp: Date.now() + 15 * 60 * 1000 });
      return parsed;
    } catch (err) {
      try {
        fs.writeFileSync(
          "/tmp/ai-extractor.log",
          `[${new Date().toISOString()}] Model ${model} error: ${err instanceof Error ? err.stack : String(err)}\n`,
          { flag: "a" },
        );
      } catch {
        /* ignore */
      }
      console.warn(
        `[ai-chemical-extractor] Model ${model} encountered an error:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return null;
}

/**
 * Auto-populates missing SMILES or Molecular Weights using PubChem REST lookup
 */
async function enrichSpeciesWithPubChem(speciesList?: ExtractedChemicalEntity[]) {
  if (!speciesList || speciesList.length === 0) return;
  for (const item of speciesList) {
    if (!item.smiles || item.smiles.length < 2 || !item.mw) {
      try {
        const pubchem = await lookupPubChemUniversal(item.name);
        if (pubchem) {
          if (!item.smiles && pubchem.smiles) item.smiles = pubchem.smiles;
          if (!item.mw && pubchem.molecularWeight) item.mw = pubchem.molecularWeight;
          if (!item.formula && pubchem.molecularFormula) item.formula = pubchem.molecularFormula;
        }
      } catch {
        /* ignore offline lookup */
      }
    }
  }
}
