import { createFileRoute } from "@tanstack/react-router";
import { parseAndAuditReaction } from "@/lib/reaction-parser";
import { validateSmiles } from "@/lib/smiles-validator";
import { lookupPubChemUniversal } from "@/lib/pubchem-service";

export const Route = createFileRoute("/api/reaction-validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            text?: string;
            smiles?: string;
            compoundQuery?: string;
          };

          // 1. If compoundQuery is requested, do universal PubChem lookup
          if (body.compoundQuery) {
            const pubchemData = await lookupPubChemUniversal(body.compoundQuery);
            return new Response(JSON.stringify({ success: true, compound: pubchemData }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          // 2. If single SMILES validation requested
          if (body.smiles && !body.text) {
            const result = validateSmiles(body.smiles);
            const pubchemMatch = await lookupPubChemUniversal(body.smiles);
            return new Response(
              JSON.stringify({ success: true, validation: result, pubchem: pubchemMatch }),
              {
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // 3. Complete reaction audit
          const text = body.text || "";
          if (text) {
            try {
              const fs = await import("node:fs");
              fs.writeFileSync(
                "./user-inputs.log",
                `\n[VALIDATE ${new Date().toISOString()}] (len: ${text.length})\n${text}\n`,
                { flag: "a" },
              );
              fs.writeFileSync(
                "/tmp/user-input.log",
                `\n[VALIDATE ${new Date().toISOString()}] (len: ${text.length})\n${text}\n`,
                { flag: "a" },
              );
            } catch {
              /* ignore */
            }
          }
          const audit = await parseAndAuditReaction(text);

          return new Response(JSON.stringify({ success: true, audit }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Reaction validation API error:", err);
          return new Response(
            JSON.stringify({
              error: "validation_failed",
              message: err instanceof Error ? err.message : String(err),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
