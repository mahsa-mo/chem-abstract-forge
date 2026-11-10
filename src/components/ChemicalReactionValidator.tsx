import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Atom,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Leaf,
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  parseAndAuditReaction,
  type ParsedReactionAudit,
  type ChemicalSpecies,
} from "@/lib/reaction-parser";
import { validateSmiles, type SmilesValidationResult } from "@/lib/smiles-validator";
import { lookupPubChemUniversal, type PubChemCompound } from "@/lib/pubchem-service";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface ChemicalReactionValidatorProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onApplyEnhancedText?: (enhancedText: string) => void;
}

const SAMPLE_SMILES_TESTS = [
  {
    name: "آسپرین (Aspirin)",
    smiles: "CC(=O)Oc1ccccc1C(=O)O",
    desc: "استیل‌سالیسیلیک اسید (معتبر)",
  },
  {
    name: "کافئین (Caffeine)",
    smiles: "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
    desc: "پورین آلکالوئید هتروسیکلیک",
  },
  { name: "فنیل‌بورونیک اسید", smiles: "OB(O)c1ccccc1", desc: "پیش‌ماده سوزوکی با بور" },
  { name: "۴-متوکسی‌بی‌فنیل", smiles: "COc1ccc(-c2ccccc2)cc1", desc: "محصول جفت‌شدن C-C" },
  { name: "خطای کربن ۵-ظرفیتی (Invalid)", smiles: "C(C)(C)(C)(C)C", desc: "تست خطا: Texas Carbon" },
  { name: "خطای حلقه باز (Invalid)", smiles: "c1ccccc", desc: "تست خطا: حلقه بدون بسته‌شدن" },
];

