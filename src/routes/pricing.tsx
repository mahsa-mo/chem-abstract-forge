import { MolecularCanvas3D } from "@/components/MolecularCanvas3D";
import { MolecularBackground } from "@/components/MolecularBackground";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ChemAbstract graphical abstract generator" },
      {
        name: "description",
        content:
          "ChemAbstract pricing: 3 free graphical abstracts per day, or go Pro for unlimited generations, higher quality and priority processing.",
      },
      { property: "og:title", content: "Pricing — ChemAbstract" },
      {
        property: "og:description",
        content:
          "Free plan with 3 generations per day, plus an upcoming Pro plan for unlimited use.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <Check className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function PricingPage() {
  const { t, dir } = useI18n();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen font-sans" dir={dir}>
      <MolecularCanvas3D />
      <MolecularBackground />
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/80 text-xs font-mono text-muted-foreground mb-3">
            <ShieldCheck className="size-3.5 text-accent-strong" />
            <span>Academic & Industrial Lab Licensing</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
            {t("pricing.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free Academic Tier */}
          <section className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-md p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {t("pricing.free")}
                </h2>
                <span className="text-xs font-mono text-muted-foreground uppercase px-2 py-0.5 rounded bg-secondary">
                  Community
                </span>
              </div>
              <p className="mt-3">
                <span className="text-4xl font-display font-bold text-foreground">
                  {t("pricing.free.price")}
                </span>{" "}
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {t("pricing.free.period")}
                </span>
              </p>
              <ul className="mt-6 space-y-3">
                <Feature>{t("pricing.free.f1")}</Feature>
                <Feature>{t("pricing.free.f2")}</Feature>
                <Feature>{t("pricing.free.f3")}</Feature>
              </ul>
            </div>

            <div className="mt-8">
              {user ? (
                <Button variant="outline" className="w-full" disabled>
                  {t("pricing.free.cta")}
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    {t("auth.signUp")}
                  </Link>
                </Button>
              )}
            </div>
          </section>

          {/* Pro Laboratory Tier */}
          <section className="relative rounded-2xl border-2 border-accent-strong/40 bg-card/90 backdrop-blur-md p-6 shadow-card flex flex-col justify-between">
            <span className="absolute end-4 top-4 rounded-full bg-accent/80 border border-accent-strong/30 px-3 py-1 text-xs font-mono font-semibold text-accent-foreground flex items-center gap-1">
              <Zap className="size-3" />
              {t("pricing.badge")}
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {t("pricing.pro")}
                </h2>
              </div>
              <p className="mt-3">
                <span className="text-4xl font-display font-bold text-foreground">
                  {t("pricing.pro.price")}
                </span>{" "}
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {t("pricing.pro.period")}
                </span>
              </p>
              <ul className="mt-6 space-y-3">
                <Feature>{t("pricing.pro.f1")}</Feature>
                <Feature>{t("pricing.pro.f2")}</Feature>
                <Feature>{t("pricing.pro.f3")}</Feature>
                <Feature>{t("pricing.pro.f4")}</Feature>
              </ul>
            </div>

            <div className="mt-8">
              <Button className="btn-gradient w-full font-display" disabled>
                <Sparkles className="size-4 mr-1.5" />
                {t("pricing.pro.cta")}
              </Button>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-xs font-mono text-muted-foreground">
          {t("pricing.note")}
        </p>
      </main>
    </div>
  );
}
