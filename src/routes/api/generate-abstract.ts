import fs from "node:fs";
import { createFileRoute } from "@tanstack/react-router";
import { buildAbstractPrompt, buildStructuredSceneDescription } from "@/lib/abstract-prompt";
import type { JournalId, ColorSchemeId } from "@/lib/journal-standards";
import {
  generateAbstractImage,
  ProviderError,
  type ProviderImageResult,
} from "@/lib/image-provider";

export const Route = createFileRoute("/api/generate-abstract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const {
          text,
          stream = true,
          journal = "acs",
          colorScheme = "academic-clean",
        } = (await request.json()) as {
          text?: string;
          stream?: boolean;
          journal?: JournalId;
          colorScheme?: ColorSchemeId;
        };

        if (text) {
          try {
            fs.writeFileSync(
              "/tmp/recent-inputs.log",
              `[${new Date().toISOString()}] (len: ${text.length})\n${text}\n----------------------------------------\n`,
              { flag: "a" },
            );
            fs.writeFileSync(
              "./user-inputs.log",
              `\n[GENERATE ${new Date().toISOString()}] (len: ${text.length})\n${text}\n`,
              { flag: "a" },
            );
            fs.writeFileSync(
              "/tmp/user-input.log",
              `\n[GENERATE ${new Date().toISOString()}] (len: ${text.length})\n${text}\n`,
              { flag: "a" },
            );
          } catch {
            /* ignore */
          }
        }

        if (!text || text.trim().length < 3) {
          return new Response(JSON.stringify({ error: "text_too_short" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let image: ProviderImageResult;
        try {
          image = await generateAbstractImage(text, { text, journal, colorScheme });
        } catch (err) {
          console.error("Image generation failed:", err instanceof Error ? err.message : err);
          const status = err instanceof ProviderError ? err.status : 502;
          return new Response("Image generation failed, please try again", { status });
        }

        const imageHeaders = {
          "Content-Type": "application/json",
          "X-Image-Provider": image.provider,
          "X-Image-Bytes": String(image.b64_json.length),
        };

        if (!stream) {
          return new Response(
            JSON.stringify({
              data: [
                {
                  b64_json: image.b64_json,
                  mimeType: image.mimeType,
                  provider: image.provider,
                },
              ],
            }),
            { headers: imageHeaders },
          );
        }

        const encoder = new TextEncoder();
        const body = new ReadableStream({
          start(controller) {
            const payload = JSON.stringify({
              type: "image_generation.completed",
              b64_json: image.b64_json,
              mimeType: image.mimeType,
              provider: image.provider,
            });
            controller.enqueue(
              encoder.encode(`event: image_generation.completed\ndata: ${payload}\n\n`),
            );
            controller.close();
          },
        });

        return new Response(body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Image-Provider": image.provider,
            "X-Image-Bytes": String(image.b64_json.length),
          },
        });
      },
    },
  },
});
