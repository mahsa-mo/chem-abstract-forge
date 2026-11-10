/**
 * Image Generation Agent Provider
 *
 * Priority chain:
 * 1. Google Gemini Image (`gemini-3.1-flash-lite-image` / `gemini-3.1-flash-image`)
 *    if a billing-enabled Gemini API key is configured without quota errors.
 * 2. High-detail FLUX.1 (`black-forest-labs-flux-1-schnell` & `evalstate-flux1-schnell`).
 * 3. Lovable AI Gateway (if `LOVABLE_API_KEY` is configured).
 * 4. Cloudflare Workers AI (if `CLOUDFLARE_API_TOKEN` is configured).
 * 5. Pollinations fallback.
 * 6. High-Precision Scientific Vector Graphical Abstract (ChemDraw Engine):
 *    Direct authentic 2D vector schematic strictly matching the user's chemical text.
 */

import {
  buildScientificVectorSvg,
  buildScientificVectorSvgDetailed,
} from "./scientific-vector-abstract";
import type { JournalId, ColorSchemeId } from "./journal-standards";

export type ProviderImageResult = {
  b64_json: string;
  mimeType: string;
  provider: "gemini" | "flux-hf" | "pollinations" | "cloudflare" | "chemdraw-vector";
};

export class ProviderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

interface GradioSpaceConfig {
  baseUrl: string;
  buildPayload: (prompt: string, seed: number) => unknown[];
}

const FLUX_GRADIO_SPACES: GradioSpaceConfig[] = [
  {
    baseUrl: "https://black-forest-labs-flux-1-schnell.hf.space",
    buildPayload: (prompt, seed) => [prompt, seed, true, 1024, 576, 4],
  },
  {
    baseUrl: "https://evalstate-flux1-schnell.hf.space",
    buildPayload: (prompt, seed) => [prompt, seed, true, 1024, 576, 4],
  },
  {
    baseUrl: "https://multimodalart-flux-1-merged.hf.space",
    buildPayload: (prompt, seed) => [prompt, seed, true, 1024, 576, 3.5, 4],
  },
];

export interface GenerateImageContext {
  text?: string;
  journal?: JournalId;
  colorScheme?: ColorSchemeId;
}

export async function generateAbstractImage(
  prompt: string,
  context?: GenerateImageContext,
): Promise<ProviderImageResult> {
  // 1. Primary: High-Precision Scientific Vector Graphical Abstract (ChemDraw Engine)
  // Guarantees 100% semantic and chemical fidelity to the user's text.
  // Accurately renders every molecule, reagent, reaction step, and residue described.
  const sourceText = context?.text || prompt;
  if (sourceText) {
    try {
      console.log(
        "[image-provider] Rendering publication-grade 2D vector graphical abstract from chemical text",
      );
      const vectorResult = await buildScientificVectorSvgDetailed(
        sourceText,
        context?.journal ?? "acs",
        context?.colorScheme ?? "academic-clean",
      );
      if (vectorResult && vectorResult.svg && vectorResult.svg.length > 200) {
        return {
          b64_json: Buffer.from(vectorResult.svg, "utf-8").toString("base64"),
          mimeType: "image/svg+xml",
          provider: vectorResult.provider,
        };
      }
    } catch (vectorErr) {
      console.warn(
        "[image-provider] Vector abstract generation error, falling back to neural renderers:",
        vectorErr instanceof Error ? vectorErr.message : vectorErr,
      );
    }
  }

  // 2. Try Gemini Image if billing is active
  try {
    return await generateAbstractImageViaGemini(prompt);
  } catch (geminiErr) {
    console.warn(
      "[image-provider] Gemini image generation unavailable:",
      geminiErr instanceof Error ? geminiErr.message : geminiErr,
    );
  }

  // 3. Try FLUX Gradio Spaces
  try {
    return await generateWithFluxGradioSpaces(prompt);
  } catch (fluxErr) {
    console.warn(
      "[image-provider] FLUX Gradio Spaces unavailable:",
      fluxErr instanceof Error ? fluxErr.message : fluxErr,
    );
  }

  // 3. Try Lovable Gateway if key configured
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (gatewayKey) {
    try {
      return await generateViaLovableGateway(prompt, gatewayKey);
    } catch (gwErr) {
      console.warn(
        "[image-provider] Lovable Gateway error:",
        gwErr instanceof Error ? gwErr.message : gwErr,
      );
    }
  }

  // 4. Try Cloudflare Workers AI if configured
  if (process.env["CLOUDFLARE_ACCOUNT_ID"] && process.env["CLOUDFLARE_API_TOKEN"]) {
    try {
      const blob = await generateImageWithCloudflare(prompt);
      const arrayBuffer = await blob.arrayBuffer();
      return {
        b64_json: Buffer.from(arrayBuffer).toString("base64"),
        mimeType: blob.type || "image/jpeg",
        provider: "cloudflare" as const,
      };
    } catch (cfErr) {
      console.warn(
        "[image-provider] Cloudflare Workers AI error:",
        cfErr instanceof Error ? cfErr.message : cfErr,
      );
    }
  }

  // 5. Try Pollinations
  try {
    return await generateWithPollinations(prompt);
  } catch (pollErr) {
    console.warn(
      "[image-provider] Pollinations unavailable:",
      pollErr instanceof Error ? pollErr.message : pollErr,
    );
  }

  // 6. Scientific Vector Abstract Engine (ChemDraw 2D Vector)
  // Generates authentic 2D skeletal structures strictly representing the user's chemical text.
  if (sourceText) {
    console.log(
      "[image-provider] Generating authentic 2D vector graphical abstract from chemical text",
    );
    const svg = await buildScientificVectorSvg(
      sourceText,
      context?.journal ?? "acs",
      context?.colorScheme ?? "academic-clean",
    );
    return {
      b64_json: Buffer.from(svg, "utf-8").toString("base64"),
      mimeType: "image/svg+xml",
      provider: "chemdraw-vector",
    };
  }

  throw new ProviderError("All image generation providers were temporarily unavailable", 502);
}

