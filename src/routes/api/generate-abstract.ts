import { createFileRoute } from "@tanstack/react-router";
import { buildAbstractPrompt } from "@/lib/abstract-prompt";
import { generateAbstractImage, ProviderError, type ProviderImageResult } from "@/lib/image-provider";


/**
 * Swappable image-generation endpoint.
 * The AI provider itself lives in `src/lib/image-provider.ts` — this route
 * only builds the prompt, calls that provider, and shapes the response into
 * the exact contract the frontend (`src/lib/streamImage.ts`) already expects.
 * Nothing in the frontend needs to change when the provider changes.
 */
export const Route = createFileRoute("/api/generate-abstract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, stream = true } = (await request.json()) as {
          text?: string;
          stream?: boolean;
        };

        if (!text || text.trim().length < 40) {
          return new Response(JSON.stringify({ error: "text_too_short" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let image: ProviderImageResult;
        try {
          image = await generateAbstractImage(buildAbstractPrompt(text.slice(0, 4000)));
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
          return new Response(JSON.stringify({ data: [{ b64_json: image.b64_json }] }), {
            headers: imageHeaders,
          });
        }


        // Emit a single "completed" SSE event — Gemini returns the finished
        // image in one shot, so there are no incremental "partial_image"
        // frames to forward. The frontend already treats a lone completed
        // event as a valid, successful stream (see streamImage.ts).
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          start(controller) {
            const payload = JSON.stringify({
              type: "image_generation.completed",
              b64_json: image.b64_json,
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
