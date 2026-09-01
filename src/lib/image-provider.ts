/**
 * Image generation provider — ISOLATED ON PURPOSE.
 *
 * This is the ONLY file that should know which AI service generates images.
 * If we ever swap providers (different model, different vendor), every
 * change happens here — no other file should need to change.
 *
 * CURRENT PROVIDER: Pollinations.ai (https://pollinations.ai)
 *   - Free, no API key, no billing account, no signup required.
 *   - Switched to this on 2026-09-01 because Google Gemini's image model
 *     (gemini-3.1-flash-image) no longer has any free quota (HTTP 429,
 *     "limit: 0" on the free tier — it now requires a billed Google Cloud
 *     project), and the project has no way to attach international billing.
 *
 * The old direct-Gemini implementation is kept below (unused, exported as
 * `generateAbstractImageViaGemini`) so it's a one-line swap to switch back
 * once a billing path is sorted out — nothing else in the app needs to change.
 */

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

const POLLINATIONS_ENDPOINT = "https://image.pollinations.ai/prompt";

/**
 * Calls Pollinations.ai and returns one finished base64-encoded image.
 * Pollinations takes the prompt directly in the URL path and returns the
 * raw image bytes (no JSON wrapper, no auth) — so this just fetches the
 * URL and base64-encodes whatever comes back.
 */
export async function generateAbstractImage(prompt: string): Promise<ProviderImageResult> {
  const url =
    `${POLLINATIONS_ENDPOINT}/${encodeURIComponent(prompt)}` +
    `?width=1024&height=1024&nologo=true&model=flux`;

  let upstream: Response;
  try {
    upstream = await fetch(url);
  } catch (err) {
    throw new ProviderError(
      err instanceof Error ? err.message : "Network error contacting Pollinations",
      502,
    );
  }

  if (!upstream.ok) {
    const bodyText = await upstream.text().catch(() => "");
    throw new ProviderError(
      `Pollinations error (${upstream.status}): ${bodyText || "no details"}`,
      upstream.status,
    );
  }

  const arrayBuffer = await upstream.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new ProviderError("Pollinations response contained no image data", 502);
  }

  return {
    b64_json: Buffer.from(arrayBuffer).toString("base64"),
    mimeType: upstream.headers.get("content-type") ?? "image/jpeg",
  };
}

/**
 * UNUSED FOR NOW — kept for when a billed Gemini project becomes available.
 * Calls Google's Gemini API directly using the project's own GEMINI_API_KEY,
 * via the model "gemini-3.1-flash-image". Not called anywhere currently.
 */
export async function generateAbstractImageViaGemini(prompt: string): Promise<ProviderImageResult> {
  const GEMINI_MODEL = "gemini-3.1-flash-image";
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const geminiKey = process.env["GEMINI_API_KEY"];
  const gatewayKey = process.env["LOVABLE_API_KEY"];

  if (!geminiKey) {
    if (!gatewayKey) {
      throw new ProviderError(
        "No image provider credential configured (GEMINI_API_KEY or LOVABLE_API_KEY)",
        500,
      );
    }
    return generateViaLovableGateway(prompt, gatewayKey);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
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

/**
 * Fallback path: Lovable's built-in AI Gateway (no project API key needed).
 * Returns the same finished-image shape as the direct Gemini call.
 */
async function generateViaLovableGateway(
  prompt: string,
  apiKey: string,
): Promise<ProviderImageResult> {
  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        prompt,
        n: 1,
      }),
    });
  } catch (err) {
    throw new ProviderError(
      err instanceof Error ? err.message : "Network error contacting AI gateway",
      502,
    );
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new ProviderError(
      `AI gateway error (${res.status}): ${bodyText || "no details"}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new ProviderError("AI gateway response contained no image data", 502);
  }
  return { b64_json: b64, mimeType: "image/png" };
}
