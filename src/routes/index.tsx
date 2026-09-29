import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  FlaskConical,
  Pencil,
  Sparkles,
  Upload,
  X,
  Atom,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Maximize2,
  BookOpen,
  History,
  Gift,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageEditor, type EditorState, type EditorTool } from "@/components/ImageEditor";
import { EditingSuite } from "@/components/EditingSuite";
import { AppHeader } from "@/components/AppHeader";
import { FlaskLogo } from "@/components/FlaskLogo";
import { TheFeelingSection, ColorPaletteInspector } from "@/components/DesignSystemShowcase";
import { MolecularBackground } from "@/components/MolecularBackground";
import { MolecularCanvas3D } from "@/components/MolecularCanvas3D";
import { MolecularWorkspaceViewer3D } from "@/components/MolecularWorkspaceViewer3D";
import { RecentReactionsDrawer } from "@/components/RecentReactionsDrawer";
import { ReactionArrow } from "@/components/ReactionArrow";
import { useI18n } from "@/lib/i18n";
import { streamAbstract } from "@/lib/streamImage";
import { useAuth } from "@/lib/auth";
import { useUsage } from "@/lib/use-usage";
import { supabase } from "@/integrations/supabase/client";
import {
  loadRecentReactions,
  saveRecentReaction,
  type RecentReaction,
} from "@/lib/recent-reactions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  REGEN_LIMIT,
  countRegenerations,
  createGeneration,
  isRegenLimitError,
  loadLatestOriginal,
} from "@/lib/generations";

const QUICK_SYMBOLS = ["→", "⇌", "⇄", "Δ", "hν", "α", "β", "°C", "Å", "kcal/mol", "ee%"];

const SAMPLE_REACTIONS = [
  {
    key: "workspace.preset.coupling",
    title: "Suzuki Cross-Coupling",
    text: "Palladium-catalyzed Suzuki-Miyaura cross-coupling: 4-bromoanisole (1.0 equiv) reacts with phenylboronic acid (1.2 equiv) in the presence of Pd(PPh3)4 (5 mol%) and K2CO3 (2.0 equiv) in DMF/H2O (4:1) at 80 °C for 6 h to afford 4-methoxybiphenyl in 92% yield.",
  },
  {
    key: "workspace.preset.photoredox",
    title: "Photoredox Functionalization",
    text: "Visible-light-mediated photoredox functionalization: [Ir(dF(CF3)ppy)2(dtbbpy)]PF6 photocatalyst (1 mol%) under 450 nm blue LED irradiation couples quinuclidine with diethyl bromomalonate in acetonitrile at room temperature, affording α-alkylated product with 86% selectivity.",
  },
  {
    key: "workspace.preset.aldol",
    title: "Enantioselective Aldol",
    text: "Asymmetric direct aldol reaction: cyclohexanone and 4-nitrobenzaldehyde react with 20 mol% L-proline catalyst in DMSO at 25 °C for 24 h to produce (2S,1'R)-2-(hydroxy(4-nitrophenyl)methyl)cyclohexan-1-one in 88% yield and 96% enantiomeric excess (ee).",
  },
  {
    key: "workspace.preset.ester",
    title: "Fischer Esterification",
    text: "Acid-catalyzed Fischer esterification: salicylic acid is heated under reflux with excess acetic anhydride in the presence of concentrated sulfuric acid catalyst (5 drops) at 85 °C for 30 minutes, precipitating acetylsalicylic acid (aspirin) and acetic acid byproduct upon cooling.",
  },
];

