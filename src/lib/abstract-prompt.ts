/**
 * Prompt construction for the graphical abstract. Kept separate from both the
 * UI and the API provider so it can be tuned independently.
 */
export function buildAbstractPrompt(text: string): string {
  return [
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
    "Base the scheme on this text (starting material(s) -> product(s), highlighting catalyst, conditions and key outcome):",
    text,
  ].join("\n");
}
