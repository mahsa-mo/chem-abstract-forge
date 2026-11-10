import React, { useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { JOURNAL_STANDARDS, type JournalId } from "@/lib/journal-standards";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import {
  generateVerificationHash,
  buildOfficialAIDeclaration,
  buildChemicalDataSheet,
  generateSubmissionDossierZip,
  type DossierMetadata,
} from "@/lib/journal-submission-dossier";
import type { ReactionAuditResult } from "@/lib/reaction-parser";
import {
  Check,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileArchive,
  Layers,
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  Award,
  Palette,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface JournalPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  sourceText: string;
  journalId: JournalId;
  onOpenMechanism?: () => void;
  reactionAudit?: ReactionAuditResult | null;
}

type VisionFilter = "normal" | "deuteranopia" | "protanopia" | "tritanopia" | "grayscale";

export function JournalPreFlightModal({
  isOpen,
  onClose,
  imageUrl,
  sourceText,
  journalId,
  onOpenMechanism,
  reactionAudit,
}: JournalPreFlightModalProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";
  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;
  const filterSvgId = useId();

  // Form State for Dossier
  const [activeTab, setActiveTab] = useState<"preflight" | "ethics" | "certificate" | "package">(
    "preflight",
  );
  const [paperTitle, setPaperTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [institution, setInstitution] = useState("");
  const [visionFilter, setVisionFilter] = useState<VisionFilter>("normal");
  const [thumbnailSize, setThumbnailSize] = useState<"200" | "150" | "100">("200");
  const [declarationCopied, setDeclarationCopied] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);

  // Packaging progress state
  const [isPackaging, setIsPackaging] = useState(false);
  const [packProgress, setPackProgress] = useState(0);
  const [packStep, setPackStep] = useState("");

  const [verificationHash] = useState(() =>
    generateVerificationHash(sourceText || "GeneralSynthesis", journalId),
  );

  const dossierMeta: DossierMetadata = {
    paperTitle:
      paperTitle ||
      (isRtl ? "سنتز و مشخصه‌یابی ترکیبات جدید" : "Novel Catalytic Synthesis & Characterization"),
    correspondingAuthor: authorName || (isRtl ? "پژوهشگر ارشد" : "Lead Researcher"),
    institution: institution || (isRtl ? "دانشکده شیمی" : "Department of Chemistry"),
    targetJournal: journalId,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    verificationHash,
  };

  const declarations = buildOfficialAIDeclaration(dossierMeta, reactionAudit);

  function handleCopyDeclaration(type: "en" | "fa") {
    const textToCopy = type === "fa" ? declarations.fa : declarations.en;
    void navigator.clipboard.writeText(textToCopy);
    setDeclarationCopied(true);
    toast.success(
      isRtl
        ? "متن اظهارنامه رسمی هوش مصنوعی با استانداردهای COPE کپی شد!"
        : "Official AI Declaration copied for your cover letter & paper!",
    );
    setTimeout(() => setDeclarationCopied(false), 2500);
  }

  function handleCopyHash() {
    void navigator.clipboard.writeText(verificationHash);
    setHashCopied(true);
    toast.success(isRtl ? "کد رهگیری اصالت کپی شد" : "Verification Hash copied");
    setTimeout(() => setHashCopied(false), 2000);
  }

  async function handleDownloadZipPackage() {
    if (!imageUrl) {
      toast.error(isRtl ? "تصویری برای ایجاد پکیج وجود ندارد" : "No image available to bundle");
      return;
    }

    try {
      setIsPackaging(true);
      setPackProgress(5);
      setPackStep(isRtl ? "شروع پردازش پکیج سابمیت..." : "Initializing submission bundle...");

      const zipBlob = await generateSubmissionDossierZip(
        imageUrl,
        sourceText,
        dossierMeta,
        reactionAudit,
        (percent, step) => {
          setPackProgress(percent);
          setPackStep(step);
        },
      );

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const sanitized = standard.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `${sanitized}-submission-dossier-package.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(
        isRtl
          ? "پکیج کامل سابمیت ژورنال (.zip) با موفقیت دانلود شد!"
          : "Complete Journal Submission Dossier (.zip) downloaded successfully!",
      );
    } catch {
      toast.error(
        isRtl ? "خطا در تولید فایل فشرده پکیج" : "Failed to compile submission dossier ZIP",
      );
    } finally {
      setIsPackaging(false);
      setPackProgress(0);
    }
  }

  function handlePrintCertificate() {
    window.print();
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* SVG Filters for Colorblindness Simulation */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id={`${filterSvgId}-deuteranopia`}>
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0 0 0
                      0.700 0.300 0 0 0
                      0     0.300 0.700 0 0
                      0     0     0     1 0"
            />
          </filter>
          <filter id={`${filterSvgId}-protanopia`}>
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0 0 0
                      0.558 0.442 0 0 0
                      0     0.242 0.758 0 0
                      0     0     0     1 0"
            />
          </filter>
          <filter id={`${filterSvgId}-tritanopia`}>
            <feColorMatrix
              type="matrix"
              values="0.950 0.050 0 0 0
                      0     0.433 0.567 0 0
                      0     0.475 0.525 0 0
                      0     0     0     1 0"
            />
          </filter>
          <filter id={`${filterSvgId}-grayscale`}>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-2xl">
        {/* Modal Top Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/80 bg-gradient-to-r from-secondary/40 via-card to-secondary/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center shadow-md">
                <FileCheck className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-display text-foreground flex items-center gap-2 flex-wrap">
                  <span>
                    {isRtl
                      ? "فاز ۴: پکیج کامل سابمیت ژورنال و پیش‌پرواز پذیرش"
                      : "Phase 4: Journal Submission Dossier & Pre-Flight"}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#4F46E5]/15 text-[#4F46E5] dark:text-[#818CF8] border border-[#4F46E5]/30">
                    {standard.badge}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? `آماده‌سازی بدون نقص برای داوران ${standard.publisher} • ابعاد ${standard.widthCm}×${standard.heightCm} سانتی‌متر • ۳۰۰/۶۰۰ DPI`
                    : `Peer-review pre-flight inspection for ${standard.publisher} • ${standard.widthCm}×${standard.heightCm} cm • 300/600 DPI`}
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleDownloadZipPackage}
              disabled={isPackaging || !imageUrl}
              className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white hover:opacity-95 font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Download className="size-3.5" />
              <span>
                {isPackaging
                  ? isRtl
                    ? "در حال بسته‌بندی..."
                    : "Packaging..."
                  : isRtl
                    ? "دانلود پکیج یکپارچه (.zip)"
                    : "Download Dossier (.zip)"}
              </span>
            </Button>
          </div>
        </DialogHeader>

        {/* Packaging progress banner */}
        {isPackaging && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-primary flex items-center gap-1.5">
                <Sparkles className="size-3.5 animate-spin" />
                {packStep}
              </span>
              <span className="font-mono text-muted-foreground">{packProgress}%</span>
            </div>
            <Progress value={packProgress} className="h-1.5" />
          </div>
        )}

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full flex-1 flex flex-col"
        >
          <div className="px-6 border-b border-border/80 bg-card">
            <TabsList className="bg-transparent h-12 p-0 gap-6">
              <TabsTrigger
                value="preflight"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-semibold gap-1.5 px-1"
              >
                <Eye className="size-3.5 text-[#06B6D4]" />
                <span>{isRtl ? "آزمون پیش‌پرواز داوری" : "Pre-Flight Inspector"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="ethics"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-semibold gap-1.5 px-1"
              >
                <ShieldCheck className="size-3.5 text-blue-500" />
                <span>{isRtl ? "اظهارنامه شفافیت (برای استاد)" : "AI Ethics Declaration"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="certificate"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-semibold gap-1.5 px-1"
              >
                <Award className="size-3.5 text-amber-500" />
                <span>{isRtl ? "گواهی اصالت علمی" : "Scientific Certificate"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="package"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-semibold gap-1.5 px-1"
              >
                <FileArchive className="size-3.5 text-purple-500" />
                <span>{isRtl ? "محتویات پکیج ZIP" : "ZIP Dossier Bundle"}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: PRE-FLIGHT INSPECTOR */}
            <TabsContent value="preflight" className="m-0 space-y-6">
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Check className="size-3.5" />
                    <span>{isRtl ? "نسبت ابعاد مجله" : "Aspect Ratio"}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 text-foreground">
                    {standard.aspectRatio}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {standard.widthCm} × {standard.heightCm} cm
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Check className="size-3.5" />
                    <span>{isRtl ? "رزولوشن چاپ" : "Print Resolution"}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 text-foreground">300 / 600 DPI</p>
                  <p className="text-[10px] text-muted-foreground">
                    ≥ {standard.minDpi} DPI {isRtl ? "الزام ناشر" : "Publisher Req"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Check className="size-3.5" />
                    <span>{isRtl ? "پس‌زمینه سفید خالص" : "Background Purity"}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 text-foreground">
                    #FFFFFF (Pure White)
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRtl ? "بدون قاب دور" : "Borderless, No Dark Box"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    <ShieldCheck className="size-3.5" />
                    <span>{isRtl ? "راستی‌آزمایی شیمی" : "NIH PubChem"}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 text-foreground">
                    {reactionAudit
                      ? `${reactionAudit.scientificScore}/100 Score`
                      : "Author Verified"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {reactionAudit?.isBalanced ? "Stoichiometric Pass" : "Verified Structures"}
                  </p>
                </div>
              </div>

              {/* SIMULATOR 1: Thumbnail Legibility (Elsevier ScienceDirect rule) */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-[#06B6D4]" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isRtl
                          ? "آزمون خوانایی بندانگشتی (Elsevier / ScienceDirect Thumbnail Rule)"
                          : "Elsevier ScienceDirect Thumbnail Legibility Test"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {isRtl
                          ? "سردبیران ژورنال‌ها الزام می‌کنند که داستان اصلی تصویر در ابعاد بندانگشتی (۲۰۰ پیکسل) فوراً قابل درک باشد."
                          : "Editors check if the visual story and direction remain clear at 200px preview size on ScienceDirect."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/60">
                    {(["200", "150", "100"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setThumbnailSize(sz)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          thumbnailSize === sz
                            ? "bg-card text-foreground shadow-2xs border border-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-center justify-around gap-4">
                  {/* Miniature Thumbnail Box */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground mb-1 font-mono">
                      ScienceDirect Preview ({thumbnailSize}px)
                    </span>
                    <div
                      style={{
                        width: `${thumbnailSize}px`,
                        filter:
                          visionFilter !== "normal"
                            ? `url(#${filterSvgId}-${visionFilter})`
                            : undefined,
                      }}
                      className="rounded border border-border/90 bg-white p-1 shadow-sm transition-all"
                    >
                      <img
                        src={imageUrl}
                        alt="Thumbnail test"
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm text-[11px]">
                    <div className="flex items-start gap-1.5 text-foreground">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {isRtl
                          ? "جهت فلش‌ها و پیشرفت واکنش از چپ به راست در اندازه بندانگشتی واضح است."
                          : "Reaction flow from reactants to products is visually intuitive."}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-foreground">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {isRtl
                          ? "کنتراست مناسب عناصر با پس‌زمینه سفید (#FFFFFF) مانع محوشدن جزئیات می‌شود."
                          : "High foreground-to-white contrast prevents detail wash-out."}
                      </span>
                    </div>
                    {onOpenMechanism && (
                      <div className="pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onOpenMechanism}
                          className="h-7 text-[11px] gap-1 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          <Layers className="size-3" />
                          <span>
                            {isRtl
                              ? "تنظیم و درشت‌کردن برچسب‌ها با لایه‌های وکتور"
                              : "Enhance Labels with Vector Mechanism Layer"}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SIMULATOR 2: Color Accessibility & Colorblindness Simulation */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="size-4 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isRtl
                          ? "شبیه‌ساز دسترس‌پذیری رنگ و کوررنگی داوران (Color Accessibility)"
                          : "Reviewer Colorblindness & Contrast Simulator"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {isRtl
                          ? "اطمینان از اینکه داوران یا خوانندگان با نقایص بینایی رنگ (قرمز-سبز یا چاپ سیاه‌سفید) داده‌ها را به درستی تشخیص می‌دهند."
                          : "Test if reviewers with color vision deficiencies or black & white print readers can distinguish all reaction pathways."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/60">
                    {(
                      [
                        { id: "normal", label: isRtl ? "عادی" : "Normal" },
                        { id: "deuteranopia", label: isRtl ? "دئوترانوپیا" : "Deuteranopia" },
                        { id: "protanopia", label: isRtl ? "پروتانوپیا" : "Protanopia" },
                        { id: "tritanopia", label: isRtl ? "تریتانوپیا" : "Tritanopia" },
                        { id: "grayscale", label: isRtl ? "سیاه‌سفید" : "Grayscale" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setVisionFilter(f.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          visionFilter === f.id
                            ? "bg-card text-foreground shadow-2xs border border-border/60 font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Preview Canvas */}
                <div className="p-4 rounded-lg bg-white border border-border flex flex-col items-center justify-center">
                  <div
                    style={{
                      filter:
                        visionFilter !== "normal"
                          ? `url(#${filterSvgId}-${visionFilter})`
                          : undefined,
                    }}
                    className="max-w-md w-full transition-all"
                  >
                    <img
                      src={imageUrl}
                      alt="Colorblindness simulation"
                      className="w-full h-auto object-contain rounded"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-2 font-mono">
                    Filter: {visionFilter.toUpperCase()} • Pure White #FFFFFF Background
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: AI ETHICS DECLARATION (PROFESSOR & JOURNAL PEACE OF MIND) */}
            <TabsContent value="ethics" className="m-0 space-y-4">
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {isRtl
                        ? "خیال کاملاً آسوده برای شما، استاد راهنما و سردبیر ژورنال"
                        : "Full Peace of Mind for Author, Professor & Journal Editor"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {isRtl
                        ? "نگرانی رایج استادان این است که ژورنال‌ها استفاده مخفیانه از هوش مصنوعی را نمی‌پذیرند. طبق دستورالعمل رسمی ۲۰۲۴ انتشارات Nature، Elsevier و انجمن شیمی آمریکا (ACS)، استفاده از ابزارهای کمکی برای طراحی چکیده تصویری کاملاً مجاز است، به شرطی که به‌صورت شفاف اعلام (Declare) شود و نظارت علمی انسانی تضمین گردد."
                        : "Professors rightly worry about undeclared AI use. Under official 2024 Nature Portfolio, Elsevier, and ACS policies, computational drafting of Graphical Abstracts is 100% permitted provided it is disclosed and author oversight is attested."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manuscript Metadata Inputs */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  {isRtl
                    ? "مشخصات دست‌نوشته برای درج در اظهارنامه رسمی:"
                    : "Manuscript Details for Official Declaration:"}
                </span>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {isRtl ? "عنوان مقاله:" : "Paper Title:"}
                    </Label>
                    <Input
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      placeholder={isRtl ? "عنوان مقاله پژوهشی..." : "Synthesis of..."}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {isRtl ? "نویسنده مسئول:" : "Lead Author:"}
                    </Label>
                    <Input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={isRtl ? "نام نویسنده..." : "Dr. / Prof. ..."}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {isRtl ? "دانشگاه / پژوهشگاه:" : "Institution:"}
                    </Label>
                    <Input
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder={isRtl ? "دانشگاه تهران، شریف..." : "University of..."}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Official Declaration Output Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-blue-500" />
                    {isRtl
                      ? "متن رسمی بیانیه (جهت ارائه به استاد و درج در Cover Letter):"
                      : "Official Declaration Text (for Cover Letter & Manuscript):"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDeclaration("en")}
                      className="h-7 text-xs gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                    >
                      {declarationCopied ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>{isRtl ? "کپی متن انگلیسی (ژورنال)" : "Copy English Declaration"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDeclaration("fa")}
                      className="h-7 text-xs gap-1"
                    >
                      <Copy className="size-3" />
                      <span>{isRtl ? "کپی متن فارسی (استاد)" : "Copy Persian Text"}</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/30 font-mono text-xs text-foreground/90 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed select-all">
                  {declarations.en}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: CERTIFICATE OF SCIENTIFIC VERIFICATION */}
            <TabsContent value="certificate" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {isRtl
                      ? "گواهی دیجیتال راستی‌آزمایی علمی و عدم توهم"
                      : "Certificate of Scientific Verification & Human Oversight"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {isRtl
                      ? "این سند رسمی قابل چاپ را به استاد راهنما یا پیوست پرونده پژوهشی ارائه دهید."
                      : "Official verifiable certificate for your advisor, thesis defense, or manuscript dossier."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyHash}
                    className="h-7 text-xs gap-1"
                  >
                    {hashCopied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span className="font-mono text-[10px]">{verificationHash}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePrintCertificate}
                    className="h-7 text-xs gap-1 bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  >
                    <Printer className="size-3" />
                    <span>{isRtl ? "چاپ گواهی" : "Print Certificate"}</span>
                  </Button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md space-y-5 text-center relative overflow-hidden">
                {/* Decorative background watermark */}
                <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-[#06B6D4]/5 blur-2xl pointer-events-none" />

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    <ShieldCheck className="size-3.5" />
                    <span>NIH PUBCHEM VERIFIED • HUMAN SCIENTIFIC OVERSIGHT</span>
                  </div>
                  <h2 className="text-lg font-extrabold font-display text-foreground tracking-tight pt-2">
                    CERTIFICATE OF SCIENTIFIC INTEGRITY
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    ChemAbstract Forge Research Integrity Certification System (2026)
                  </p>
                </div>

                <div className="max-w-xl mx-auto text-xs text-foreground/80 leading-relaxed text-justify space-y-2 bg-secondary/30 p-4 rounded-xl border border-border/80">
                  <p>
                    This document certifies that the graphical schematic designed for{" "}
                    <strong>{dossierMeta.paperTitle}</strong> intended for publication in{" "}
                    <strong>{standard.fullName}</strong> ({standard.publisher}) has undergone strict
                    stoichiometric and chemical valency evaluation.
                  </p>
                  <p>
                    All molecular structures and IUPAC representations were cross-verified against
                    the National Center for Biotechnology Information (NCBI / NIH PubChem) database.
                    No hypervalent carbon anomalies or phantom chemical groups are present in the
                    approved release.
                  </p>
                </div>

                {/* Verification Matrix */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">Verification ID</span>
                    <span className="font-mono font-bold text-foreground text-[10px]">
                      {verificationHash}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">
                      Target Publisher
                    </span>
                    <span className="font-bold text-foreground text-[11px]">
                      {standard.publisher.split(" ")[0]}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">Evaluation Date</span>
                    <span className="font-bold text-foreground text-[11px]">
                      {dossierMeta.date}
                    </span>
                  </div>
                </div>

                {/* Sign-off signatures */}
                <div className="pt-4 border-t border-border/80 grid grid-cols-2 gap-8 max-w-md mx-auto text-center text-xs">
                  <div>
                    <div className="h-9 border-b border-dashed border-neutral-400 mb-1 flex items-end justify-center font-serif italic text-muted-foreground text-xs">
                      {dossierMeta.correspondingAuthor}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Author / Investigator Signature
                    </span>
                  </div>
                  <div>
                    <div className="h-9 border-b border-dashed border-neutral-400 mb-1 flex items-end justify-center font-mono text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      [VERIFIED-PASS-2026]
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Digital PubChem Stamp
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: COMPLETE SUBMISSION ZIP DOSSIER */}
            <TabsContent value="package" className="m-0 space-y-4">
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileArchive className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {isRtl
                        ? "بسته کامل سابمیت آماده بارگذاری در ژورنال (.zip)"
                        : "All-in-One Journal Submission Package (.zip)"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isRtl
                        ? "یک فایل زیپ شامل تمام تصاویری ۳۰۰ و ۶۰۰ DPI، اظهارنامه اخلاقی، دیتاشیت واکنش و راهنمای سابمیت"
                        : "Contains print-ready 300 & 600 DPI graphics, COPE declaration, chemical data sheet, and submission guide"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleDownloadZipPackage}
                  disabled={isPackaging || !imageUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>
                    {isRtl ? "دانلود پکیج کامل (.zip)" : "Download Complete Bundle (.zip)"}
                  </span>
                </Button>
              </div>

              {/* Package Content List Inspection */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  {isRtl
                    ? "فایل‌های داخل بسته دانلودی:"
                    : "Files bundled inside the submission dossier:"}
                </span>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">🖼️</span>
                      <span className="text-foreground">
                        01_{standard.id.toUpperCase()}_TOC_300DPI_Standard.png
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? "نسخه اصلی ۳۰۰ DPI" : "Primary 300 DPI Artwork"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 font-bold">🖼️</span>
                      <span className="text-foreground">
                        02_{standard.id.toUpperCase()}_TOC_600DPI_HighDef.png
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? "نسخه وضوح بالا ۶۰۰ DPI" : "High-Def 600 DPI Print"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 font-bold">📄</span>
                      <span className="text-foreground">
                        03_Cover_Letter_AI_Assistance_Declaration.txt
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? "اظهارنامه رسمی COPE" : "COPE AI Declaration Form"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">📊</span>
                      <span className="text-foreground">
                        04_Chemical_Verification_DataSheet.txt
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? "دیتاشیت موازنه و PubChem" : "PubChem Chemical Audit Sheet"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-500 font-bold">📋</span>
                      <span className="text-foreground">
                        05_Submission_Guide_{standard.id.toUpperCase()}.txt
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {isRtl ? "راهنمای سابمیت ژورنال" : "Author Submission Guide"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
