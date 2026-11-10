import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";
import { JOURNAL_STANDARDS, type JournalId, type ColorSchemeId } from "./journal-standards";

type ImageEventPayload =
  | {
      type: "image_generation.partial_image";
      b64_json: string;
      mimeType?: string;
      provider?: string;
      partial_image_index: number;
    }
  | {
      type: "image_generation.completed";
      b64_json: string;
      mimeType?: string;
      provider?: string;
    }
  | { type: "error"; error: { message: string } };

export interface GenerateAbstractOptions {
  journal?: JournalId;
  colorScheme?: ColorSchemeId;
}

/**
 * Normalizes the generated image into a high-resolution, journal-compliant PNG data URL.
 * Renders on a pristine pure white canvas formatted to the selected journal's aspect ratio and dimensions.
 */
async function normalizeGeneratedImage(
  b64: string,
  mimeType = "image/webp",
  provider?: string,
  journalId: JournalId = "acs",
): Promise<string> {
  const rawDataUrl = `data:${mimeType};base64,${b64}`;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return rawDataUrl;
  }

  // Preserve vector graphics without raster distortion
  if (mimeType === "image/svg+xml" || provider === "chemdraw-vector") {
    return rawDataUrl;
  }

  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const targetWidth = standard.canvasWidth || 1920;
  const targetHeight = standard.canvasHeight || 1080;

  return new Promise<string>((resolve) => {
    const img = new Image();
    if (!rawDataUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // 1. Strict pure white background for publication journals
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const cropFactor = provider === "pollinations" ? 0.94 : 1.0;
        const srcW = img.naturalWidth || img.width || targetWidth;
        const srcH = img.naturalHeight || img.height || targetHeight;
        const sw = Math.floor(srcW * cropFactor);
        const sh = Math.floor(srcH * cropFactor);

        // Compute aspect-fit centering so the chemistry illustration is never distorted
        const imgRatio = sw / sh;
        const canvasRatio = targetWidth / targetHeight;

        let dw = targetWidth;
        let dh = targetHeight;
        let dx = 0;
        let dy = 0;

        if (imgRatio > canvasRatio) {
          // Image is wider than canvas ratio
          dw = targetWidth;
          dh = Math.round(targetWidth / imgRatio);
          dy = Math.round((targetHeight - dh) / 2);
        } else {
          // Image is taller or equal
          dh = targetHeight;
          dw = Math.round(targetHeight * imgRatio);
          dx = Math.round((targetWidth - dw) / 2);
        }

        ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export async function streamAbstract(
  text: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  options?: GenerateAbstractOptions,
): Promise<void> {
  const journal = options?.journal ?? "acs";
  const colorScheme = options?.colorScheme ?? "academic-clean";

  const res = await fetch("/api/generate-abstract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      journal,
      colorScheme,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Image generation failed: ${res.status}`);
  }

  let sawCompleted = false;
  let sawAnyEvent = false;
  let streamError: string | undefined;
  const pendingFrames: Promise<void>[] = [];

  const parser = createParser({
    onEvent(event) {
      let payload: ImageEventPayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImageEventPayload;
      } catch {
        /* ignore */
      }
      if (event.event === "error" || payload?.type === "error") {
        sawAnyEvent = true;
        streamError =
          (payload as { error?: { message?: string } })?.error?.message ??
          "Image generation failed";
        return;
      }
      if (
        event.event !== "image_generation.partial_image" &&
        event.event !== "image_generation.completed"
      )
        return;
      if (!payload) return;
      sawAnyEvent = true;
      const isFinal = event.event === "image_generation.completed";
      const { b64_json, mimeType, provider } = payload as {
        b64_json: string;
        mimeType?: string;
        provider?: string;
      };

      const p = normalizeGeneratedImage(b64_json, mimeType, provider, journal).then((dataUrl) => {
        flushSync(() => {
          onFrame(dataUrl, isFinal);
        });
      });
      pendingFrames.push(p);

      if (isFinal) sawCompleted = true;
    },
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  await Promise.all(pendingFrames);

  if (streamError) throw new Error(streamError);

  if (!sawAnyEvent) {
    const replay = await fetch("/api/generate-abstract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, stream: false, journal, colorScheme }),
    });
    if (!replay.ok) throw new Error(`Image generation failed: ${replay.status}`);
    const json = (await replay.json()) as {
      data?: { b64_json?: string; mimeType?: string; provider?: string }[];
    };
    const item = json.data?.[0];
    if (!item?.b64_json) throw new Error("Image generation returned no image");
    const dataUrl = await normalizeGeneratedImage(
      item.b64_json,
      item.mimeType,
      item.provider,
      journal,
    );
    onFrame(dataUrl, true);
    return;
  }
  if (!sawCompleted) throw new Error("Image stream ended without a completed event");
}
