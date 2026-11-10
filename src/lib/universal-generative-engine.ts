/**
 * Universal Generative Visual Synthesis Engine
 *
 * Fundamentally eliminates hardcoded if/else template limitations.
 * Synthesizes ANY combination of scientific, chemical, biological, astronomical,
 * or creative concepts requested by the user into a rich, borderless,
 * publication-grade vector SVG graphical abstract.
 */

import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { JournalId, JOURNAL_STANDARDS } from "./journal-standards";
import { ColorSchemeId, COLOR_SCHEMES } from "./journal-standards";

function getGeminiApiKey(): string | undefined {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim().length > 10) {
    return envKey.trim();
  }
  const viteKey = process.env["VITE_GEMINI_API_KEY"];
  if (viteKey && viteKey !== "MY_GEMINI_API_KEY" && viteKey.trim().length > 10) {
    return viteKey.trim();
  }
  try {
    for (const p of [".env", ".env.local"]) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        for (const line of content.split("\n")) {
          const match = line.match(/^(?:VITE_)?GEMINI_API_KEY=(.+)$/);
          if (match && match[1] && match[1].trim() !== "MY_GEMINI_API_KEY") {
            return match[1].trim();
          }
        }
      }
    }
  } catch {
    /* continue */
  }
  return undefined;
}

export async function synthesizeUniversalSvg(
  prompt: string,
  journalId: JournalId = "acs",
  colorSchemeId: ColorSchemeId = "academic-clean",
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const colorScheme = COLOR_SCHEMES[colorSchemeId] ?? COLOR_SCHEMES["academic-clean"];

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a world-class master scientific vector illustrator, cover artist for Nature, Cell, and Science, and chemical graphical abstract designer.
Your objective: Take the user's prompt (which may be in Persian, English, or any language) and generate a COMPLETE, DELICATE, ULTRA-ELEGANT, AND PUBLICATION-GRADE SVG VECTOR ILLUSTRATION (1280x720).

CRITICAL AESTHETIC & GRAPHICAL CONSTRAINTS (NO EXCEPTIONS):
1. ABSOLUTELY ZERO STAMPS, BADGES, FOOTERS, OR HEADER BANNERS:
   - DO NOT render text badges like "ACS", "Nature", "TOC", "Atom Economy", "E-Factor", "Plausibility Score", "Verified", or metadata header/footer bars.
   - DO NOT put artificial rectangular frames, card borders, or flowchart boxes around elements.
   - The graphic must be 100% CLEAN, ELEGANT, AND BORDERLESS.

2. HIGH ARTISTIC DELICACY & VISUAL BEAUTY:
   - Use soft studio lighting, subtle linear and radial gradients, glowing highlights, translucent glassmorphism effects, and rich depth.
   - For chemical molecules: render 3D CPK shaded spheres with soft specular highlights, sleek glowing bonds, and accurate geometry.
   - For characters, creatures, or equipment: render smooth organic vector shapes, refined silhouettes, realistic anatomy, soft shadows, and vibrant artistic colors.
   - For environments/backgrounds: render atmospheric lighting, soft horizon glows, gradient fields, and delicate particle effects.

3. 100% FIDELITY TO USER'S PROMPT:
   - Depict EVERY entity, organism, chemical species, reaction force, or action mentioned in the user's text with high visual fidelity and artistic harmony.

4. OUTPUT FORMAT:
   - Return ONLY the raw valid SVG starting with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"> and ending with </svg>.
   - DO NOT include markdown code blocks, and DO NOT output conversational text.`;

  const models = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];

  for (const model of models) {
    try {
      console.log(`[universal-generative-engine] Synthesizing custom visual scene via ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: `USER PROMPT:\n"${prompt}"\n\nTARGET JOURNAL: ${standard.fullName} (${standard.aspectRatio})\nCOLOR PALETTE: ${colorScheme.name} (${colorScheme.promptModifier})\n\nSynthesize the complete, seamless, borderless 1280x720 SVG now:`,
        config: {
          systemInstruction,
          temperature: 0.25,
        },
      });

      const raw = (response.text || "").trim();
      const svgMatch = raw.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch && svgMatch[0]) {
        let svg = svgMatch[0].trim();
        if (!svg.includes('viewBox="0 0 1280 720"') && !svg.includes("viewBox='0 0 1280 720'")) {
          svg = svg.replace(
            /<svg\b([^>]*)>/i,
            '<svg $1 viewBox="0 0 1280 720" width="1280" height="720">',
          );
        }
        console.log(
          `[universal-generative-engine] Successfully synthesized ${svg.length} bytes SVG via ${model}`,
        );
        return svg;
      }
    } catch (err) {
      console.warn(
        `[universal-generative-engine] ${model} synthesis attempt failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return null;
}
