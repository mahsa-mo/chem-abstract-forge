/**
 * Step 1 — turn the user's raw chemistry text into a structured, explicit
 * visual scene description using a TEXT model (not the image model). This is
 * what actually fixes "the image looks unrelated to my text": image models
 * (especially the generic fallbacks like Pollinations/Flux) do much better
 * with an explicit left-to-right layout spec than with a paragraph of prose.
 *
 * Uses GEMINI_API_KEY against a text-only model — a separate quota/billing
 * pool from the image model, so this keeps working even when image
 * generation itself is falling back to Pollinations/Cloudflare.
 *
 * On any failure (no key, network, quota), this falls back to returning the
 * raw text unchanged so the pipeline never breaks — it only ever *upgrades*
 * the prompt when it can.
 */
export async function buildStructuredSceneDescription(text: string): Promise<string> {
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (!geminiKey) return text;

  const GEMINI_TEXT_MODEL = "gemini-3.1-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${geminiKey}`;

  const instruction = [
    "You are preparing a precise visual layout spec for an image-generation model that will draw a scientific graphical abstract.",
    "Read the chemistry text below and output ONLY a structured scene description, using this exact shape (plain text, no markdown, no extra commentary):",
    "",
    "LAYOUT: left-to-right panel with N stages",
    "STAGE 1 (left): <structure/material name + condensed structural formula or key functional groups>",
    "ARROW 1: <conditions, catalyst, reagents, temperature — whatever is stated or reasonably implied>",
    "STAGE 2: <next structure/material>",
    "... (repeat ARROW/STAGE for every step actually present in the text — do not invent steps that aren't there)",
    "FINAL PRODUCT (right): <product name + key structural feature to depict>",
    "KEY LABELS: <any numeric values, yields, or short labels that should appear as text in the image>",
    "",
    "Rules: only include what is stated or directly implied by the text. If the text describes one single step, output exactly one STAGE/ARROW/STAGE, not a fabricated multi-step scheme. Keep every line short (under ~12 words) — this is a layout spec, not an explanation.",
    "",
    "TEXT:",
    text,
  ].join("\n");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruction }] }],
        generationConfig: { responseModalities: ["TEXT"] },
      }),
    });

    if (!res.ok) {
      console.error("[abstract-prompt] scene description request failed:", res.status);
      return text;
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const description = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();

    if (!description) {
      console.error("[abstract-prompt] scene description response was empty");
      return text;
    }

    console.log("[abstract-prompt] structured scene description:\n", description);
    return description;
  } catch (err) {
    console.error(
      "[abstract-prompt] scene description request threw:",
      err instanceof Error ? err.message : err,
    );
    return text;
  }
}

/**
 * Prompt construction for the graphical abstract. Kept separate from both the
 * UI and the API provider so it can be tuned independently.
 *
 * `sceneDescription` should normally be the output of
 * `buildStructuredSceneDescription`, not the raw user text — the route
 * (`generate-abstract.ts`) is responsible for calling that first.
 */
export function buildAbstractPrompt(sceneDescription: string): string {
  const prompt = [
    "Create a clean, professional scientific GRAPHICAL ABSTRACT image for a peer-reviewed chemistry journal.",
    "Style: flat vector illustration on a pure white background, crisp thin line work, skeletal (line-angle) organic structures,",
    "left-to-right reaction scheme with clear straight reaction arrows, small labels for reagents and conditions above/below the arrow,",
    "generous whitespace, no photorealism, no 3D bevels, no decorative clutter,",
    "minimal short English labels only (no paragraphs, no fake citations, no watermark, no journal logo).",
    "Layout as a single horizontal panel, 16:9-ish, suitable for a table-of-contents graphic.",
    "",
    "COLOR REQUIREMENTS (very important):",
    "- Use a varied, purposeful, MULTI-COLOR palette. Do NOT render the whole image in one dominant color family or a single monotone wash.",
    "- Different molecular structures, reagents, catalysts and pathway stages must be visually distinct from each other in color.",
    "- Respect standard chemistry element color conventions where atoms are shown or labeled:",
    "  carbon = dark gray/black, oxygen = red, nitrogen = blue, hydrogen = white/light gray, sulfur = yellow, halogens = green/purple, phosphorus = orange.",
    "- Use 2-4 complementary/contrasting accent colors for arrows, condition labels, highlight boxes and product callouts,",
    "  kept coherent as one palette with strong contrast against the white background for readability.",
    "- Keep text dark and legible; never tint the entire background.",
    "",
    "RELEVANCE REQUIREMENTS (very important — follow the layout spec exactly):",
    "- Depict ONLY the stages, arrows and labels listed in the scene description below, in the exact left-to-right order given.",
    "- Do NOT add unrelated objects, generic lab-stock imagery, decorative backgrounds, people, or scenery that isn't part of the spec.",
    "- Do NOT invent extra reaction steps, molecules or labels that are not present in the spec below.",
    "",
    "SCENE DESCRIPTION (the exact layout to draw):",
    sceneDescription,
  ].join("\n");

  return prompt;
}