const CPK_ELEMENTS = [
  { symbol: "C", name: "Carbon", bg: "#334155" },
  { symbol: "O", name: "Oxygen", bg: "#e11d48" },
  { symbol: "N", name: "Nitrogen", bg: "#2563eb" },
  { symbol: "H", name: "Hydrogen", bg: "#94a3b8" },
  { symbol: "S", name: "Sulfur", bg: "#d97706" },
  { symbol: "P", name: "Phosphorus", bg: "#ea580c" },
  { symbol: "Pd", name: "Catalyst", bg: "#0891b2" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChemAbstract — Graphical Abstract Generator for Chemistry" },
      {
        name: "description",
        content:
          "Generate a publication-style graphical abstract from your chemistry paper text or reaction description. English & Persian.",
      },
      {
        property: "og:title",
        content: "ChemAbstract — Graphical Abstract Generator for Chemistry",
      },
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
  const { t, dir, locale } = useI18n();
  const isRtl = locale === "fa" || dir === "rtl";
  const { user, sessionError, retrySession, ensureSession } = useAuth();
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
  const [editing, setEditing] = useState(false);
  const [selectedEditorTool, setSelectedEditorTool] = useState<EditorTool>("pencil");
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [previewTab, setPreviewTab] = useState<"abstract" | "editor" | "3d" | "guidelines">(
    "abstract",
  );
  const [probedElement, setProbedElement] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quotaReached = remaining <= 0;
  const guestBlocked = isGuest && quotaReached;
  const regenRemaining = Math.max(0, REGEN_LIMIT - regenUsed);
  const regenExhausted = regenRemaining <= 0;
  const busy = loading || regenerating || retrying;

  // Sync recent reactions count
  useEffect(() => {
    void loadRecentReactions(user?.id).then((list) => {
      setHistoryCount(list.length);
    });
  }, [user, historyRefresh]);

  function handleSelectReaction(reaction: RecentReaction) {
    setText(reaction.sourceText);
    setImage(reaction.imageUrl);
    setIsFinal(true);
    setGenerationId(reaction.id.startsWith("sample-") ? null : reaction.id);
    setRegenUsed(reaction.regenCount ?? 0);
    setEditing(false);
    setEditorState(null);
    setError(null);
    toast.success(t("history.loaded"), {
      description: reaction.title,
    });
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Quick insert chemical symbol at cursor position or end of text
  function handleInsertSymbol(sym: string) {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart ?? text.length;
      const end = el.selectionEnd ?? text.length;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const inserted = (before.endsWith(" ") || before === "" ? "" : " ") + sym + " ";
      const nextText = before + inserted + after;
      setText(nextText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + inserted.length, start + inserted.length);
      }, 0);
    } else {
      setText((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + sym + " ");
    }
  }

  function handleApplyPreset(sampleText: string) {
    setText(sampleText);
    setError(null);
  }

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
    if (busy) return;
    setError(null);
    if (text.trim().length < 40) {
      setError(t("error.tooShort"));
      return;
    }
    if (quotaReached) {
      setError(t("quota.reached", { max: limit }));
      return;
    }
    // No usable session yet (cold start or a transient network drop): retry now
    // instead of leaving the button in a permanently dead state.
    if (!user) {
      setRetrying(true);
      const ok = await ensureSession();
      setRetrying(false);
      if (!ok) {
        setError(t("session.error"));
        return;
      }
    }
    setLoading(true);

    setImage(null);
    setIsFinal(false);
    setGenerationId(null);
    setRegenUsed(0);
    setEditing(false);
    setEditorState(null);
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
      if (finalImage) {
        if (user) {
          await saveAbstract(user.id, finalImage, text);
          const row = await createGeneration({ userId: user.id, dataUrl: finalImage, text });
          setGenerationId(row.id);
          setRegenUsed(0);
          saveRecentReaction({
            id: row.id,
            title: text.trim().slice(0, 55),
            sourceText: text.trim(),
            imageUrl: finalImage,
            createdAt: new Date().toISOString(),
            regenCount: 0,
            tags: ["Laboratory Generated", "16:9 TOC"],
          });
        } else {
          const guestId = `guest-${Date.now()}`;
          setGenerationId(guestId);
          setRegenUsed(0);
          saveRecentReaction({
            id: guestId,
            title: text.trim().slice(0, 55),
            sourceText: text.trim(),
            imageUrl: finalImage,
            createdAt: new Date().toISOString(),
            regenCount: 0,
            tags: ["Guest Session", "16:9 TOC"],
          });
        }
        setHistoryRefresh((v) => v + 1);
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
    if (busy || regenExhausted) return;
    setError(null);
    if (!user) {
      setRetrying(true);
      const ok = await ensureSession();
      setRetrying(false);
      if (!ok) {
        setError(t("session.error"));
        return;
      }
    }
    setRegenerating(true);
    setIsFinal(false);
    setEditing(false);
    setEditorState(null);

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
      if (finalImage) {
        saveRecentReaction({
          id: generationId ? `${generationId}-regen-${Date.now()}` : `regen-${Date.now()}`,
          title: `${text.trim().slice(0, 45)} (Regeneration)`,
          sourceText: text.trim(),
          imageUrl: finalImage,
          createdAt: new Date().toISOString(),
          regenCount: (regenUsed || 0) + 1,
          tags: ["Regenerated", "16:9 TOC"],
        });
        setHistoryRefresh((v) => v + 1);
      }
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
    <div className="relative min-h-screen font-sans selection:bg-accent-strong/20" dir={dir}>
      <MolecularCanvas3D />
      <MolecularBackground />
      <AppHeader onOpenHistory={() => setHistoryOpen(true)} historyCount={historyCount} />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <h1 className="sr-only">
          {t("app.name")} — {t("app.tagline")}
        </h1>

        {isGuest && showBanner && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#4F46E5]/25 bg-card/90 backdrop-blur-md px-4 py-2.5 shadow-2xs text-xs">
            <div className="size-7 rounded-lg bg-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5] shrink-0">
              <Gift className="size-4" aria-hidden />
            </div>
            <p className="text-foreground font-medium">{t("banner.text")}</p>
            <div className="ms-auto flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="h-7 text-xs font-semibold bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#EC4899] text-white shadow-xs hover:opacity-95"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("quota.signUpCta")}
                </Link>
              </Button>
              <button
                onClick={() => setShowBanner(false)}
                aria-label={t("banner.dismiss")}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* Main Side-by-Side Scientific Workspace */}
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          {/* Reactant Source Console */}
          <section className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 shadow-card sm:p-5 flex flex-col transition-all">
            {/* Header: Label + System Availability / Status + Remaining Chances placed together next to input box */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label
                htmlFor="source"
                className="font-display text-sm font-bold text-foreground flex items-center gap-2"
              >
                <div className="size-6 rounded-md bg-[#06B6D4]/15 flex items-center justify-center text-[#06B6D4]">
                  <FileText className="size-3.5" aria-hidden />
                </div>
                <span>{t("input.label")}</span>
              </label>

              {/* System Availability / Status and Remaining Generations placed directly beside the input box */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/70 border border-border/70">
                  <span
                    className={`size-2 rounded-full ring-2 ${
                      loading
                        ? "bg-[#F59E0B] ring-[#F59E0B]/25 animate-pulse"
                        : isFinal
                          ? "bg-[#10B981] ring-[#10B981]/25"
                          : "bg-[#10B981] ring-[#10B981]/15"
                    }`}
                  />
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {loading ? "Computing..." : isFinal ? "Abstract Ready" : "Ready"}
                  </span>
                </div>

                {/* Remaining Chances Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/70 border border-border/70">
                  <span className="text-[11px] text-muted-foreground">Chances:</span>
                  <span
                    className={`font-semibold tabular-nums text-[11px] ${
                      quotaReached ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {quotaReached
                      ? t("quota.reached", { max: limit })
                      : t("quota.remaining", { n: remaining, max: limit })}
                  </span>
                </div>
              </div>
            </div>

            {/* Presets and Quick Symbols Bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {t("workspace.presets")}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {SAMPLE_REACTIONS.map((sample) => (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={() => handleApplyPreset(sample.text)}
                      className="px-2 py-0.5 rounded text-[11px] bg-secondary/80 hover:bg-accent hover:text-accent-foreground text-foreground transition-colors font-medium border border-border/70"
                      title={sample.title}
                    >
                      {sample.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Symbol Inserter */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0 me-1 hidden sm:inline">
                  {t("workspace.symbols")}:
                </span>
                <div className="flex items-center gap-1">
                  {QUICK_SYMBOLS.slice(0, 7).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleInsertSymbol(sym)}
                      className="px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-card text-foreground font-mono text-xs border border-border/70 hover:border-accent-strong transition-all shadow-2xs"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              id="source"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4000}
              rows={11}
              placeholder={t("input.placeholder")}
              className="w-full resize-y rounded-xl border border-input/90 bg-background/90 p-3.5 text-sm leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring font-sans"
            />

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-[11px]">{t("input.hint")}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums">
                  {text.length} / 4000 {t("input.chars")}
                </span>
                <span
                  className={`inline-block size-2 rounded-full ${
                    text.length >= 40
                      ? "bg-emerald-500"
                      : text.length > 0
                        ? "bg-amber-500"
                        : "bg-muted-foreground/30"
                  }`}
                />
              </div>
            </div>

            {/* Primary Generation & Remaining Generations Bar positioned directly together */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={busy || quotaReached}
                  className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] text-white font-display text-sm font-bold shadow-md hover:shadow-lg transition-all h-10 px-5 hover:opacity-95"
                >
                  <Sparkles className="size-4 shrink-0 me-1.5" aria-hidden />
                  {loading ? t("generating") : t("generate")}
                </Button>

                {/* Remaining Generations Chances */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border/80 text-xs font-mono">
                  <span
                    className={`font-semibold tabular-nums ${
                      quotaReached ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {quotaReached
                      ? t("quota.reached", { max: limit })
                      : t("quota.remaining", { n: remaining, max: limit })}
                  </span>
                </div>

                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setText("")}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Recent Reactions history trigger shortcut */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                className="h-8 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground font-medium"
                title={t("history.revisit")}
              >
                <History className="size-3.5 text-[#06B6D4]" />
                <span>{t("history.title")}</span>
                {historyCount > 0 && (
                  <span className="ms-0.5 rounded-full bg-[#06B6D4]/15 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-[#06B6D4] border border-[#06B6D4]/30">
                    {historyCount}
                  </span>
                )}
              </Button>
            </div>

            {/* AI Disclaimer notice as in mockup */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/40 border border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
              <Info className="size-3.5 text-[#06B6D4] shrink-0" />
              <span>AI may make mistakes. Please review before use.</span>
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

          {/* Central Chemical Reaction Coordinate Connector */}
          <ReactionArrow />

          {/* Graphical Abstract Output Showcase — Visual Centerpiece */}
          <section
            ref={outputRef}
            className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-4 shadow-card sm:p-5 flex flex-col transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-md bg-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5]">
                  <FlaskConical className="size-3.5 text-[#06B6D4]" aria-hidden />
                </div>
                <h2 className="font-display text-sm font-bold text-foreground">
                  {t("output.title")}
                </h2>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground ms-1">
                  <span aria-hidden>·</span>
                  <span>16:9 TOC</span>
                </div>
              </div>

              {/* Action Toolbar when image is available */}
              {image && isFinal && (
                <div className="flex flex-wrap items-center gap-1.5 ms-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={busy || regenExhausted}
                    className="h-8 text-xs gap-1"
                  >
                    <RotateCcw className="size-3" aria-hidden />
                    {regenerating ? t("generating") : t("output.regenerate")}
                  </Button>
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                    ({regenUsed}/3)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenFullRes}
                    className="h-8 text-xs gap-1"
                  >
                    <Maximize2 className="size-3" aria-hidden />
                    {t("output.fullRes")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 text-xs gap-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  >
                    <Download className="size-3" aria-hidden />
                    {t("output.download")}
                  </Button>
                </div>
              )}

              {/* Universal View Switcher - ALWAYS VISIBLE: Abstract | Edit & Stationery Studio | 3D | Guidelines */}
              {!loading && (
                <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border text-xs ms-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTab("abstract");
                      setEditing(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      previewTab === "abstract" && !editing
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("output.title")}
                  </button>

                  {/* PROMINENT EDIT & STATIONERY BOX TAB */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTab("editor");
                      setEditing(true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      previewTab === "editor" || editing
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs"
                        : "text-[#4F46E5] dark:text-[#818CF8] bg-[#4F46E5]/15 hover:bg-[#4F46E5]/25 font-semibold border border-[#4F46E5]/30"
                    }`}
                  >
                    <Pencil className="size-3.5" />
                    <span>{isRtl ? "باکس ادیت و نوشت‌افزار" : "Edit & Stationery Studio"}</span>
                    <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[9px] font-mono font-bold leading-none">
                      {isRtl ? "ابزارها" : "NEW"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTab("3d");
                      setEditing(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      previewTab === "3d" && !editing
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("output.inspect3d")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTab("guidelines");
                      setEditing(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      previewTab === "guidelines" && !editing
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Guidelines
                  </button>
                </div>
              )}
            </div>

            {/* Display Viewport */}
            {previewTab === "editor" || editing ? (
              <ImageEditor
                src={image || "blank"}
                state={editorState}
                initialTool={selectedEditorTool}
                onStateChange={setEditorState}
                onClose={() => {
                  setEditing(false);
                  setPreviewTab("abstract");
                }}
                onSaveAsCurrent={(newImg) => {
                  setImage(newImg);
                  setIsFinal(true);
                  setEditing(false);
                  setPreviewTab("abstract");
                }}
              />
            ) : image ? (
              <div className="flex flex-col gap-3">
                <div className="group relative overflow-hidden rounded-xl border border-accent-strong/40 bg-muted/20 shadow-md">
                  <img
                    src={image}
                    alt={t("output.title")}
                    className={`h-auto w-full transition-[filter] duration-500 rounded-xl ${
                      isFinal ? "blur-0" : "blur-xl"
                    }`}
                  />

                  {/* Vertical 'Editing Suite' with icon buttons for Pencil, Eraser, Selection, and Clear */}
                  <EditingSuite
                    activeTool={
                      selectedEditorTool === "pencil"
                        ? "pencil"
                        : selectedEditorTool === "eraser"
                          ? "eraser"
                          : selectedEditorTool === "text-whiteout"
                            ? "selection"
                            : undefined
                    }
                    onSelectTool={(suiteTool) => {
                      const toolName = suiteTool === "selection" ? "text-whiteout" : suiteTool;
                      setSelectedEditorTool(toolName);
                      setPreviewTab("editor");
                      setEditing(true);
                      toast.info(
                        isRtl
                          ? `ابزار ${suiteTool === "pencil" ? "مداد" : suiteTool === "eraser" ? "پاک‌کن" : "انتخاب و حذف کادر"} فعال شد`
                          : `${suiteTool} tool armed`,
                      );
                    }}
                    onClear={() => {
                      if (editorState && editorState.history.length > 1) {
                        setEditorState({ history: [editorState.history[0]!], index: 0 });
                        toast.info(isRtl ? "ویرایش‌ها بازنشانی شدند" : "Edits cleared");
                      } else {
                        toast.info(isRtl ? "تغییری برای پاکسازی وجود ندارد" : "Nothing to clear");
                      }
                    }}
                    onOpenFullSuite={() => {
                      setPreviewTab("editor");
                      setEditing(true);
                    }}
                  />

                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity bg-background/85 backdrop-blur-md rounded-lg p-1 border border-border shadow-xs">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="h-7 text-xs gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium"
                    >
                      <Pencil className="size-3" />
                      {t("editor.stationery")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenFullRes}
                      className="h-7 text-xs gap-1 text-foreground"
                    >
                      <Maximize2 className="size-3" />
                      16:9 View
                    </Button>
                  </div>
                </div>

                {/* Chemical Spectrum / CPK Palette footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/70 text-xs">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    {t("output.palette")}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {CPK_ELEMENTS.map((el) => (
                      <span
                        key={el.symbol}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-foreground"
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: el.bg }}
                        />
                        <span>{el.symbol}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col gap-3">
                {/* Active 3D Reaction Transition Simulation during generation */}
                <MolecularWorkspaceViewer3D isGenerating={true} />
                <LoadingState />
              </div>
            ) : previewTab === "3d" ? (
              <div className="flex flex-col gap-2">
                {/* Interactive 3D Precursor Viewer */}
                <MolecularWorkspaceViewer3D
                  isGenerating={false}
                  onProbeElement={setProbedElement}
                />
              </div>
            ) : previewTab === "guidelines" ? (
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border/80 bg-muted/30 min-h-[360px] text-center">
                <BookOpen className="size-8 text-[#06B6D4] mb-2" aria-hidden />
                <p className="font-bold text-foreground text-sm">
                  ACS & RSC Table of Contents (TOC) Format
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Graphical abstracts are rendered in 16:9 widescreen ratio with crisp skeletal
                  structures, standard CPK element coloring, and clear reaction pathways.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs font-mono text-muted-foreground w-full max-w-xs">
                  <div className="p-2 rounded bg-background border border-border">
                    <span className="block text-foreground font-semibold">Dimensions</span>
                    <span>1200 × 675 px</span>
                  </div>
                  <div className="p-2 rounded bg-background border border-border">
                    <span className="block text-foreground font-semibold">Resolution</span>
                    <span>300 DPI ready</span>
                  </div>
                </div>
              </div>
            ) : (
              /* The Empty State with the laboratory Flask mark */
              <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/80 bg-card/40 min-h-[360px] text-center overflow-hidden">
                {/* Vertical 'Editing Suite' with icon buttons for Pencil, Eraser, Selection, and Clear */}
                <EditingSuite
                  activeTool={
                    selectedEditorTool === "pencil"
                      ? "pencil"
                      : selectedEditorTool === "eraser"
                        ? "eraser"
                        : selectedEditorTool === "text-whiteout"
                          ? "selection"
                          : undefined
                  }
                  onSelectTool={(suiteTool) => {
                    const toolName = suiteTool === "selection" ? "text-whiteout" : suiteTool;
                    setSelectedEditorTool(toolName);
                    setPreviewTab("editor");
                    setEditing(true);
                  }}
                  onClear={() => {
                    toast.info(isRtl ? "بوم خالی آماده است" : "Blank canvas ready");
                  }}
                  onOpenFullSuite={() => {
                    setPreviewTab("editor");
                    setEditing(true);
                  }}
                />

                <div
                  suppressHydrationWarning
                  className="size-20 rounded-full bg-gradient-to-br from-[#FF758C]/25 via-[#FF7EB3]/20 to-[#38BDF8]/25 border border-pink-400/30 flex items-center justify-center mb-4 shadow-sm"
                >
                  <FlaskLogo className="size-11" />
                </div>
                <p className="font-bold text-foreground text-sm max-w-xs">{t("output.empty")}</p>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Enter your chemistry text or reaction description on the left and generate your
                  publication-ready graphic, or enter the edit studio directly.
                </p>

                {/* Direct Action Buttons to enter the Edit Studio or Upload right from empty state */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    size="sm"
                    onClick={() => {
                      setPreviewTab("editor");
                      setEditing(true);
                    }}
                    className="gap-2 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white font-bold text-xs h-9 px-4 shadow-sm hover:opacity-95"
                  >
                    <Pencil className="size-3.5" />
                    <span>
                      {isRtl
                        ? "ورود به باکس ادیت و نوشت‌افزار (بوم نقاشی و شیمی)"
                        : "Open Edit & Stationery Box"}
                    </span>
                  </Button>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/80 hover:bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors shadow-2xs">
                    <Upload className="size-3.5 text-[#06B6D4]" />
                    <span>{isRtl ? "بارگذاری عکس برای ادیت" : "Upload Image to Edit"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          if (dataUrl) {
                            setImage(dataUrl);
                            setIsFinal(true);
                            setPreviewTab("editor");
                            setEditing(true);
                            toast.success(
                              isRtl ? "تصویر با موفقیت بارگذاری شد" : "Image loaded for editing",
                            );
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectReaction(SAMPLE_HISTORIC_REACTIONS[0]!)}
                    className="text-xs h-9"
                  >
                    {isRtl ? "تست با نمونه آماده" : "Test with Sample"}
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("3d")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border transition-colors flex items-center gap-1.5"
                  >
                    <Atom className="size-3.5 text-[#06B6D4]" />
                    <span>{t("output.inspect3d")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("guidelines")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="size-3.5 text-[#F59E0B]" />
                    <span>Guidelines</span>
                  </button>
                </div>
              </div>
            )}

            {!isGuest && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                {t("menu.plan.usage", { used, max: limit })}
              </p>
            )}
          </section>
        </div>

        {/* The Feeling Showcase Section (Scientific. Inspiring. Empowering.) */}
        <TheFeelingSection />

        {/* Interactive Color Palette & Design System Inspector */}
        <div className="mt-5">
          <ColorPaletteInspector />
        </div>

        {/* Scientific Disclaimer & Beta Notice */}
        <footer className="mt-6 rounded-2xl border border-border/80 bg-secondary/50 backdrop-blur-sm p-4 text-xs sm:p-5 text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-foreground">{t("beta.title")}: </span>
            <span>{t("beta.body")}</span>
          </div>
          <a
            href="mailto:feedback@chemabstract.app?subject=ChemAbstract%20feedback"
            className="shrink-0 font-medium text-accent-strong hover:underline"
          >
            {t("beta.cta")}
          </a>
        </footer>
      </main>

      {/* Floating Side Quick Access Tab for Quick History Navigation */}
      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        className="fixed end-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center gap-1.5 bg-card/90 hover:bg-card border-s border-y border-border/80 py-3 px-1.5 rounded-s-xl shadow-lg backdrop-blur-md text-foreground transition-all hover:-translate-x-1 group cursor-pointer border-accent-strong/40 hover:border-accent-strong"
        title={t("history.revisit")}
      >
        <div className="flex flex-col items-center gap-1.5">
          <History className="size-4 text-accent-strong group-hover:rotate-[-30deg] transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] font-mono tracking-wider font-semibold uppercase text-muted-foreground group-hover:text-foreground">
            {t("history.title")}
          </span>
          {historyCount > 0 && (
            <span className="size-4 rounded-full bg-accent-strong text-accent-foreground text-[9px] font-mono flex items-center justify-center font-bold">
              {historyCount}
            </span>
          )}
        </div>
      </button>

      {/* Recent Reactions Side Drawer / Expanded Panel */}
      <RecentReactionsDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectReaction={handleSelectReaction}
        currentReactionId={generationId}
        userId={user?.id}
        refreshTrigger={historyRefresh}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
