/**
 * Prompt construction for the graphical abstract. Kept separate from both the
 * UI and the API provider so it can be tuned independently.
 */
export function buildAbstractPrompt(text: string): string {
  return [
    "Create a clean, professional scientific GRAPHICAL ABSTRACT image for a peer-reviewed chemistry journal.",
    "Style: flat vector illustration on a pure white background, thin dark navy line work, one teal accent color,",
    "left-to-right reaction scheme with clear straight reaction arrows, small labels for reagents and conditions above/below the arrow,",
    "skeletal (line-angle) organic structures, generous whitespace, no photorealism, no 3D bevels, no decorative clutter,",
    "minimal short English labels only (no paragraphs, no fake citations, no watermark, no journal logo).",
    "Layout as a single horizontal panel, 16:9-ish, suitable for a table-of-contents graphic.",
    "",
    "Base the scheme on this text (starting material(s) -> product(s), highlighting catalyst, conditions and key outcome):",
    text,
  ].join("\n");
}
