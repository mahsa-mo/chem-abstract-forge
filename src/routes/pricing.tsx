import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
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
        content: "Free plan with 3 generations per day, plus an upcoming Pro plan for unlimited use.",
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
    <div className="molecular-bg min-h-screen bg-background font-sans" dir={dir}>
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("pricing.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("pricing.subtitle")}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">{t("pricing.free")}</h2>
            <p className="mt-1">
              <span className="text-3xl font-semibold text-foreground">{t("pricing.free.price")}</span>{" "}
              <span className="text-sm text-muted-foreground">{t("pricing.free.period")}</span>
            </p>
            <ul className="mt-4 space-y-2">
              <Feature>{t("pricing.free.f1")}</Feature>
              <Feature>{t("pricing.free.f2")}</Feature>
              <Feature>{t("pricing.free.f3")}</Feature>
            </ul>
            {user ? (
              <Button variant="outline" className="mt-5 w-full" disabled>
                {t("pricing.free.cta")}
              </Button>
            ) : (
              <Button asChild className="mt-5 w-full">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("auth.signUp")}
                </Link>
              </Button>
            )}
          </section>

          <section className="relative rounded-2xl border border-accent-strong/40 bg-card p-5 shadow-card">
            <span className="absolute end-4 top-4 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {t("pricing.badge")}
            </span>
            <h2 className="text-lg font-semibold text-foreground">{t("pricing.pro")}</h2>
            <p className="mt-1">
              <span className="text-3xl font-semibold text-foreground">{t("pricing.pro.price")}</span>{" "}
              <span className="text-sm text-muted-foreground">{t("pricing.pro.period")}</span>
            </p>
            <ul className="mt-4 space-y-2">
              <Feature>{t("pricing.pro.f1")}</Feature>
              <Feature>{t("pricing.pro.f2")}</Feature>
              <Feature>{t("pricing.pro.f3")}</Feature>
              <Feature>{t("pricing.pro.f4")}</Feature>
            </ul>
            <Button className="mt-5 w-full" disabled>
              {t("pricing.pro.cta")}
            </Button>
          </section>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{t("pricing.note")}</p>
      </main>
    </div>
  );
}
