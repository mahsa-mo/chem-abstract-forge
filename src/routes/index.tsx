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
  Copy,
  Maximize2,
  BookOpen,
  History,
  Gift,
  FileText,
  Info,
  Database,
  Calculator,
  Hexagon,
  Printer,
  CornerDownRight,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageEditor, type EditorState, type EditorTool } from "@/components/ImageEditor";
import { EditingSuite } from "@/components/EditingSuite";
import { AppHeader, AccountAndLanguageBar } from "@/components/AppHeader";
import { ChemicalExplorer } from "@/components/ChemicalExplorer";
import { StoichiometryLab } from "@/components/StoichiometryLab";
import { SeoKnowledgeSection } from "@/components/SeoKnowledgeSection";
import { MolecularDrawer2D } from "@/components/MolecularDrawer2D";
import { FlaskLogo } from "@/components/FlaskLogo";
import { TheFeelingSection } from "@/components/DesignSystemShowcase";
import { MolecularBackground } from "@/components/MolecularBackground";
import { MolecularWorkspaceViewer3D } from "@/components/MolecularWorkspaceViewer3D";
import { RecentReactionsDrawer } from "@/components/RecentReactionsDrawer";
import { ReactionArrow } from "@/components/ReactionArrow";
import { JournalPresetSelector } from "@/components/JournalPresetSelector";
import { PublicationExportModal } from "@/components/PublicationExportModal";
import { ChemicalReactionValidator } from "@/components/ChemicalReactionValidator";
import { MechanismOverlayModal } from "@/components/MechanismOverlayModal";
import { JournalPreFlightModal } from "@/components/JournalPreFlightModal";
import { JOURNAL_STANDARDS, type JournalId, type ColorSchemeId } from "@/lib/journal-standards";
import { useI18n } from "@/lib/i18n";
import { streamAbstract } from "@/lib/streamImage";
import { useAuth } from "@/lib/auth";
import { useUsage } from "@/lib/use-usage";
import { supabase } from "@/integrations/supabase/client";
import {
  loadRecentReactions,
  saveRecentReaction,
  SAMPLE_HISTORIC_REACTIONS,
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
    key: "workspace.preset.cox",
    title: "Aspirin & COX-1/COX-2 Pathway",
    text: ", aspirin functions as an acetylating agent, which effectively deactivates the enzymes, thereby inhibiting the production of prostaglandins. With a decreased concentration of prostaglandins, the onset of inflammation is slowed, and fevers are reduced. More recently, it has been discovered that there are two different kinds of cyclooxygenase enzymes, called COX-1 and COX-2. The primary function of COX-2 is to catalyze the synthesis of prostaglandins that cause inflammation and pain, while the primary function of COX-1 is to catalyze the synthesis of prostaglandins that stimulate the production of mucus that protects the stomach lining from concentrated hydrochloric acid. NSAIDs inhibit the action of both COX-1 and COX-2 enzymes, and it has been discovered that the inhibition of COX-1 can block the formation of this mucus and result in gastric irritation or an ulcer. This understanding instigated an intensive search for therapeutic agents capable of selectively inhibiting COX-2 without also inhibiting COX-1. Extensive research efforts culminated in the release of several COX-2 inhibitors on the market in the late 1990s.",
  },
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
      { title: "ChemStudio — Scientific Vector Workbench & Reaction Studio" },
      {
        name: "description",
        content:
          "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
      },
      {
        property: "og:title",
        content: "ChemStudio — Scientific Vector Workbench for Chemistry",
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
    <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/80 bg-card/40 min-h-[360px] text-center overflow-hidden">
      {/* Ambient soft radial glow behind the logo */}
      <div className="pointer-events-none absolute size-44 rounded-full bg-gradient-to-tr from-[#FF758C]/20 via-[#C084FC]/20 to-[#38BDF8]/20 blur-2xl animate-pulse" />

      {/* Signature FlaskLogo with Rotating Orbital Circles */}
      <div className="relative flex size-28 items-center justify-center mb-5">
        {/* Outer clockwise rotating dashed ring with glowing nodes */}
        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-[#FF758C]/45 dark:border-[#FF7EB3]/40 animate-[spin_8s_linear_infinite]">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#FF758C] shadow-[0_0_10px_#FF758C]" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8]" />
        </span>

        {/* Middle counter-clockwise gradient arc ring */}
        <span className="pointer-events-none absolute inset-2.5 rounded-full border-2 border-transparent border-t-[#C084FC] border-r-[#38BDF8] border-b-[#FF758C]/40 animate-[spin_3.2s_linear_infinite_reverse]" />

        {/* Inner soft glass circle holding the familiar FlaskLogo */}
        <div className="relative size-20 rounded-full bg-gradient-to-br from-[#FF758C]/25 via-[#FF7EB3]/20 to-[#38BDF8]/25 border border-pink-400/35 flex items-center justify-center shadow-md">
          <FlaskLogo className="size-11 animate-[pulse_2.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <p key={i} className="animate-in fade-in font-display text-sm font-bold text-foreground">
        {t(messages[i] ?? "loading.1")}
      </p>

      <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-secondary border border-border/60">
        <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#FF758C] via-[#C084FC] to-[#38BDF8]" />
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
  const [mainHubView, setMainHubView] = useState<"studio" | "explorer" | "drawer" | "stoich">(
    "studio",
  );
  const [probedElement, setProbedElement] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [copiedImage, setCopiedImage] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalId>("acs");
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorSchemeId>("academic-clean");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [validatorModalOpen, setValidatorModalOpen] = useState(false);
  const [mechanismModalOpen, setMechanismModalOpen] = useState(false);
  const [preflightModalOpen, setPreflightModalOpen] = useState(false);
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
    if (text.trim().length < 3) {
      setError(t("error.tooShort"));
      return;
    }
    if (quotaReached) {
      setError(t("quota.reached", { max: limit }));
      return;
    }
    // Ensure session in background if possible, but never block Guest users
    if (!user) {
      try {
        await ensureSession();
      } catch {
        // Continue seamlessly in Guest mode
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
      await streamAbstract(
        text,
        (dataUrl, final) => {
          setImage(dataUrl);
          if (final) {
            finalImage = dataUrl;
            setIsFinal(true);
          }
        },
        { journal: selectedJournal, colorScheme: selectedColorScheme },
      );
      if (finalImage) {
        const journalBadge = JOURNAL_STANDARDS[selectedJournal]?.badge ?? "ACS TOC";
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
            tags: [journalBadge, "300 DPI TOC"],
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
            tags: ["Guest Session", journalBadge],
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
      try {
        await ensureSession();
      } catch {
        // Continue seamlessly in Guest mode
      }
    }
    setRegenerating(true);
    setIsFinal(false);
    setEditing(false);
    setEditorState(null);

    let finalImage: string | null = null;
    try {
      await streamAbstract(
        text,
        (dataUrl, final) => {
          setImage(dataUrl);
          if (final) {
            finalImage = dataUrl;
            setIsFinal(true);
          }
        },
        { journal: selectedJournal, colorScheme: selectedColorScheme },
      );
      if (!finalImage) throw new Error("no_image");
      if (finalImage) {
        const journalBadge = JOURNAL_STANDARDS[selectedJournal]?.badge ?? "ACS TOC";
        saveRecentReaction({
          id: generationId ? `${generationId}-regen-${Date.now()}` : `regen-${Date.now()}`,
          title: `${text.trim().slice(0, 45)} (Regeneration)`,
          sourceText: text.trim(),
          imageUrl: finalImage,
          createdAt: new Date().toISOString(),
          regenCount: (regenUsed || 0) + 1,
          tags: ["Regenerated", journalBadge],
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
    a.download = image.startsWith("data:image/svg+xml")
      ? "graphical-abstract.svg"
      : "graphical-abstract.png";
    a.click();
  }

  async function handleCopyToClipboard() {
    if (!image) return;
    try {
      // 1. Fetch image blob
      const res = await fetch(image);
      const blob = await res.blob();

      // 2. Ensure PNG format for ClipboardItem API
      let pngBlob = blob;
      if (blob.type !== "image/png") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = image;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        pngBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b || blob), "image/png"),
        );
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob,
        }),
      ]);
      setCopiedImage(true);
      toast.success(
        isRtl
          ? "تصویر گرافیکال ابسترکت در کلیپ‌بورد کپی شد!"
          : "Graphical abstract copied to clipboard!",
      );
      setTimeout(() => setCopiedImage(false), 2500);
    } catch {
      // Fallback: copy image data URL or text
      try {
        await navigator.clipboard.writeText(image);
        setCopiedImage(true);
        toast.success(
          isRtl ? "لینک تصویر در کلیپ‌بورد کپی شد" : "Abstract image link copied to clipboard",
        );
        setTimeout(() => setCopiedImage(false), 2500);
      } catch {
        toast.error(isRtl ? "امکان دسترسی به کلیپ‌بورد وجود ندارد" : "Could not access clipboard");
      }
    }
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
      <MolecularBackground />
      <AppHeader
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={historyCount}
        activeView={mainHubView}
        onSelectView={setMainHubView}
      />

      <main className="mx-auto max-w-[1320px] px-3 py-5 sm:px-6 sm:py-6">
        <h1 className="sr-only">
          {t("app.name")} — {t("app.tagline")}
        </h1>

        <div className="flex flex-col-reverse md:items-stretch gap-4 sm:gap-5 md:ltr:flex-row-reverse md:rtl:flex-row">
          <div className="flex-1 min-w-0">
            {mainHubView === "explorer" ? (
              <ChemicalExplorer
                onSelectReactionText={(txt) => {
                  setText(txt);
                  setMainHubView("studio");
                }}
                onOpenStudio={() => setMainHubView("studio")}
              />
            ) : mainHubView === "drawer" ? (
              <MolecularDrawer2D
                onSendToStudio={(txt) => {
                  setText(txt);
                  setMainHubView("studio");
                  toast.success(
                    isRtl
                      ? "ساختار مولکولی و کد SMILES در استودیو بارگذاری شد"
                      : "Loaded 2D structure and SMILES into Abstract Studio",
                  );
                }}
                onSendImageToEditor={(dataUrl) => {
                  setImage(dataUrl);
                  setIsFinal(true);
                  setMainHubView("studio");
                  setPreviewTab("editor");
                  setEditing(true);
                  toast.success(
                    isRtl
                      ? "ساختار مولکولی با وضوح 300 DPI به بوم ادیت منتقل شد"
                      : "300 DPI chemical structure loaded into Edit Canvas",
                  );
                }}
              />
            ) : mainHubView === "stoich" ? (
              <StoichiometryLab
                onSelectReactionText={(txt) => {
                  setText(txt);
                  setMainHubView("studio");
                }}
                onOpenStudio={() => setMainHubView("studio")}
              />
            ) : (
              <>
                {/* Main Side-by-Side Scientific Workspace */}
                <div className="relative">
                  <div className="grid items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
                    {/* Reactant Source Console */}
                    <section className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 shadow-card sm:p-5 flex flex-col transition-all h-full">
                      {/* Clean Header: Title + Sample Presets */}
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

                        {/* Sample Reaction Presets + Reaction Validator */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setValidatorModalOpen(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/35 transition-all shadow-2xs"
                            title={t("workspace.validateReactionTitle")}
                          >
                            <Atom className="size-3 text-emerald-500 animate-pulse" />
                            <span>{t("workspace.validateReaction")}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPreflightModalOpen(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/35 transition-all shadow-2xs"
                            title={t("workspace.preflightModalTitle")}
                          >
                            <FileCheck className="size-3 text-purple-500" />
                            <span>{t("workspace.preflightModal")}</span>
                          </button>

                          <span className="text-[11px] text-muted-foreground me-1 hidden sm:inline">
                            {t("workspace.examples")}
                          </span>
                          {SAMPLE_REACTIONS.map((sample) => (
                            <button
                              key={sample.title}
                              type="button"
                              onClick={() => handleApplyPreset(sample.text)}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors font-medium border border-border/60"
                              title={sample.title}
                            >
                              {sample.title.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Journal Standard & Dimensions Selector */}
                      <JournalPresetSelector
                        selectedJournal={selectedJournal}
                        onSelectJournal={setSelectedJournal}
                        selectedColorScheme={selectedColorScheme}
                        onSelectColorScheme={setSelectedColorScheme}
                        className="mb-3"
                      />

                      {/* Input Textarea with integrated bottom symbol bar */}
                      <div className="flex-1 flex flex-col rounded-xl border border-input/90 bg-background/90 overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-shadow">
                        <textarea
                          ref={textareaRef}
                          id="source"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          maxLength={4000}
                          rows={10}
                          placeholder={t("input.placeholder")}
                          className="w-full flex-1 min-h-[250px] resize-y bg-transparent p-3.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 font-sans"
                        />

                        {/* Subtle Integrated Bottom Bar inside Textarea: Quick Symbols + Char Count */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-secondary/30 px-3 py-1.5 text-xs">
                          <div className="flex items-center gap-1 overflow-x-auto">
                            <span className="text-[10px] font-mono text-muted-foreground me-1 shrink-0">
                              {t("workspace.symbols")}
                            </span>
                            {QUICK_SYMBOLS.slice(0, 7).map((sym) => (
                              <button
                                key={sym}
                                type="button"
                                onClick={() => handleInsertSymbol(sym)}
                                className="px-1.5 py-0.5 rounded hover:bg-background text-muted-foreground hover:text-foreground font-mono text-[11px] transition-colors"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground ms-auto">
                            {text.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setText("")}
                                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                              >
                                {t("workspace.clear")}
                              </button>
                            )}
                            <span className="tabular-nums">{text.length}/4000</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Bar */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                        <Button
                          size="lg"
                          onClick={handleGenerate}
                          disabled={busy || quotaReached}
                          className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] text-white font-display text-sm font-bold shadow-md hover:shadow-lg transition-all h-10 px-6 hover:opacity-95"
                        >
                          <Sparkles className="size-4 shrink-0 me-1.5" aria-hidden />
                          {loading ? t("generating") : t("generate")}
                        </Button>

                        {/* Quiet Unboxed Quota Status */}
                        <span
                          className={`text-xs font-mono tabular-nums ${
                            quotaReached
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
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

                    {/* Mobile Vertical Arrow between boxes */}
                    <div className="lg:hidden flex items-center justify-center -my-2">
                      <ReactionArrow variant="mobile" />
                    </div>

                    {/* Graphical Abstract Output Showcase — Visual Centerpiece */}
                    <section
                      ref={outputRef}
                      className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-4 shadow-card sm:p-5 flex flex-col transition-all h-full"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md bg-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5]">
                            <FlaskConical className="size-3.5 text-[#06B6D4]" aria-hidden />
                          </div>
                          <h2 className="font-display text-sm font-bold text-foreground">
                            {t("output.title")}
                          </h2>
                        </div>

                        {/* Clean 3-Mode Segmented View Switcher */}
                        {!loading && (
                          <div className="flex items-center gap-0.5 bg-secondary/70 p-1 rounded-xl border border-border/70 text-xs ms-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewTab("abstract");
                                setEditing(false);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                previewTab === "abstract" && !editing
                                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t("workspace.graphic")}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewTab("editor");
                                setEditing(true);
                              }}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                previewTab === "editor" || editing
                                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Pencil className="size-3 text-[#4F46E5] dark:text-[#818CF8]" />
                              <span>{t("workspace.editor")}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewTab("3d");
                                setEditing(false);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                previewTab === "3d" && !editing
                                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t("workspace.view3d")}
                            </button>

                            <button
                              type="button"
                              onClick={() => setValidatorModalOpen(true)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-all border border-emerald-500/30"
                              title={t("workspace.validateReactionTitle")}
                            >
                              <Atom className="size-3 text-emerald-500" />
                              <span>{t("workspace.auditTab")}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPreflightModalOpen(true)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 transition-all border border-purple-500/30"
                              title={t("workspace.preflightModalTitle")}
                            >
                              <FileCheck className="size-3 text-purple-500" />
                              <span>{t("workspace.preflight")}</span>
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

                            {/* Compact Floating Editing Plugin */}
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
                                const toolName =
                                  suiteTool === "selection" ? "text-whiteout" : suiteTool;
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
                                  toast.info(
                                    isRtl ? "تغییری برای پاکسازی وجود ندارد" : "Nothing to clear",
                                  );
                                }
                              }}
                              onOpenFullSuite={() => {
                                setPreviewTab("editor");
                                setEditing(true);
                              }}
                              onOpenMechanism={() => setMechanismModalOpen(true)}
                            />

                            {/* Single subtle Fullscreen icon in corner instead of duplicate toolbar */}
                            <button
                              type="button"
                              onClick={handleOpenFullRes}
                              className="absolute top-3 right-3 z-20 size-8 rounded-xl bg-background/85 backdrop-blur-md border border-border shadow-xs flex items-center justify-center text-foreground hover:bg-background transition-all"
                              title={t("output.fullRes")}
                            >
                              <Maximize2 className="size-3.5" />
                            </button>
                          </div>

                          {/* Single Clean Bottom Action Bar for Generated Image */}
                          {isFinal && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => setPreflightModalOpen(true)}
                                  className="h-8 text-xs gap-1.5 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white font-bold shadow-xs hover:opacity-95"
                                  title={t("workspace.preflightModalTitle")}
                                >
                                  <FileCheck className="size-3.5" aria-hidden />
                                  <span>{t("output.submissionDossier")}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExportModalOpen(true)}
                                  className="h-8 text-xs gap-1.5 border-[#4F46E5]/40 text-[#4F46E5] dark:text-[#818CF8] bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 font-semibold"
                                >
                                  <Printer className="size-3.5" aria-hidden />
                                  <span>{t("output.publicationReady")}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMechanismModalOpen(true)}
                                  className="h-8 text-xs gap-1.5 border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 font-semibold transition-all"
                                  title={
                                    isRtl
                                      ? "افزودن فلش‌های منحنی مکانیزم، تعادل، و برچسب‌های بازده"
                                      : "Vector mechanism arrows & conditions overlay"
                                  }
                                >
                                  <CornerDownRight className="size-3.5 text-purple-500" />
                                  <span>{t("workspace.overlay")}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleDownload}
                                  className="h-8 text-xs gap-1.5"
                                  title={t("workspace.quickPng")}
                                >
                                  <Download className="size-3.5" aria-hidden />
                                  {t("output.download")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyToClipboard}
                                  className={`h-8 text-xs gap-1.5 transition-all ${
                                    copiedImage
                                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                      : "hover:border-[#4F46E5]/40"
                                  }`}
                                >
                                  {copiedImage ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                  <span>{copiedImage ? t("output.copied") : t("output.copy")}</span>
                                </Button>
                              </div>

                              <div className="flex items-center gap-1.5">
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
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  ({regenUsed}/3)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : loading ? (
                        <LoadingState />
                      ) : previewTab === "3d" ? (
                        <div className="flex flex-col gap-2">
                          {/* Interactive 3D Precursor Viewer */}
                          <MolecularWorkspaceViewer3D
                            isGenerating={false}
                            onProbeElement={setProbedElement}
                          />
                        </div>
                      ) : (
                        /* Clean, Calm Empty State */
                        <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/70 bg-card/40 flex-1 min-h-[340px] text-center overflow-hidden">
                          <div
                            suppressHydrationWarning
                            className="size-20 rounded-full bg-gradient-to-br from-[#FF758C]/25 via-[#FF7EB3]/20 to-[#38BDF8]/25 border border-pink-400/30 flex items-center justify-center mb-4 shadow-sm"
                          >
                            <FlaskLogo className="size-11" />
                          </div>
                          <p className="font-bold text-foreground text-sm max-w-xs">
                            {t("output.empty")}
                          </p>
                          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
                            {isRtl
                              ? "متن واکنش یا مقاله خود را در باکس کناری وارد کرده و دکمه ساخت تصویر را بزنید، یا تصویر خود را برای ویرایش بارگذاری کنید."
                              : "Enter your reaction description on the left to generate a graphic, or upload an existing image to edit."}
                          </p>

                          {/* Focused Secondary Actions */}
                          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/70 hover:bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors">
                              <Upload className="size-3.5 text-[#06B6D4]" />
                              <span>{t("workspace.uploadImage")}</span>
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
                                        isRtl
                                          ? "تصویر با موفقیت بارگذاری شد"
                                          : "Image loaded for editing",
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
                              className="text-xs h-8"
                            >
                              {t("workspace.trySample")}
                            </Button>
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

                  {/* Grand Fantasy Connecting Arrow linking previous box to next box on desktop */}
                  <ReactionArrow variant="desktop" />
                </div>
              </>
            )}
          </div>

          {/* Dedicated Vertical Icon Station on the left side, full-height aligned with the workspace box */}
          <AccountAndLanguageBar onOpenHistory={() => setHistoryOpen(true)} />
        </div>

        {/* Interactive Platform Modules Overview & Guide */}
        {mainHubView === "studio" && <TheFeelingSection onSelectView={setMainHubView} />}

        {/* SEO & Search Engine Knowledge Base Section */}
        <SeoKnowledgeSection />

        {/* Scientific Disclaimer & Beta Notice */}
        <footer className="mt-6 rounded-2xl border border-border/80 bg-secondary/50 backdrop-blur-sm p-4 text-xs sm:p-5 text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-foreground">{t("beta.title")}: </span>
            <span>{t("beta.body")}</span>
          </div>
          <a
            href="mailto:feedback@chemstudio.app?subject=ChemStudio%20feedback"
            className="shrink-0 font-medium text-accent-strong hover:underline"
          >
            {t("beta.cta")}
          </a>
        </footer>
      </main>

      {/* Recent Reactions Side Drawer / Expanded Panel */}
      <RecentReactionsDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectReaction={handleSelectReaction}
        currentReactionId={generationId}
        userId={user?.id}
        refreshTrigger={historyRefresh}
      />

      {/* 300 DPI Publication Export & Compliance Inspector Modal */}
      <PublicationExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUrl={image ?? ""}
        sourceText={text}
        journalId={selectedJournal}
        onOpenPreflight={() => setPreflightModalOpen(true)}
      />

      {/* Phase 2: Scientific Reaction & SMILES Validator Modal */}
      <ChemicalReactionValidator
        isOpen={validatorModalOpen}
        onClose={() => setValidatorModalOpen(false)}
        currentText={text}
        onApplyEnhancedText={(enhancedText) => {
          setText(enhancedText);
        }}
      />

      {/* Phase 3: Vector Mechanism & Annotation Overlay Modal */}
      <MechanismOverlayModal
        isOpen={mechanismModalOpen}
        onClose={() => setMechanismModalOpen(false)}
        baseImageUrl={image ?? ""}
        sourceText={text}
        onSaveMergedImage={(mergedDataUrl) => {
          setImage(mergedDataUrl);
          setIsFinal(true);
        }}
      />

      {/* Phase 4: Journal Submission Dossier & Pre-Flight Inspector Modal */}
      <JournalPreFlightModal
        isOpen={preflightModalOpen}
        onClose={() => setPreflightModalOpen(false)}
        imageUrl={image ?? ""}
        sourceText={text}
        journalId={selectedJournal}
        onOpenMechanism={() => setMechanismModalOpen(true)}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