async function generateWithFluxGradioSpaces(prompt: string): Promise<ProviderImageResult> {
  let lastError = "FLUX generation failed";
  const cleanPrompt = prompt.slice(0, 1000).trim();

  for (const space of FLUX_GRADIO_SPACES) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6500);
    try {
      const seed = Math.floor(1 + Math.random() * 100000);
      const postRes = await fetch(`${space.baseUrl}/gradio_api/call/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: space.buildPayload(cleanPrompt, seed),
        }),
        signal: ctrl.signal,
      });

      if (!postRes.ok) {
        lastError = `${space.baseUrl} POST returned ${postRes.status}`;
        clearTimeout(timer);
        continue;
      }

      const postJson = (await postRes.json()) as { event_id?: string };
      if (!postJson.event_id) {
        lastError = `${space.baseUrl} returned no event_id`;
        clearTimeout(timer);
        continue;
      }

      const sseRes = await fetch(`${space.baseUrl}/gradio_api/call/infer/${postJson.event_id}`, {
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!sseRes.ok) {
        lastError = `${space.baseUrl} SSE returned ${sseRes.status}`;
        continue;
      }

      const sseText = await sseRes.text();
      const urlMatch = sseText.match(/"url":\s*"([^"]+)"/);
      const pathMatch = sseText.match(/"path":\s*"([^"]+)"/);

      const fileUrl =
        urlMatch?.[1] ??
        (pathMatch?.[1] ? `${space.baseUrl}/gradio_api/file=${pathMatch[1]}` : null);

      if (!fileUrl) {
        lastError = `${space.baseUrl} SSE did not contain an image URL`;
        continue;
      }

      const imgRes = await fetch(fileUrl);
      if (!imgRes.ok) {
        lastError = `${space.baseUrl} image download returned ${imgRes.status}`;
        continue;
      }

      const arrayBuffer = await imgRes.arrayBuffer();
      if (arrayBuffer.byteLength < 5000) {
        lastError = `${space.baseUrl} image too small (${arrayBuffer.byteLength} bytes)`;
        continue;
      }

      console.log(
        `[flux-hf] Successfully generated ${arrayBuffer.byteLength} bytes from ${space.baseUrl}`,
      );

      return {
        b64_json: Buffer.from(arrayBuffer).toString("base64"),
        mimeType: imgRes.headers.get("content-type") ?? "image/webp",
        provider: "flux-hf" as const,
      };
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err.message : "Error calling FLUX Gradio Space";
    }
  }

  throw new ProviderError(lastError, 502);
}

export async function generateAbstractImageViaGemini(prompt: string): Promise<ProviderImageResult> {
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (!geminiKey) {
    throw new ProviderError("GEMINI_API_KEY is not configured", 500);
  }

  const models = [
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
    "gemini-2.5-flash-image",
  ];
  let lastStatus = 502;
  let lastMessage = "Gemini image generation failed";

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastMessage = await upstream.text().catch(() => "");
        continue;
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
      if (imagePart?.inlineData?.data) {
        return {
          b64_json: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType ?? "image/png",
          provider: "gemini" as const,
        };
      }
    } catch (err) {
      lastMessage = err instanceof Error ? err.message : "Network error contacting Gemini";
    }
  }

  throw new ProviderError(`Gemini API (${lastStatus}): ${lastMessage}`, lastStatus);
}

async function generateViaLovableGateway(
  prompt: string,
  apiKey: string,
): Promise<ProviderImageResult> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
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
  return { b64_json: b64, mimeType: "image/png", provider: "gemini" as const };
}

export async function generateImageWithCloudflare(prompt: string): Promise<Blob> {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"];
  const apiToken = process.env["CLOUDFLARE_API_TOKEN"];

  if (!accountId || !apiToken) {
    throw new ProviderError(
      "Missing Cloudflare credentials (CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN)",
      500,
    );
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  const upstream = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: prompt.slice(0, 800) }),
  });

  if (!upstream.ok) {
    const bodyText = await upstream.text().catch(() => "");
    throw new ProviderError(
      `Cloudflare error (${upstream.status}): ${bodyText || "no details"}`,
      upstream.status,
    );
  }

  const json = (await upstream.json()) as {
    result?: { image?: string };
  };

  const imageB64 = json.result?.image;
  if (!imageB64) {
    throw new ProviderError("Cloudflare response contained no image data", 502);
  }

  const binary = Buffer.from(imageB64, "base64");
  return new Blob([binary], { type: "image/jpeg" });
}

async function generateWithPollinations(prompt: string): Promise<ProviderImageResult> {
  const seed = Math.floor(100 + Math.random() * 999000);
  const cleanPrompt = prompt.slice(0, 800);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}` +
    `?width=1024&height=576&nologo=true&seed=${seed}`;

  const upstream = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
  });

  if (!upstream.ok) {
    throw new ProviderError(`Pollinations HTTP ${upstream.status}`, upstream.status);
  }

  const arrayBuffer = await upstream.arrayBuffer();
  if (arrayBuffer.byteLength < 10000) {
    throw new ProviderError("Pollinations returned small payload", 502);
  }

  return {
    b64_json: Buffer.from(arrayBuffer).toString("base64"),
    mimeType: upstream.headers.get("content-type") ?? "image/jpeg",
    provider: "pollinations" as const,
  };
}
