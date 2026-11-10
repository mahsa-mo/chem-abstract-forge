import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Database,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Atom,
  ExternalLink,
  Layers,
  Award,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { NAMED_REACTIONS, type NamedReaction } from "@/data/named-reactions";
import type { ChemicalCompoundData } from "@/routes/api/chemical-lookup";
import { toast } from "sonner";

const PRESET_COMPOUNDS = [
  { name: "آسپرین (Aspirin)", q: "aspirin" },
  { name: "کافئین (Caffeine)", q: "caffeine" },
  { name: "استامینوفن (Paracetamol)", q: "paracetamol" },
  { name: "ایبوپروفن (Ibuprofen)", q: "ibuprofen" },
  { name: "فروسن (Ferrocene)", q: "ferrocene" },
  { name: "بنزن (Benzene)", q: "benzene" },
];

interface ChemicalExplorerProps {
  onSelectReactionText?: (text: string) => void;
  onOpenStudio?: () => void;
}

export function ChemicalExplorer({ onSelectReactionText, onOpenStudio }: ChemicalExplorerProps) {
  const { locale, isRtl, l } = useI18n();

  const [activeTab, setActiveTab] = useState<"compounds" | "reactions">("compounds");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCompound, setLoadingCompound] = useState(false);
  const [compound, setCompound] = useState<ChemicalCompoundData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reactions filter & search
  const [reactionCategory, setReactionCategory] = useState<string>("all");
  const [reactionSearch, setReactionSearch] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<NamedReaction | null>(null);

  async function handleSearch(queryToSearch?: string) {
    const q = (queryToSearch ?? searchQuery).trim();
    if (!q) return;
    setLoadingCompound(true);
    setCompound(null);

    try {
      const res = await fetch("/api/chemical-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as { data?: ChemicalCompoundData; message?: string };
      if (res.ok && data.data) {
        setCompound(data.data);
      } else {
        toast.error(
          l(
            data.message || "ترکیب مورد نظر یافت نشد. لطفاً نام انگلیسی یا کد CAS را امتحان کنید.",
            "Compound not found. Please try English name or CAS number.",
          ),
        );
      }
    } catch {
      toast.error(l("خطا در ارتباط با سرور پایگاه داده شیمی", "Network error contacting database"));
    } finally {
      setLoadingCompound(false);
    }
  }

  function handleCopy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(isRtl ? "در کلیپ‌بورد کپی شد" : "Copied to clipboard");
  }

  function handleUseReactionInStudio(promptText: string) {
    if (onSelectReactionText) {
      onSelectReactionText(promptText);
    }
    if (onOpenStudio) {
      onOpenStudio();
    }
    toast.success(
      isRtl
        ? "واکنش در استودیو بارگذاری شد! آماده تولید گرافیکال ابسترکت."
        : "Reaction loaded into studio ready for generation!",
    );
  }

  // Filtered reactions
  const filteredReactions = NAMED_REACTIONS.filter((r) => {
    const matchesCat = reactionCategory === "all" || r.category === reactionCategory;
    const matchesSearch =
      reactionSearch === "" ||
      r.name_en.toLowerCase().includes(reactionSearch.toLowerCase()) ||
      r.name_fa.includes(reactionSearch) ||
      r.product.toLowerCase().includes(reactionSearch.toLowerCase()) ||
      r.reagentsAndCatalyst.toLowerCase().includes(reactionSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Clean Icon-First Sub-Navigation Bar */}
      <div className="p-2 rounded-2xl bg-card border border-border shadow-xs">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("compounds")}
            className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "compounds"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="size-8 rounded-lg bg-[#06B6D4]/12 border border-[#06B6D4]/25 flex items-center justify-center text-[#06B6D4]">
              <Atom className="size-5" />
            </div>
            <span className="text-[11px] sm:text-xs leading-tight">
              {isRtl ? "جستجوی ترکیبات و داروها (PubChem)" : "Compound Explorer (PubChem)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reactions")}
            className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "reactions"
                ? "bg-secondary text-foreground shadow-2xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent font-medium"
            }`}
          >
            <div className="relative size-8 rounded-lg bg-[#F59E0B]/12 border border-[#F59E0B]/25 flex items-center justify-center text-[#F59E0B]">
              <BookOpen className="size-5" />
              <span className="absolute -top-1 -end-2 px-1 rounded-full bg-[#F59E0B] text-white text-[9px] font-mono font-bold">
                {NAMED_REACTIONS.length}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs leading-tight">
              {isRtl ? "دانشنامه واکنش‌های نام‌دار" : "Named Reactions Archive"}
            </span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: COMPOUND EXPLORER ================= */}
      {activeTab === "compounds" && (
        <div className="flex flex-col gap-5">
          {/* Search Box */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSearch();
                  }}
                  placeholder={
                    isRtl
                      ? "جستجوی نام ترکیب (فارسی یا انگلیسی)، فرمول (مثل C9H8O4)، کد CAS یا SMILES..."
                      : "Search compound by name, formula (e.g. C9H8O4), CAS number, or SMILES..."
                  }
                  className="w-full h-11 ps-9 pe-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4]/50"
                />
              </div>
              <Button
                type="button"
                onClick={() => void handleSearch()}
                disabled={loadingCompound || !searchQuery.trim()}
                className="h-11 px-5 font-bold gap-2 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
              >
                {loadingCompound ? (
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span>{isRtl ? "جستجوی ترکیب" : "Search"}</span>
              </Button>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground font-mono me-1">
                {isRtl ? "نمونه‌های سریع:" : "Quick samples:"}
              </span>
              {PRESET_COMPOUNDS.map((c) => (
                <button
                  key={c.q}
                  type="button"
                  onClick={() => {
                    setSearchQuery(c.name);
                    void handleSearch(c.q);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-secondary/70 hover:bg-secondary border border-border/70 text-foreground transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Compound Details Card */}
          {loadingCompound && (
            <div className="p-10 rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-center gap-3 animate-pulse">
              <div className="size-14 rounded-full bg-secondary flex items-center justify-center">
                <Atom className="size-8 text-[#06B6D4] animate-spin" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {isRtl
                  ? "در حال دریافت اطلاعات ساختار و خواص مولکولی..."
                  : "Fetching molecular structure & properties..."}
              </p>
            </div>
          )}

          {!loadingCompound && compound && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col lg:flex-row gap-6">
              {/* Left Column: 2D Structure Rendering */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col items-center gap-3">
                <div className="w-full aspect-square rounded-xl bg-white border border-border p-3 flex items-center justify-center relative overflow-hidden shadow-2xs group">
                  {compound.imageUrl ? (
                    <img
                      src={compound.imageUrl}
                      alt={compound.name_en}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Atom className="size-16 text-muted-foreground/40" />
                  )}
                  <span className="absolute bottom-2 end-2 text-[9px] font-mono text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                    2D Skeletal
                  </span>
                </div>

                <div className="w-full flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1.5"
                    onClick={() => handleCopy(compound.smiles, "smiles")}
                  >
                    {copiedKey === "smiles" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{isRtl ? "کپی کد SMILES" : "Copy SMILES"}</span>
                  </Button>
                </div>
              </div>

              {/* Right Column: Chemical Information and Metrics */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3">
                  <div>
                    <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                      <span>{isRtl ? compound.name_fa : compound.name_en}</span>
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      IUPAC: <span className="text-foreground">{compound.iupac}</span>
                    </p>
                  </div>
                  {compound.cas && (
                    <div className="px-2.5 py-1 rounded-md bg-secondary/80 border border-border text-xs font-mono text-foreground">
                      CAS: <span className="font-semibold text-accent-strong">{compound.cas}</span>
                    </div>
                  )}
                </div>

                {/* Key Chemical Properties Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                      {isRtl ? "فرمول مولکولی" : "Formula"}
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {compound.formula}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                      {isRtl ? "جرم مولکولی" : "Mol. Weight"}
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {compound.mw}{" "}
                      <span className="text-[10px] font-normal text-muted-foreground">g/mol</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                      LogP (Lipophilicity)
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {compound.logp !== undefined ? compound.logp : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                      TPSA
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {compound.tpsa !== undefined ? `${compound.tpsa} Å²` : "—"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRtl ? compound.description_fa : compound.description_en}
                </p>

                {/* Uses & Applications */}
                {compound.uses && compound.uses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground me-1">
                      {isRtl ? "کاربردها:" : "Uses:"}
                    </span>
                    {compound.uses.map((u, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#06B6D4]/10 text-[#06B6D4] text-[11px] font-medium border border-[#06B6D4]/20"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                )}

                {/* Safety & GHS */}
                {compound.safety && compound.safety.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <ShieldAlert className="size-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground">GHS:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {compound.safety.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-mono border border-amber-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integration Action */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const snippet = `${compound.name_en} (${compound.formula}, MW: ${compound.mw} g/mol, SMILES: ${compound.smiles})`;
                      if (onSelectReactionText) {
                        onSelectReactionText(snippet);
                      }
                      if (onOpenStudio) {
                        onOpenStudio();
                      }
                      toast.success(
                        isRtl
                          ? `فرمول و اطلاعات ${compound.name_fa} در استودیو بارگذاری شد.`
                          : `Loaded ${compound.name_en} into the studio.`,
                      );
                    }}
                    className="h-8 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
                  >
                    <Sparkles className="size-3.5" />
                    <span>
                      {isRtl ? "استفاده در استودیو گرافیکال ابسترکت" : "Use in Abstract Studio"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!loadingCompound && !compound && (
            <div className="p-8 rounded-2xl bg-card/60 border border-dashed border-border flex flex-col items-center justify-center text-center gap-3">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-[#06B6D4]">
                <Atom className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                {isRtl ? "جستجوی هزاران ترکیب شیمیایی و دارویی" : "Explore Thousands of Compounds"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-md">
                {isRtl
                  ? "نام ماده (فارسی، انگلیسی، یا تجاری)، فرمول مولکولی یا کد CAS را در بالا وارد کنید تا ساختار و خواص کامل آن استخراج شود."
                  : "Type any chemical name, CAS, or molecular formula to inspect its 2D chemical structure, properties, and safety metrics."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: NAMED REACTIONS ENCYCLOPEDIA ================= */}
      {activeTab === "reactions" && (
        <div className="flex flex-col gap-5">
          {/* Category Filter and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: isRtl ? "همه واکنش‌ها" : "All Reactions" },
                { id: "coupling", label: isRtl ? "جفت‌شدن C-C و C-N" : "Cross-Coupling" },
                { id: "addition", label: isRtl ? "حلقه‌زایی و افزایش" : "Cycloaddition & Click" },
                { id: "carbonyl", label: isRtl ? "شیمی کربونیل" : "Carbonyl Transformations" },
                { id: "substitution", label: isRtl ? "جانشینی آروماتیک" : "Substitution" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setReactionCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reactionCategory === cat.id
                      ? "bg-accent-strong text-accent-foreground shadow-2xs font-bold"
                      : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="size-3.5 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reactionSearch}
                onChange={(e) => setReactionSearch(e.target.value)}
                placeholder={isRtl ? "فیلتر نام یا واکنشگر..." : "Filter reaction..."}
                className="w-full h-8 ps-8 pe-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-[#06B6D4]"
              />
            </div>
          </div>

          {/* Reactions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReactions.map((reaction) => {
              const isSelected = selectedReaction?.id === reaction.id;
              return (
                <div
                  key={reaction.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between gap-4 bg-card hover:border-accent-strong/60 shadow-xs ${
                    isSelected ? "border-accent-strong ring-1 ring-accent-strong" : "border-border"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold font-display text-foreground">
                          {isRtl ? reaction.name_fa : reaction.name_en}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {reaction.name_en}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {reaction.nobelPrize && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/30"
                            title={reaction.nobelPrize}
                          >
                            <Award className="size-3" />
                            <span>Nobel</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-semibold">
                          {reaction.year}
                        </span>
                      </div>
                    </div>

                    {/* Chemical Scheme Box */}
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border/80 font-mono text-xs text-foreground font-semibold flex items-center justify-center text-center overflow-x-auto shadow-2xs">
                      {reaction.scheme}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {isRtl ? reaction.description_fa : reaction.description_en}
                    </p>

                    {/* Catalyst & Conditions */}
                    <div className="p-2.5 rounded-lg bg-background border border-border/60 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {isRtl ? "کاتالیزور / باز:" : "Catalyst/Reagents:"}
                        </span>
                        <span className="font-mono font-medium text-foreground text-[11px]">
                          {reaction.reagentsAndCatalyst}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {isRtl ? "شرایط معمول:" : "Conditions:"}
                        </span>
                        <span className="font-mono font-medium text-muted-foreground text-[11px]">
                          {reaction.conditions}
                        </span>
                      </div>
                    </div>

                    {/* Mechanism Steps */}
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                        <Layers className="size-3 text-[#06B6D4]" />
                        <span>{isRtl ? "مراحل کلیدی مکانیزم:" : "Key Mechanism Steps:"}</span>
                      </span>
                      <ol className="list-decimal list-inside text-[11px] text-muted-foreground space-y-0.5 ps-1">
                        {reaction.mechanismSteps.map((step, idx) => (
                          <li key={idx}>{isRtl ? step.fa : step.en}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(reaction.abstractPromptText, reaction.id)}
                      className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {copiedKey === reaction.id ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>{isRtl ? "کپی متن واکنش" : "Copy Text"}</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUseReactionInStudio(reaction.abstractPromptText)}
                      className="h-8 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
                    >
                      <Sparkles className="size-3.5" />
                      <span>{isRtl ? "تولید گرافیکال ابسترکت" : "Generate Abstract"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
