import { useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  Trash2,
  RotateCcw,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  Maximize,
  Minimize2,
  FileDown,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  loadRecentReactions,
  deleteRecentReaction,
  clearRecentReactions,
  SAMPLE_HISTORIC_REACTIONS,
  type RecentReaction,
} from "@/lib/recent-reactions";

interface RecentReactionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReaction: (reaction: RecentReaction) => void;
  currentReactionId?: string | null;
  userId?: string | undefined;
  refreshTrigger?: number;
}

export function RecentReactionsDrawer({
  open,
  onOpenChange,
  onSelectReaction,
  currentReactionId,
  userId,
  refreshTrigger,
}: RecentReactionsDrawerProps) {
  const { t, dir, locale } = useI18n();
  const [reactions, setReactions] = useState<RecentReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedMode, setExpandedMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTextIds, setExpandedTextIds] = useState<Set<string>>(new Set());

  // Load history whenever open state changes or refreshTrigger updates
  useEffect(() => {
    let active = true;
    if (open) {
      setLoading(true);
      void loadRecentReactions(userId).then((list) => {
        if (!active) return;
        setReactions(list);
        setLoading(false);
      });
    }
    return () => {
      active = false;
    };
  }, [open, userId, refreshTrigger]);

  function handleToggleExpandText(id: string) {
    setExpandedTextIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCopyText(reaction: RecentReaction) {
    void navigator.clipboard.writeText(reaction.sourceText);
    setCopiedId(reaction.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === reaction.id ? null : curr));
    }, 2000);
  }

  function handleDownload(reaction: RecentReaction) {
    const a = document.createElement("a");
    a.href = reaction.imageUrl;
    const safeTitle = reaction.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    a.download = `chemabstract-${safeTitle || "reaction"}.png`;
    a.click();
  }

  function handleOpenFullRes(imageUrl: string) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<title>ChemAbstract — 16:9 View</title><body style="margin:0;background:#090d16;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${imageUrl}" style="max-width:96vw;max-height:92vh;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);object-fit:contain" /></body>`,
    );
    win.document.close();
  }

  function handleDelete(id: string) {
    if (confirm(t("history.deleteConfirm"))) {
      deleteRecentReaction(id);
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }
  }

  function handleClearAll() {
    if (confirm(t("history.clearConfirm"))) {
      clearRecentReactions();
      setReactions([]);
    }
  }

  function handleRestoreSamples() {
    setReactions(SAMPLE_HISTORIC_REACTIONS);
    SAMPLE_HISTORIC_REACTIONS.forEach((sample) => {
      // save to local storage as well
      try {
        const stored = localStorage.getItem("chemabstract_reaction_history_v2");
        let list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        if (!list.some((it: RecentReaction) => it.id === sample.id)) {
          list.push(sample);
          localStorage.setItem("chemabstract_reaction_history_v2", JSON.stringify(list));
        }
      } catch {
        /* ignore */
      }
    });
  }

  function handleExportJSON() {
    const jsonStr = JSON.stringify(reactions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chemabstract-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Filtered reactions based on search query & category filter
  const filteredReactions = useMemo(() => {
    return reactions.filter((reaction) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        reaction.title.toLowerCase().includes(q) ||
        reaction.sourceText.toLowerCase().includes(q) ||
        (reaction.catalyst && reaction.catalyst.toLowerCase().includes(q)) ||
        (reaction.tags && reaction.tags.some((t) => t.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "coupling")
        return (
          reaction.title.toLowerCase().includes("coupling") ||
          reaction.sourceText.toLowerCase().includes("coupling") ||
          reaction.sourceText.toLowerCase().includes("suzuki")
        );
      if (activeFilter === "photoredox")
        return (
          reaction.title.toLowerCase().includes("photo") ||
          reaction.sourceText.toLowerCase().includes("led") ||
          reaction.sourceText.toLowerCase().includes("iridium")
        );
      if (activeFilter === "aldol")
        return (
          reaction.title.toLowerCase().includes("aldol") ||
          reaction.sourceText.toLowerCase().includes("aldol")
        );
      if (activeFilter === "ester")
        return (
          reaction.title.toLowerCase().includes("ester") ||
          reaction.sourceText.toLowerCase().includes("ester") ||
          reaction.sourceText.toLowerCase().includes("aspirin")
        );

      return true;
    });
  }, [reactions, searchQuery, activeFilter]);

  function formatTime(dateStr: string) {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return locale === "fa" ? "همین الان" : "Just now";
      if (diffMins < 60) return locale === "fa" ? `${diffMins} دقیقه پیش` : `${diffMins}m ago`;
      if (diffHours < 24) return locale === "fa" ? `${diffHours} ساعت پیش` : `${diffHours}h ago`;
      if (diffDays < 7) return locale === "fa" ? `${diffDays} روز پیش` : `${diffDays}d ago`;
      return date.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  const sheetSide = dir === "rtl" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={sheetSide}
        className={`flex flex-col p-0 bg-background/95 backdrop-blur-xl border-border transition-all duration-300 ${
          expandedMode ? "w-full sm:max-w-2xl lg:max-w-4xl" : "w-full sm:max-w-lg lg:max-w-xl"
        }`}
      >
        {/* Drawer Header with Laboratory Styling */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border/80 bg-card/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative size-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-xs">
                <FlaskConical className="size-4" />
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
              </div>
              <div className="text-left rtl:text-right">
                <SheetTitle className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <span>{t("history.title")}</span>
                  {reactions.length > 0 && (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent/30 text-accent-strong border border-accent-strong/20">
                      {reactions.length}
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {t("history.subtitle")}
                </SheetDescription>
              </div>
            </div>

            {/* Expanded Width Toggle & Actions */}
            <div className="flex items-center gap-1.5 me-7">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedMode((v) => !v)}
                className="h-8 px-2 text-xs gap-1 hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                title={expandedMode ? t("history.collapseView") : t("history.expandView")}
              >
                {expandedMode ? (
                  <>
                    <Minimize2 className="size-3.5" />
                    <span className="text-[11px]">{t("history.collapseView")}</span>
                  </>
                ) : (
                  <>
                    <Maximize className="size-3.5" />
                    <span className="text-[11px]">{t("history.expandView")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("history.searchPlaceholder")}
              className="w-full rounded-lg border border-border/80 bg-background/80 py-1.5 ps-9 pe-8 rtl:ps-3 rtl:pe-9 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: "all", label: t("history.filterAll") },
              { id: "coupling", label: t("history.filterCoupling") },
              { id: "photoredox", label: t("history.filterPhotoredox") },
              { id: "aldol", label: t("history.filterAldol") },
              { id: "ester", label: t("history.filterEster") },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 border ${
                  activeFilter === f.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* Scrollable Reaction Cards Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <FlaskConical className="size-8 animate-bounce text-primary" />
              <p className="text-xs font-mono">{t("loading.1")}</p>
            </div>
          ) : filteredReactions.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                <History className="size-6" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">
                {reactions.length === 0 ? t("history.empty") : "No matching reactions found"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {reactions.length === 0
                  ? "Generate an abstract to populate your scientific history, or explore the curated samples below."
                  : `Try searching for different chemical keywords or clear your query "${searchQuery}".`}
              </p>
              {reactions.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreSamples}
                  className="mt-4 gap-1.5 text-xs border-accent-strong/40 text-accent-strong hover:bg-accent/20"
                >
                  <Sparkles className="size-3.5" />
                  {t("history.loadSample")}
                </Button>
              )}
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                expandedMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {filteredReactions.map((reaction) => {
                const isSelected = currentReactionId === reaction.id;
                const isTextExpanded = expandedTextIds.has(reaction.id);

                return (
                  <div
                    key={reaction.id}
                    className={`group relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                        : "border-border/80 bg-card/85 hover:border-accent-strong/40 hover:bg-card shadow-xs hover:shadow-card"
                    }`}
                  >
                    {/* Visual 16:9 Thumbnail Banner */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40 border-b border-border/70">
                      <img
                        src={reaction.imageUrl}
                        alt={reaction.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />

                      {/* Quick Floating Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                        {reaction.yieldRate && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                            {reaction.yieldRate}
                          </span>
                        )}
                        {reaction.regenCount && reaction.regenCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                            Regen #{reaction.regenCount}
                          </span>
                        ) : null}
                      </div>

                      {/* Quick Inspect Button on Hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          onClick={() => handleOpenFullRes(reaction.imageUrl)}
                          className="p-1 rounded-md bg-background/85 text-foreground hover:text-accent-strong border border-border shadow-xs backdrop-blur-md transition-colors"
                          title={t("history.viewFull")}
                        >
                          <Maximize2 className="size-3.5" />
                        </button>
                      </div>

                      {/* Chemical Scheme Watermark / CPK Indicator */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-background/80 text-muted-foreground border border-border/60 backdrop-blur-md">
                        16:9 TOC
                      </div>
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-3.5 flex flex-col flex-1 gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-semibold text-sm text-foreground leading-snug">
                            {reaction.title}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {formatTime(reaction.createdAt)}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary text-primary-foreground shrink-0 shadow-2xs">
                            <Check className="size-3" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Source Text with Expander */}
                      <div className="text-xs text-muted-foreground/90 font-sans leading-relaxed bg-secondary/30 rounded-lg p-2 border border-border/50">
                        <p className={isTextExpanded ? "" : "line-clamp-2"}>
                          {reaction.sourceText}
                        </p>
                        {reaction.sourceText.length > 90 && (
                          <button
                            type="button"
                            onClick={() => handleToggleExpandText(reaction.id)}
                            className="mt-1 text-[11px] font-medium text-accent-strong hover:underline inline-flex items-center gap-0.5"
                          >
                            {isTextExpanded ? "Show less" : "Read full text…"}
                            <ChevronDown
                              className={`size-3 transition-transform ${
                                isTextExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Catalyst & Element Tags */}
                      {reaction.tags && reaction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {reaction.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary text-secondary-foreground border border-border/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom Action Rail */}
                      <div className="mt-auto pt-2 border-t border-border/60 flex items-center justify-between gap-1.5">
                        {/* Primary: Load into workspace */}
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelectReaction(reaction);
                            onOpenChange(false);
                          }}
                          className="h-7 text-xs px-2.5 gap-1.5 font-medium btn-gradient shadow-2xs flex-1 sm:flex-initial"
                        >
                          <ArrowRight className="size-3 rtl:rotate-180" />
                          <span>{t("history.load")}</span>
                        </Button>

                        {/* Secondary utilities */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyText(reaction)}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title={t("history.copyText")}
                          >
                            {copiedId === reaction.id ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(reaction)}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title={t("output.download")}
                          >
                            <Download className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(reaction.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title={t("history.delete")}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer with History Management Utilities */}
        <div className="p-3.5 sm:p-4 border-t border-border/80 bg-card/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={reactions.length === 0}
              className="h-7 px-2 text-xs gap-1 border-border/70 text-muted-foreground hover:text-foreground"
            >
              <FileDown className="size-3.5" />
              <span>{t("history.export")}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestoreSamples}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>{t("history.loadSample")}</span>
            </Button>
          </div>

          {reactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 px-2 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3 me-1" />
              <span>{t("history.clear")}</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
