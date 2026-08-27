/**
 * Image generation provider — ISOLATED ON PURPOSE.
 *
 * This is the ONLY file that should know which AI service generates images.
 * If we ever swap providers (different model, different vendor), every
 * change happens here — no other file should need to change.
 *
 * Currently: calls Google's Gemini API directly (generativelanguage.googleapis.com)
 * using the project's own GEMINI_API_KEY, via the model "gemini-3.1-flash-image".
 *
 * IMPORTANT: this file intentionally does NOT stream partial image previews
 * from Gemini. Gemini returns the finished image in a single response chunk
 * (unlike OpenAI-style incremental image previews), so we call the plain
 * (non-streaming) endpoint and hand back one complete image. The calling
 * route (`generate-abstract.ts`) still exposes the same streaming-shaped
 * contract to the frontend — it just emits a single "completed" event
 * instead of multiple "partial" ones. No frontend code needs to change.
 */

const GEMINI_MODEL = "gemini-3.1-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type ProviderImageResult = {
  b64_json: string;
  mimeType: string;
};

export class ProviderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

/**
 * Calls Gemini directly and returns one finished base64-encoded image.
 * Throws ProviderError (with an HTTP-style status) on any failure —
 * callers must treat a thrown ProviderError as "no image produced,
 * do not charge the user's quota for this attempt."
 */
export async function generateAbstractImage(prompt: string): Promise<ProviderImageResult> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) {
    throw new ProviderError("Missing GEMINI_API_KEY environment variable", 500);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
  } catch (err) {
    // Network-level failure reaching Gemini at all.
    throw new ProviderError(
      err instanceof Error ? err.message : "Network error contacting Gemini",
      502,
    );
  }

  if (!upstream.ok) {
    const bodyText = await upstream.text().catch(() => "");
    throw new ProviderError(
      `Gemini API error (${upstream.status}): ${bodyText || "no details"}`,
      upstream.status,
    );
  }

  const json = (await upstream.json()) as {
    candidates?: {
      content?: {
        parts?: { text?: string; inlineData?: { mimeType?: string; data?: string } }[];
      };
    }[];
  };

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new ProviderError("Gemini response contained no image data", 502);
  }

  return {
    b64_json: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
  };
}