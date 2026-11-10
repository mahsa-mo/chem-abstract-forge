/**
 * Universal Generative Visual Synthesis Engine
 *
 * Provides a fundamental, root-level solution for generating open-ended,
 * multidisciplinary, surreal, or scientifically rigorous vector illustrations
 * from ANY natural language description (Persian, English, or mixed).
 *
 * Prepared for ANY concept combination—from biochemical pathways to
 * macro-fauna, characters, astrophysical settings, nanotech, and beyond.
 */

import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { JOURNAL_STANDARDS, type JournalId } from "./journal-standards";
import { COLOR_SCHEMES, type ColorSchemeId } from "./journal-standards";

const universalSvgCache = new Map<string, { svg: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function resolveGeminiApiKey(): string | undefined {
  const envKey = process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim().length > 10) {
    return envKey.trim();
  }

  const searchPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
    "/app/applet/.env",
  ];

  for (const envPath of searchPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const match = line.match(/^(?:VITE_)?GEMINI_API_KEY=(.+)$/);
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

export function cleanAndValidateSvg(raw: string): string | null {
  if (!raw) return null;
  let text = raw.trim();

  // Strip markdown code fences if present
  text = text
    .replace(/^```(?:xml|svg)?/i, "")
    .replace(/```$/i, "")
    .trim();

  // Find start of <svg and end of </svg>
  const startIdx = text.indexOf("<svg");
  const endIdx = text.lastIndexOf("</svg>");

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const svgContent = text.slice(startIdx, endIdx + 6).trim();

  // Ensure mandatory attributes
  if (!svgContent.includes('viewBox="') && !svgContent.includes("viewBox='")) {
    // Inject default viewBox
    return svgContent.replace("<svg", '<svg viewBox="0 0 1280 720" width="100%" height="100%"');
  }

  return svgContent;
}

/**
 * Universal Visual Synthesis using Frontier Generative AI
 */
export async function synthesizeUniversalGenerativeSvg(
  userText: string,
  journalId: JournalId = "acs",
  colorSchemeId: ColorSchemeId = "academic-clean",
): Promise<string | null> {
  const cleanInput = userText.trim();
  if (cleanInput.length < 3) return null;

  const cacheKey = `${journalId}:${colorSchemeId}:${cleanInput}`;
  const cached = universalSvgCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log("[universal-generative-svg] Returning cached universal synthesis");
    return cached.svg;
  }

  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    console.warn("[universal-generative-svg] No Gemini API key available for universal synthesis");
    return null;
  }

  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const colorScheme = COLOR_SCHEMES[colorSchemeId] ?? COLOR_SCHEMES["academic-clean"];

  const systemInstruction = `You are an elite scientific artist, conceptual designer, and master SVG illustrator for premier journals like Nature, Science, Cell, and JACS.
Your mission is to generate a comprehensive, breathtaking, and 100% FAITHFUL publication-quality vector SVG artwork strictly illustrating what the user describes.

CRITICAL DESIGN CONSTITUTION (ROOT-LEVEL UNIVERSAL CAPABILITY):
1. UNIVERSAL COMPOSITIONALITY & HYBRID CREATIVITY:
   - You MUST visually depict EVERY character, creature, animal, human role, molecule, apparatus, chemical reaction, physical phenomenon, and environmental setting mentioned by the user.
   - You MUST be prepared to combine the most unexpected, unusual, surreal, or multidisciplinary concepts seamlessly into a coherent, believable world (e.g., animals interacting with laboratory equipment, cosmic backgrounds with molecular orbitals, pedagogical teaching sessions, bizarre biochemical hybrids).
   - NEVER drop or omit any entity mentioned by the user. If they mention a giraffe in space drinking acid, render the giraffe, space, the acid beaker, the magnetic fields, and the planets!

2. SEAMLESS PANORAMIC COMPOSITION (NO ARTIFICIAL BOXES OR FENCES):
   - The entire image (1280x720) MUST be a unified, borderless, continuous artistic or scientific scene with atmospheric depth, realistic lighting, and natural perspective.
   - DO NOT divide the canvas into arbitrary gray cards, bounding boxes, fences, or report tables unless specifically asked.

3. ADVANCED VECTOR ARTISTRY & VOCABULARY:
   - Use <defs> containing rich <linearGradient> and <radialGradient> definitions for realistic lighting, glows, specular highlights, and surface textures.
   - For living beings (animals, humans, chemists, observers): use detailed organic <path>, <polygon>, and contours with anatomical care, fur/cloth textures, eyes with reflections, and lively expressions.
   - For chemical molecules: render authentic ball-and-stick (CPK colored spheres: Carbon=dark/gray, Oxygen=red, Hydrogen=white, Nitrogen=blue, Sulfur=yellow) or clear skeletal bonds.
   - For mechanisms & lectures: draw chalkboards or holographic displays with actual reaction formulas, electron flow arrows, and reagents.
   - For physical fields / fluids / gases: render smooth flowlines, particles, or volumetric plumes.

4. TARGET STANDARDS:
   - Target format: SVG (viewBox="0 0 1280 720", width="100%", height="100%").
   - Journal aesthetic: ${standard.fullName} (${standard.aspectRatio}).
   - Color mood: ${colorScheme.promptModifier}.
   - Output constraint: Output ONLY the complete raw <svg>...</svg> tag without markdown ticks or outside commentary.`;

  const userPrompt = `USER INPUT TEXT (which may be in Persian, English, or any language):
"${cleanInput}"

Create the complete, rich SVG artwork now.`;

  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];

  for (const model of models) {
    try {
      console.log(`[universal-generative-svg] Synthesizing universal scene via ${model}...`);
      const t0 = Date.now();
      const response = await ai.models.generateContent({
        model,
        contents: `${systemInstruction}\n\n${userPrompt}`,
        config: {
          temperature: 0.25,
        },
      });

      const duration = Date.now() - t0;
      const rawText = response.text || "";
      const validSvg = cleanAndValidateSvg(rawText);

      if (validSvg && validSvg.length > 500) {
        console.log(
          `[universal-generative-svg] Successfully synthesized universal SVG in ${duration}ms (length: ${validSvg.length})`,
        );
        universalSvgCache.set(cacheKey, { svg: validSvg, timestamp: Date.now() });
        return validSvg;
      }
    } catch (modelErr) {
      console.warn(
        `[universal-generative-svg] Model ${model} generation failed or timed out:`,
        modelErr instanceof Error ? modelErr.message : modelErr,
      );
    }
  }

  return null;
}