export function ChemicalReactionValidator({
  isOpen,
  onClose,
  currentText,
  onApplyEnhancedText,
}: ChemicalReactionValidatorProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<"breakdown" | "smiles" | "greenchem" | "pubchem">(
    "breakdown",
  );
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [audit, setAudit] = useState<ParsedReactionAudit | null>(null);

  // SMILES tab state
  const [smilesInput, setSmilesInput] = useState("CC(=O)Oc1ccccc1C(=O)O");
  const [smilesValidation, setSmilesValidation] = useState<SmilesValidationResult | null>(null);
  const [smilesPubChem, setSmilesPubChem] = useState<PubChemCompound | null>(null);
  const [loadingSmilesPubChem, setLoadingSmilesPubChem] = useState(false);

  // PubChem live explorer state
  const [pubchemQuery, setPubchemQuery] = useState("aspirin");
  const [pubchemLoading, setPubchemLoading] = useState(false);
  const [pubchemResult, setPubchemResult] = useState<PubChemCompound | null>(null);

  // Active inspected species in Breakdown tab
  const [selectedSpecies, setSelectedSpecies] = useState<ChemicalSpecies | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runAudit = useCallback(
    async (textToAnalyze: string) => {
      setLoadingAudit(true);
      try {
        const res = await parseAndAuditReaction(textToAnalyze);
        setAudit(res);
        if (res.reactants.length > 0) {
          setSelectedSpecies(res.reactants[0]);
        } else if (res.products.length > 0) {
          setSelectedSpecies(res.products[0]);
        }
      } catch (err) {
        console.error("Audit error:", err);
        toast.error(isRtl ? "خطا در تجزیه علمی متن واکنش" : "Failed to audit chemical reaction");
      } finally {
        setLoadingAudit(false);
      }
    },
    [isRtl],
  );

  // Run initial reaction audit when dialog opens or text changes
  useEffect(() => {
    if (isOpen) {
      void runAudit(currentText);
    }
  }, [isOpen, currentText, runAudit]);

  // Validate SMILES automatically when smilesInput changes
  useEffect(() => {
    const res = validateSmiles(smilesInput);
    setSmilesValidation(res);

    // If valid, look up in PubChem
    if (res.valid && res.atomCount > 0) {
      setLoadingSmilesPubChem(true);
      void lookupPubChemUniversal(smilesInput)
        .then((compound) => setSmilesPubChem(compound))
        .finally(() => setLoadingSmilesPubChem(false));
    } else {
      setSmilesPubChem(null);
    }
  }, [smilesInput]);

  async function handlePubChemSearch() {
    if (!pubchemQuery.trim()) return;
    setPubchemLoading(true);
    try {
      const res = await lookupPubChemUniversal(pubchemQuery.trim());
      setPubchemResult(res);
      if (!res) {
        toast.info(
          isRtl
            ? "ترکیب در PubChem با این عنوان یافت نشد. نام انگلیسی رسمی یا کد CAS را بررسی کنید."
            : "No compound found in PubChem. Try standard English name or CAS.",
        );
      }
    } catch {
      toast.error(
        isRtl ? "خطا در برقراری ارتباط با پایگاه داده PubChem" : "Network error contacting PubChem",
      );
    } finally {
      setPubchemLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(isRtl ? "در کلیپ‌بورد کپی شد" : "Copied to clipboard");
  }

  function handleApplyEnhanced() {
    if (!audit || !onApplyEnhancedText) return;
    onApplyEnhancedText(audit.enhancedPromptText);
    toast.success(
      isRtl
        ? "متن استاندارد واکنش به پرامپت استودیو اعمال شد!"
        : "Standardized reaction scheme applied to workspace prompt!",
    );
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl bg-card rounded-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <FlaskConical className="size-6 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
                  {isRtl
                    ? "اعتبارسنجی علمی ساختار و فرمول‌های واکنش"
                    : "Scientific Reaction & SMILES Validator"}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Phase 2 Core
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? "تفکیک هوشمند مواد اولیه و فرآورده‌ها، اعتبارسنجی ولانس و SMILES، بررسی بازده اتمی و اتصال زنده به دیتابیس PubChem"
                    : "Intelligent species extraction, SMILES & valency verification, atom economy audit & live PubChem integration"}
                </DialogDescription>
              </div>
            </div>

            {audit && (
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <ShieldCheck className="size-3.5" />
                  <span>
                    {isRtl ? "اعتبار سنتزی:" : "Plausibility:"} {audit.plausibilityScore}%
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  {audit.title}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full mt-6"
          >
            <TabsList className="grid grid-cols-4 w-full h-11 bg-muted/70 p-1 rounded-xl border border-border/50">
              <TabsTrigger value="breakdown" className="gap-2 text-xs font-semibold rounded-lg">
                <Layers className="size-3.5" />
                <span>{isRtl ? "تفکیک اجزا" : "Reaction Schema"}</span>
              </TabsTrigger>
              <TabsTrigger value="smiles" className="gap-2 text-xs font-semibold rounded-lg">
                <Atom className="size-3.5" />
                <span>{isRtl ? "اعتبارسنجی SMILES" : "SMILES & Valency"}</span>
              </TabsTrigger>
              <TabsTrigger value="greenchem" className="gap-2 text-xs font-semibold rounded-lg">
                <Leaf className="size-3.5 text-emerald-500" />
                <span>{isRtl ? "شیمی سبز و موازنه" : "Atom Economy"}</span>
              </TabsTrigger>
              <TabsTrigger value="pubchem" className="gap-2 text-xs font-semibold rounded-lg">
                <Search className="size-3.5 text-blue-500" />
                <span>{isRtl ? "کاوشگر PubChem" : "PubChem Explorer"}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab 1: Breakdown & Schema */}
        {activeTab === "breakdown" && (
          <div className="p-6 space-y-6">
            {loadingAudit ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <RefreshCw className="size-8 text-primary animate-spin" />
                <p className="text-sm font-semibold">
                  {isRtl ? "در حال تجزیه علمی اجزای واکنش..." : "Auditing reaction species..."}
                </p>
              </div>
            ) : audit ? (
              <>
                {/* IUPAC Summary Scheme Banner */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {isRtl ? "طرح شماتیک استاندارد IUPAC:" : "Standard IUPAC Reaction Scheme:"}
                    </span>
                    <p className="text-sm font-mono font-medium text-foreground dir-ltr text-left">
                      {audit.standardIupacSummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(audit.standardIupacSummary, "iupac")}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {copiedKey === "iupac" ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>
                        {copiedKey === "iupac"
                          ? isRtl
                            ? "کپی شد"
                            : "Copied"
                          : isRtl
                            ? "کپی شماتیک"
                            : "Copy Scheme"}
                      </span>
                    </Button>
                    {onApplyEnhancedText && (
                      <Button
                        size="sm"
                        onClick={handleApplyEnhanced}
                        className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      >
                        <Sparkles className="size-3.5" />
                        <span>{isRtl ? "اعمال به پرامپت استودیو" : "Apply to Prompt"}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grid of Species */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Reactants & Reagents */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                        <span className="size-2 rounded-full bg-blue-500" />
                        <span>
                          {isRtl
                            ? "مواد اولیه و پیش‌ماده‌ها (Reactants)"
                            : "Starting Materials (Reactants)"}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {audit.reactants.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => setSelectedSpecies(r)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              selectedSpecies?.id === r.id
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border hover:border-primary/40 bg-card/60"
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-semibold text-sm truncate">{r.name}</div>
                              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                                  {r.formula}
                                </span>
                                <span>MW: {r.mw.toFixed(1)} g/mol</span>
                                {r.equiv && (
                                  <span className="text-primary font-bold">{r.equiv} equiv</span>
                                )}
                              </div>
                            </div>
                            {r.smiles && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                                SMILES OK
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Catalysts & Reagents */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                        <span className="size-2 rounded-full bg-purple-500" />
                        <span>
                          {isRtl
                            ? "کاتالیزور و معرف‌ها (Catalysts & Reagents)"
                            : "Catalysts & Reagents"}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {audit.catalysts.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedSpecies(c)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              selectedSpecies?.id === c.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40 bg-card/60"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm">{c.name}</div>
                              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold">
                                  {c.molPercent ? `${c.molPercent} mol%` : "Catalyst"}
                                </span>
                                <span>MW: {c.mw.toFixed(1)} g/mol</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {audit.reagents.map((rg) => (
                          <div
                            key={rg.id}
                            onClick={() => setSelectedSpecies(rg)}
                            className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-sm">{rg.name}</div>
                              <div className="text-xs font-mono text-muted-foreground">
                                {rg.formula} • {rg.equiv || 1.0} equiv
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solvents & Conditions */}
                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <Scale className="size-3.5 text-primary" />
                        <span>
                          {isRtl
                            ? "شرایط فیزیکی و حلال (Reaction Conditions)"
                            : "Reaction Conditions"}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] text-muted-foreground block">
                            {isRtl ? "حلال:" : "Solvent:"}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {audit.conditions.solvent || "—"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] text-muted-foreground block">
                            {isRtl ? "دما:" : "Temperature:"}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {audit.conditions.temperature || "Room Temp (rt)"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] text-muted-foreground block">
                            {isRtl ? "مدت زمان:" : "Time:"}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {audit.conditions.time || "Not specified"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] text-muted-foreground block">
                            {isRtl ? "تابش / اتمسفر:" : "Radiation/Atmosphere:"}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {audit.conditions.light || "Inert / Ambient"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Products & Inspected Species Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>{isRtl ? "فرآورده‌ها و محصولات (Products)" : "Target Products"}</span>
                      </h4>
                      <div className="space-y-2">
                        {audit.products.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedSpecies(p)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              selectedSpecies?.id === p.id
                                ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                                : "border-border hover:border-emerald-500/40 bg-card/60"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-sm text-foreground">{p.name}</div>
                              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                                  {p.formula}
                                </span>
                                <span>MW: {p.mw.toFixed(1)} g/mol</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                {p.yieldPercent || 90}% Yield
                              </span>
                              {p.eePercent && (
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  {p.eePercent}% ee
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inspected Species Card */}
                    {selectedSpecies && (
                      <div className="p-4 rounded-xl border border-primary/30 bg-card shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Atom className="size-3.5" />
                              <span>
                                {isRtl ? "کارت مشخصات علمی گونه:" : "Species Chemical Details:"}
                              </span>
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {selectedSpecies.name}
                            </span>
                          </div>
                          {selectedSpecies.pubchemCid && (
                            <a
                              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedSpecies.pubchemCid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <span>CID: {selectedSpecies.pubchemCid}</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>

                        {/* 2D Structure Render */}
                        <div className="relative h-44 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden p-2">
                          {selectedSpecies.pubchemCid ? (
                            <img
                              src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedSpecies.pubchemCid}/PNG?image_size=300x300`}
                              alt={selectedSpecies.name}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                              loading="lazy"
                            />
                          ) : selectedSpecies.smiles ? (
                            <img
                              src={`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(
                                selectedSpecies.smiles,
                              )}/image`}
                              alt={selectedSpecies.name}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground font-mono">
                              {isRtl
                                ? "ساختار ۲ بعدی ارگانیک در دسترس نیست"
                                : "2D Structure unavailable"}
                            </div>
                          )}
                        </div>

                        {/* SMILES and Formula details */}
                        <div className="space-y-1.5 text-xs">
                          {selectedSpecies.smiles && (
                            <div className="p-2 rounded bg-muted/60 flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] truncate dir-ltr select-all">
                                {selectedSpecies.smiles}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0"
                                onClick={() =>
                                  handleCopy(selectedSpecies.smiles!, selectedSpecies.id)
                                }
                              >
                                {copiedKey === selectedSpecies.id ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                            <span>
                              {isRtl ? "فرمول مولکولی:" : "Formula:"} {selectedSpecies.formula}
                            </span>
                            <span>
                              {isRtl ? "وزن مولکولی:" : "MW:"} {selectedSpecies.mw} g/mol
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 2: SMILES & Valency Inspector */}
        {activeTab === "smiles" && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>
                  {isRtl
                    ? "کد رشته SMILES شیمیایی جهت اعتبارسنجی ولانس:"
                    : "Enter SMILES string for valency audit:"}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Simplified Molecular Input Line Entry System
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={smilesInput}
                  onChange={(e) => setSmilesInput(e.target.value)}
                  placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
                  className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/80 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  dir="ltr"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSmilesInput("CC(=O)Oc1ccccc1C(=O)O")}
                  className="text-xs"
                >
                  {isRtl ? "بازنشانی" : "Reset"}
                </Button>
              </div>

              {/* Sample Test Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground self-center mr-1">
                  {isRtl ? "تست‌های آماده:" : "Presets:"}
                </span>
                {SAMPLE_SMILES_TESTS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setSmilesInput(sample.smiles)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Diagnostic Panel */}
            {smilesValidation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Diagnostics List */}
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      smilesValidation.valid
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {smilesValidation.valid ? (
                        <CheckCircle2 className="size-6 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-6 text-red-500 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-sm">
                          {smilesValidation.valid
                            ? isRtl
                              ? "ساختار SMILES کاملاً معتبر است"
                              : "Valid SMILES Structure"
                            : isRtl
                              ? "خطای گرامر یا ظرفیت شیمیایی (Invalid SMILES)"
                              : "Chemical Valency or Syntax Error"}
                        </div>
                        <div className="text-xs opacity-90">
                          {smilesValidation.valid
                            ? isRtl
                              ? "تمامی اتصالات، پرانتزها و حلقه‌ها با قوانین شیمی ارگانیک منطبق هستند."
                              : "All bond valencies, rings, and parentheses follow IUPAC/SMILES rules."
                            : isRtl
                              ? "خطا در بررسی اتصالات یا ظرفیت کووالانسی اتم‌ها شناسایی شد."
                              : "Errors detected in molecular topology or valencies."}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold font-mono">
                        {smilesValidation.score}
                      </span>
                      <span className="text-xs block text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  {/* Errors / Warnings Log */}
                  {smilesValidation.errors.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-1.5">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        <span>{isRtl ? "خطاهای کشف‌شده:" : "Detected Errors:"}</span>
                      </span>
                      {smilesValidation.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-700 dark:text-red-300 font-mono">
                          • {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {smilesValidation.warnings.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        <span>{isRtl ? "هشدارهای ساختاری:" : "Structural Warnings:"}</span>
                      </span>
                      {smilesValidation.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-700 dark:text-amber-300 font-mono">
                          • {w}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Structural Properties Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">
                        {isRtl ? "تعداد اتم‌ها:" : "Atoms:"}
                      </span>
                      <span className="font-bold text-sm font-mono">
                        {smilesValidation.atomCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">
                        {isRtl ? "حلقه‌ها:" : "Rings:"}
                      </span>
                      <span className="font-bold text-sm font-mono">
                        {smilesValidation.ringCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">
                        {isRtl ? "اتم‌های آروماتیک:" : "Aromatic:"}
                      </span>
                      <span className="font-bold text-sm font-mono">
                        {smilesValidation.aromaticAtoms}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2D Structure Diagram & PubChem Match */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>
                      {isRtl ? "پیش‌نمایش ۲ بعدی ساختار شیمیایی:" : "2D Chemical Diagram:"}
                    </span>
                    {smilesPubChem && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {smilesPubChem.iupacName}
                      </span>
                    )}
                  </div>

                  <div className="relative h-60 rounded-xl bg-white border border-border flex items-center justify-center p-3 overflow-hidden shadow-sm">
                    {loadingSmilesPubChem ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw className="size-5 animate-spin text-primary" />
                        <span>{isRtl ? "استعلام از PubChem..." : "Resolving in PubChem..."}</span>
                      </div>
                    ) : smilesValidation.valid ? (
                      <img
                        src={`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(
                          smilesValidation.cleanSmiles,
                        )}/image`}
                        alt="Chemical Structure"
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          // Fallback to PubChem if available
                          if (smilesPubChem?.png2DUrl) {
                            (e.target as HTMLImageElement).src = smilesPubChem.png2DUrl;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-xs text-red-500 font-mono text-center p-4">
                        {isRtl
                          ? "رسم ساختار به دلیل خطای ظرفیتی یا ساختاری امکان‌پذیر نیست"
                          : "Rendering blocked due to valence/syntax errors"}
                      </div>
                    )}
                  </div>

                  {smilesPubChem && (
                    <div className="p-3 rounded-lg border border-border/80 bg-muted/40 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-muted-foreground">
                          {isRtl ? "فرمول:" : "Formula:"}{" "}
                        </span>
                        <span className="font-bold">{smilesPubChem.molecularFormula}</span>
                        <span className="mx-2 text-border">|</span>
                        <span className="text-muted-foreground">MW: </span>
                        <span className="font-bold">{smilesPubChem.molecularWeight}</span>
                      </div>
                      <a
                        href={smilesPubChem.pubchemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 font-sans text-[11px]"
                      >
                        <span>PubChem</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Green Chemistry & Atom Economy */}
        {activeTab === "greenchem" && (
          <div className="p-6 space-y-6">
            {audit ? (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Atom Economy */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Leaf className="size-4" />
                      <span>{isRtl ? "بازده اتمی (Atom Economy)" : "Atom Economy"}</span>
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {audit.atomEconomyPercent}%
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      {audit.atomEconomyPercent >= 75
                        ? isRtl
                          ? "شیمی سبز مطلوب: درصد بالایی از جرم اتم‌ها وارد فرآورده نهایی می‌شود."
                          : "High green chemistry efficiency: high atom incorporation into target."
                        : isRtl
                          ? "بازده اتمی متوسط: نیازمند تفکیک فرآورده‌های جانبی یا کاهش مصرف معرف."
                          : "Moderate atom economy: produces stoichiometric byproducts."}
                    </p>
                  </div>

                  {/* E-Factor Estimate */}
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Scale className="size-4" />
                      <span>{isRtl ? "ضریب پسماند شلدون (E-Factor)" : "Sheldon E-Factor"}</span>
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                      ~{audit.eFactorEstimate}
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      {isRtl
                        ? "نسبت پسماند شیمیایی به ازای هر کیلوگرم فرآورده نهایی (مقدار پایین‌تر = تمیزتر)"
                        : "Ratio of waste generated per kg of product (lower is cleaner)"}
                    </p>
                  </div>

                  {/* Catalyst Turnover */}
                  <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="size-4" />
                      <span>
                        {isRtl ? "میزان کاتالیزور (Catalyst Loading)" : "Catalyst Loading"}
                      </span>
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                      {audit.catalysts[0]?.molPercent
                        ? `${audit.catalysts[0].molPercent} mol%`
                        : "1–5 mol%"}
                    </div>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      {isRtl
                        ? "درصد مولی کاتالیزور در محدوده استاندارد واکنش‌های هموژن قرار دارد."
                        : "Homogeneous catalyst loading is within standard synthetic scope."}
                    </p>
                  </div>
                </div>

                {/* Element Conservation Audit Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Atom className="size-4 text-primary" />
                    <span>
                      {isRtl
                        ? "جدول تراز عناصر (Elemental Conservation Audit):"
                        : "Elemental Conservation Audit:"}
                    </span>
                  </h4>

                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/70 text-muted-foreground border-b border-border font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">{isRtl ? "عنصر" : "Element"}</th>
                          <th className="py-2.5 px-4">
                            {isRtl ? "سمت واکنش‌دهنده‌ها" : "Reactants Side"}
                          </th>
                          <th className="py-2.5 px-4">
                            {isRtl ? "سمت فرآورده‌ها" : "Products Side"}
                          </th>
                          <th className="py-2.5 px-4">
                            {isRtl ? "وضعیت پایستگی" : "Conservation"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono">
                        {audit.atomAudit.map((row) => (
                          <tr key={row.element} className="hover:bg-muted/30">
                            <td className="py-2 px-4 font-bold text-foreground font-sans flex items-center gap-2">
                              <span className="size-2 rounded-full bg-primary/70" />
                              <span>{row.element}</span>
                            </td>
                            <td className="py-2 px-4">{row.reactantsCount} atoms</td>
                            <td className="py-2 px-4">{row.productsCount} atoms</td>
                            <td className="py-2 px-4">
                              {row.balanced ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                  <Check className="size-3" />
                                  <span>{isRtl ? "متعادل" : "Conserved"}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
                                  <AlertTriangle className="size-3" />
                                  <span>{isRtl ? "در فرآورده جانبی" : "Byproduct Sink"}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Info className="size-3.5" />
                    <span>
                      {isRtl
                        ? "توصیه‌های داوری برای ارسال به ژورنال‌های معتبر:"
                        : "Editorial & Green Chemistry Recommendations:"}
                    </span>
                  </span>
                  <ul className="text-xs text-foreground space-y-1 pr-4 list-disc">
                    {audit.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 4: Live PubChem Explorer */}
        {activeTab === "pubchem" && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                {isRtl
                  ? "جستجوی زنده در دیتابیس PubChem NIH (نام ترکیب، کد CAS، یا کد SMILES):"
                  : "Live PubChem NIH Database Search (Name, CAS, or SMILES):"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pubchemQuery}
                  onChange={(e) => setPubchemQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handlePubChemSearch()}
                  placeholder="e.g. aspirin, curcumin, Pd(PPh3)4, 50-78-2"
                  className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/80 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  dir="ltr"
                />
                <Button
                  onClick={handlePubChemSearch}
                  disabled={pubchemLoading}
                  className="gap-2 text-xs font-semibold"
                >
                  {pubchemLoading ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" />
                  )}
                  <span>{isRtl ? "جستجو در PubChem" : "Search PubChem"}</span>
                </Button>
              </div>

              {/* Fast links */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["aspirin", "caffeine", "paracetamol", "curcumin", "ferrocene", "benzene"].map(
                  (q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setPubchemQuery(q);
                        void lookupPubChemUniversal(q).then((res) => setPubchemResult(res));
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground font-mono"
                    >
                      {q}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* PubChem Search Result */}
            {pubchemLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <RefreshCw className="size-8 text-primary animate-spin" />
                <p className="text-sm font-semibold">
                  {isRtl
                    ? "در حال دریافت متادیتا از سرور PubChem..."
                    : "Querying PubChem PUG REST API..."}
                </p>
              </div>
            ) : pubchemResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-primary/30 bg-card shadow-sm">
                {/* 2D Image */}
                <div className="space-y-2">
                  <div className="relative h-64 rounded-xl bg-white border border-border flex items-center justify-center p-3 shadow-inner">
                    <img
                      src={pubchemResult.png2DUrl}
                      alt={pubchemResult.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <a
                      href={pubchemResult.pubchemUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>PubChem Record (CID: {pubchemResult.cid})</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <a
                      href={pubchemResult.sdf3DUrl}
                      download={`${pubchemResult.name}_3d.sdf`}
                      className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Download 3D SDF</span>
                    </a>
                  </div>
                </div>

                {/* Chemical Data Table */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{pubchemResult.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {pubchemResult.iupacName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        {isRtl ? "فرمول مولکولی:" : "Formula:"}
                      </span>
                      <span className="font-bold font-mono text-sm">
                        {pubchemResult.molecularFormula}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        {isRtl ? "جرم مولکولی:" : "Molecular Weight:"}
                      </span>
                      <span className="font-bold font-mono text-sm">
                        {pubchemResult.molecularWeight} g/mol
                      </span>
                    </div>
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        XLogP (آبگریزی):
                      </span>
                      <span className="font-bold font-mono">{pubchemResult.xlogp ?? "—"}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        TPSA (سطح قطبی):
                      </span>
                      <span className="font-bold font-mono">
                        {pubchemResult.tpsa ? `${pubchemResult.tpsa} Å²` : "—"}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        H-Bond Donors:
                      </span>
                      <span className="font-bold font-mono">
                        {pubchemResult.hBondDonorCount ?? 0}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-muted/60 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">
                        H-Bond Acceptors:
                      </span>
                      <span className="font-bold font-mono">
                        {pubchemResult.hBondAcceptorCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Canonical SMILES with copy */}
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/70 space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-bold">
                      Canonical SMILES:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] truncate dir-ltr select-all">
                        {pubchemResult.canonicalSmiles}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => handleCopy(pubchemResult.canonicalSmiles, "pubchem-smiles")}
                      >
                        {copiedKey === "pubchem-smiles" ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            {isRtl ? "بستن پنجره" : "Close"}
          </Button>

          <div className="flex items-center gap-2">
            {audit && onApplyEnhancedText && (
              <Button
                size="sm"
                onClick={handleApplyEnhanced}
                className="gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Sparkles className="size-3.5" />
                <span>
                  {isRtl
                    ? "به‌روزرسانی پرامپت با فرمول‌های استاندارد"
                    : "Apply Standardized Scheme to Workspace"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
