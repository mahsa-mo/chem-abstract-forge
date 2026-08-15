import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, FlaskConical, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, locales, type Locale } from "@/lib/i18n";
import { streamAbstract } from "@/lib/streamImage";
import { DAILY_LIMIT, recordUse, remainingToday } from "@/lib/usage-quota";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChemAbstract — Graphical Abstract Generator for Chemistry" },
      {
        name: "description",
        content:
          "Generate a publication-style graphical abstract from your chemistry paper text or reaction description. English & Persian.",
      },
      { property: "og:title", content: "ChemAbstract — Graphical Abstract Generator" },
      {
        property: "og:description",
        content:
          "Paste a paper excerpt or reaction description and get a clean scientific graphical abstract in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
      role="group"
      aria-label={t("lang.switch")}
    >
      <Languages className="mx-1 size-4 text-muted-foreground" aria-hidden />
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code as Locale)}
          aria-pressed={locale === l.code}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            locale === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function LoadingState() {
  const { t } = useI18n();
  const messages = ["loading.1", "loading.2", "loading.3", "loading.4", "loading.5"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % messages.length), 2600);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative size-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent-strong/25" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full border border-border bg-card">
          <FlaskConical className="size-5 animate-pulse text-accent-strong" aria-hidden />
        </span>
      </div>
      <p key={i} className="animate-in fade-in text-sm text-muted-foreground">
        {t(messages[i] ?? "loading.1")}
      </p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[shimmer_1.6s_ease-in-out_infinite] rounded-full bg-accent-strong" />
      </div>
    </div>
  );
}

function Index() {
  const { t, dir } = useI18n();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRemaining(remainingToday()), []);

  async function handleGenerate() {
    setError(null);
    if (text.trim().length < 40) {
      setError(t("error.tooShort"));
      return;
    }
    if (remaining <= 0) {
      setError(t("quota.reached", { max: DAILY_LIMIT }));
      return;
    }
    setLoading(true);
    setImage(null);
    setIsFinal(false);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      await streamAbstract(text, (dataUrl, final) => {
        setImage(dataUrl);
        if (final) setIsFinal(true);
      });
      recordUse();
      setRemaining(remainingToday());
    } catch {
      setError(t("error.failed"));
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = "graphical-abstract.png";
    a.click();
  }

  return (
    <div className="min-h-screen bg-background font-sans" dir={dir}>
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FlaskConical className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">{t("app.name")}</p>
              <p className="max-w-md text-sm text-muted-foreground">{t("app.tagline")}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="sr-only">{t("app.name")} — {t("app.tagline")}</h1>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
          <label htmlFor="source" className="text-sm font-medium text-foreground">
            {t("input.label")}
          </label>
          <textarea
            id="source"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4000}
            rows={9}
            placeholder={t("input.placeholder")}
            className="mt-2 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{t("input.hint")}</span>
            <span>
              {text.length} {t("input.chars")}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={loading || remaining <= 0}
              className="w-full sm:w-auto"
            >
              <Sparkles className="size-4" aria-hidden />
              {loading ? t("generating") : t("generate")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {remaining > 0
                ? t("quota.remaining", { n: remaining, max: DAILY_LIMIT })
                : t("quota.reached", { max: DAILY_LIMIT })}
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </section>

        <section
          ref={outputRef}
          className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">{t("output.title")}</h2>
            {image && isFinal && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                  {t("output.regenerate")}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="size-4" aria-hidden />
                  {t("output.download")}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
            {image ? (
              <img
                src={image}
                alt={t("output.title")}
                className={`h-auto w-full transition-[filter] duration-500 ${
                  isFinal ? "blur-0" : "blur-xl"
                }`}
              />
            ) : loading ? (
              <LoadingState />
            ) : (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                {t("output.empty")}
              </p>
            )}
          </div>
        </section>

        <footer className="mt-8 rounded-2xl border border-border bg-secondary/60 p-4 text-sm sm:p-5">
          <p className="font-medium text-foreground">{t("beta.title")}</p>
          <p className="mt-1 text-muted-foreground">{t("beta.body")}</p>
          <a
            href="mailto:feedback@chemabstract.app?subject=ChemAbstract%20feedback"
            className="mt-2 inline-block font-medium text-accent-strong underline-offset-4 hover:underline"
          >
            {t("beta.cta")}
          </a>
        </footer>
      </main>
    </div>
  );
}
