import { createFileRoute } from "@tanstack/react-router";
import { lookupChemicalCompound, type ChemicalCompoundData } from "@/lib/chemical-service";

export type { ChemicalCompoundData };

export const Route = createFileRoute("/api/chemical-lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { query } = (await request.json()) as { query?: string };
          if (!query || query.trim().length === 0) {
            return new Response(JSON.stringify({ error: "query_required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const compound = await lookupChemicalCompound(query);
          if (compound) {
            return new Response(JSON.stringify({ data: compound }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(
            JSON.stringify({
              error: "compound_not_found",
              message:
                "ترکیب شیمیایی مورد نظر یافت نشد. لطفاً نام انگلیسی یا کد CAS را امتحان کنید.",
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("Chemical lookup error:", err);
          return new Response(JSON.stringify({ error: "server_error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
