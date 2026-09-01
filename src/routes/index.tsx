import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, FlaskConical, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { MolecularBackground } from "@/components/MolecularBackground";
import { useI18n } from "@/lib/i18n";
import { streamAbstract } from "@/lib/streamImage";
import { useAuth } from "@/lib/auth";
import { useUsage } from "@/lib/use-usage";
import { supabase } from "@/integrations/supabase/client";
import {
  REGEN_LIMIT,
  countRegenerations,
  createGeneration,
  isRegenLimitError,
  loadLatestOriginal,
} from "@/lib/generations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChemAbstract — Graphical Abstract Generator for Chemistry" },
      {
        name: "description",
        content:
          "Generate a publication-style graphical abstract from your chemistry paper text or reaction description. English & Persian.",
      },
      { property: "og:title", content: "ChemAbstract — Graphical Abstract Generator for Chemistry" },
      {
        property: "og:description",
        content:
          "Generate a publication-style graphical abstract from your chemistry paper text or reaction description. English & Persian.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

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

/** Daily-quota bookkeeping row — unchanged, originals only. */
async function saveAbstract(userId: string, dataUrl: string, text: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/${Date.now()}.png`;
  const up = await supabase.storage.from("abstracts").upload(path, blob, {
    contentType: "image/png",
  });
  await supabase.from("abstracts").insert({
    user_id: userId,
    title: text.trim().slice(0, 70),
    source_text: text.trim().slice(0, 4000),
    image_path: up.error ? null : path,
  });
}

function Index() {
  const { t, dir } = useI18n();
  const { user, loading: authLoading, sessionError, retrySession, ensureSession } = useAuth();
  const { isGuest, used, limit, remaining, record } = useUsage();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [regenUsed, setRegenUsed] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  const quotaReached = remaining <= 0;
  const guestBlocked = isGuest && quotaReached;
  const regenRemaining = Math.max(0, REGEN_LIMIT - regenUsed);
  const regenExhausted = regenRemaining <= 0;
  const busy = loading || regenerating || retrying;


  // Restore the latest original and its regeneration count after a refresh.
  useEffect(() => {
    if (!user) {
      setGenerationId(null);
      setRegenUsed(0);
      return;
    }
    let active = true;
    void loadLatestOriginal(user.id).then((res) => {
      if (!active || !res) return;
      setGenerationId(res.generation.id);
      setRegenUsed(res.regenUsed);
      setText((prev) => prev || (res.generation.source_text ?? ""));
      if (res.imageUrl) {
        setImage(res.imageUrl);
        setIsFinal(true);
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleGenerate() {
    if (busy || noSession) return;
    setError(null);
    if (text.trim().length < 40) {
      setError(t("error.tooShort"));
      return;
    }
    if (quotaReached) {
      setError(t("quota.reached", { max: limit }));
      return;
    }
    setLoading(true);
    setImage(null);
    setIsFinal(false);
    setGenerationId(null);
    setRegenUsed(0);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    let finalImage: string | null = null;
    try {
      await streamAbstract(text, (dataUrl, final) => {
        setImage(dataUrl);
        if (final) {
          finalImage = dataUrl;
          setIsFinal(true);
        }
      });
      if (user && finalImage) {
        await saveAbstract(user.id, finalImage, text);
        const row = await createGeneration({ userId: user.id, dataUrl: finalImage, text });
        setGenerationId(row.id);
        setRegenUsed(0);
      }
      await record();
    } catch {
      setError(t("error.failed"));
    } finally {
      setLoading(false);
    }
  }

  /**
   * Regenerate is independent of the daily quota: it never calls record() and
   * never writes an `abstracts` row. The 3-attempt limit is enforced by the
   * `create_generation` database function; UI state is only a mirror of it.
   */
  async function handleRegenerate() {
    if (busy || regenExhausted || noSession) return;
    setError(null);
    setRegenerating(true);
    setIsFinal(false);
    let finalImage: string | null = null;
    try {
      await streamAbstract(text, (dataUrl, final) => {
        setImage(dataUrl);
        if (final) {
          finalImage = dataUrl;
          setIsFinal(true);
        }
      });
      if (!finalImage) throw new Error("no_image");
      if (user && generationId) {
        try {
          await createGeneration({
            userId: user.id,
            dataUrl: finalImage,
            text,
            parentId: generationId,
          });
          setRegenUsed(await countRegenerations(generationId));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          if (isRegenLimitError(msg)) {
            setRegenUsed(REGEN_LIMIT);
            setError(t("regen.exhausted"));
          } else {
            throw e;
          }
        }
      }
    } catch {
      setIsFinal(true);
      setError(t("error.failed"));
    } finally {
      setRegenerating(false);
    }
  }

  function handleDownload() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = "graphical-abstract.png";
    a.click();
  }

  /**
   * The image model returns raster PNG data only (no vector source), so the
   * "editable" affordance is opening the full-resolution image in a new tab.
   */
  function handleOpenFullRes() {
    if (!image) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<title>graphical-abstract</title><body style="margin:0;background:#111"><img src="${image}" style="max-width:100%;height:auto;display:block;margin:auto" /></body>`,
    );
    win.document.close();
  }

  return (
    <div className="relative min-h-screen font-sans" dir={dir}>
      <MolecularBackground />
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="sr-only">
          {t("app.name")} — {t("app.tagline")}
        </h1>

        {isGuest && showBanner && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent-strong/30 bg-card/90 px-4 py-3 shadow-card">
            <Sparkles className="size-4 text-accent-strong" aria-hidden />
            <p className="text-sm text-foreground">{t("banner.text")}</p>
            <div className="ms-auto flex items-center gap-2">
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("quota.signUpCta")}
                </Link>
              </Button>
              <button
                onClick={() => setShowBanner(false)}
                aria-label={t("banner.dismiss")}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <label htmlFor="source" className="text-sm font-medium text-foreground">
              {t("input.label")}
            </label>
            <textarea
              id="source"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4000}
              rows={12}
              placeholder={t("input.placeholder")}
              className="mt-2 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("input.hint")}</span>
              <span>
                {text.length} {t("input.chars")}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={busy || quotaReached}
                className="w-full sm:w-auto"
              >
                <Sparkles className="size-4" aria-hidden />
                {loading ? t("generating") : t("generate")}
              </Button>

              <span className="text-xs text-muted-foreground">
                {quotaReached
                  ? t("quota.reached", { max: limit })
                  : t("quota.remaining", { n: remaining, max: limit })}
              </span>
            </div>

            {guestBlocked && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("quota.signUpCta")}
                </Link>
              </Button>
            )}

            {sessionError && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
                <p>{t("session.error")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={retrying}
                  onClick={async () => {
                    setRetrying(true);
                    try {
                      await retrySession();
                    } finally {
                      setRetrying(false);
                    }
                  }}
                >
                  {t("session.retry")}
                </Button>
              </div>
            )}


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
            className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">{t("output.title")}</h2>
              {image && isFinal && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={busy || regenExhausted}
                  >
                    {regenerating ? t("generating") : t("output.regenerate")}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {regenExhausted ? t("regen.exhausted") : t("regen.left", { n: regenRemaining })}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleOpenFullRes}>
                    <ExternalLink className="size-4" aria-hidden />
                    {t("output.fullRes")}
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="size-4" aria-hidden />
                    {t("output.download")}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-3 flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
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
            {!isGuest && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("menu.plan.usage", { used, max: limit })}
              </p>
            )}
          </section>
        </div>

        <footer className="mt-6 rounded-2xl border border-border bg-secondary/70 p-4 text-sm sm:p-5">
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
