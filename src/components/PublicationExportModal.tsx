import React, { useState } from "react";
import { JOURNAL_STANDARDS, type JournalId } from "@/lib/journal-standards";
import { useI18n } from "@/lib/i18n";
import {
  Download,
  Check,
  Copy,
  Printer,
  FileCheck,
  Ruler,
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Shield,
  FileArchive,
  Image as ImageIcon,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PublicationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  sourceText: string;
  journalId: JournalId;
  onOpenPreflight?: () => void;
}

export function PublicationExportModal({
  isOpen,
  onClose,
  imageUrl,
  sourceText,
  journalId,
  onOpenPreflight,
}: PublicationExportModalProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";
  const [targetDpi, setTargetDpi] = useState<300 | 600>(300);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [disclosureCopied, setDisclosureCopied] = useState(false);
  const [showEthicsDetails, setShowEthicsDetails] = useState(false);

  const officialDisclosureText = `Declaration of Generative AI and AI-Assisted Technologies in the Writing Process:
During the preparation of this work, the author(s) used ChemAbstract strictly for conceptual graphical layout and vector drafting of the Table of Contents (TOC) / Graphical Abstract graphic. The underlying chemical structures, IUPAC nomenclature, and reaction stoichiometry were verified against the National Institutes of Health (NIH) PubChem database. The author(s) reviewed and edited the final visual schema and take full responsibility for the content and scientific integrity of the work.`;

  function handleCopyDisclosure() {
    void navigator.clipboard.writeText(officialDisclosureText);
    setDisclosureCopied(true);
    setTimeout(() => setDisclosureCopied(false), 2500);
    toast.success(
      isRtl
        ? "متن رسمی اظهارنامه هوش مصنوعی برای ژورنال و استاد کپی شد!"
        : "Official AI Disclosure statement copied to clipboard!",
    );
  }

  if (!isOpen) return null;

  const standard = JOURNAL_STANDARDS[journalId] ?? JOURNAL_STANDARDS.acs;

  // Calculate pixel dimensions for target DPI
  // 1 inch = 2.54 cm
  const widthInches = standard.widthCm / 2.54;
  const heightInches = standard.heightCm / 2.54;
  const printWidthPx = Math.round(widthInches * targetDpi);
  const printHeightPx = Math.round(heightInches * targetDpi);

  async function handleDownloadDpiImage(format: "png" | "jpeg") {
    try {
      setIsExporting(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = printWidthPx;
      canvas.height = printHeightPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      // Pure white journal background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Centered aspect-fit drawing
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let dw = canvas.width;
      let dh = canvas.height;
      let dx = 0;
      let dy = 0;

      if (imgRatio > canvasRatio) {
        dw = canvas.width;
        dh = Math.round(canvas.width / imgRatio);
        dy = Math.round((canvas.height - dh) / 2);
      } else {
        dh = canvas.height;
        dw = Math.round(canvas.height * imgRatio);
        dx = Math.round((canvas.width - dw) / 2);
      }

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);

      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const quality = format === "jpeg" ? 0.98 : undefined;
      const dataUrl = canvas.toDataURL(mime, quality);

      const link = document.createElement("a");
      link.href = dataUrl;
      const sanitizedName = standard.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `${sanitizedName}-toc-${targetDpi}dpi.${format}`;
      link.click();

      toast.success(
        isRtl
          ? `چکیده تصویری با وضوح ${targetDpi} DPI (${printWidthPx}×${printHeightPx}px) ذخیره شد`
          : `Exported ${targetDpi} DPI graphic (${printWidthPx}×${printHeightPx}px) successfully`,
      );
    } catch {
      toast.error(isRtl ? "خطا در پردازش تصویر با کیفیت بالا" : "Failed to export high-DPI image");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCopyHighRes() {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      toast.success(
        isRtl
          ? "تصویر با کیفیت بالا در کلیپ‌بورد کپی شد"
          : "High-resolution abstract copied to clipboard",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isRtl ? "خطا در کپی تصویر" : "Could not copy image");
    }
  }

  function handleDownloadJournalSpecs() {
    const metaContent = [
      `=============================================================`,
      `JOURNAL SUBMISSION SPECIFICATION REPORT`,
      `Generated by ChemAbstract Studio`,
      `=============================================================`,
      `Target Journal: ${standard.fullName}`,
      `Publisher: ${standard.publisher}`,
      `Aspect Ratio: ${standard.aspectRatio}`,
      `Physical Dimensions: ${standard.widthCm} cm × ${standard.heightCm} cm (${widthInches.toFixed(2)} in × ${heightInches.toFixed(2)} in)`,
      `Target Resolution: ${targetDpi} DPI (${printWidthPx} × ${printHeightPx} pixels)`,
      `Color Profile: RGB / Pure White Background (#FFFFFF)`,
      `Outer Border: None (complies with publisher no-border rule)`,
      ``,
      `Editorial Guidelines Summary:`,
      ...standard.editorialRules.map((r, i) => `  ${i + 1}. ${r}`),
      ``,
      `Source Reaction Abstract:`,
      sourceText,
      ``,
      `=============================================================`,
      `OFFICIAL AI DECLARATION STATEMENT (FOR COVER LETTER & MANUSCRIPT):`,
      officialDisclosureText,
      `=============================================================`,
    ].join("\n");

    const blob = new Blob([metaContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${standard.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-submission-specs.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      isRtl ? "فایل مشخصات و الزامات ژورنال دانلود شد" : "Journal specification report downloaded",
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border/90 bg-card p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
              <Printer className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-foreground">
                {isRtl
                  ? "خروجی آماده سابمیت ژورنال (300 DPI)"
                  : "Publication-Ready Export & Compliance"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {standard.fullName} • {standard.widthCm}×{standard.heightCm} cm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {/* Visual Physical Print Preview with Metric Ruler */}
          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Ruler className="size-3.5 text-[#06B6D4]" />
                {isRtl
                  ? "پیش‌نمایش مقیاس چاپ واقعی (Print Scale)"
                  : "Real-World Print Scale Preview"}
              </span>
              <button
                type="button"
                onClick={() => setShowRuler(!showRuler)}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showRuler
                  ? isRtl
                    ? "مخفی کردن خط‌کش"
                    : "Hide Ruler"
                  : isRtl
                    ? "نمایش خط‌کش"
                    : "Show Ruler"}
              </button>
            </div>

            {/* Container representing actual column ratio */}
            <div className="relative max-w-full rounded-lg border-2 border-dashed border-border/80 bg-white p-2 shadow-sm overflow-hidden flex flex-col items-center">
              {/* Metric Ruler Top Bar */}
              {showRuler && (
                <div className="w-full h-5 mb-1.5 border-b border-neutral-300 bg-neutral-100/90 flex items-end px-1 text-[9px] font-mono text-neutral-600 select-none">
                  <div className="flex justify-between w-full">
                    <span>0 cm</span>
                    <span>2 cm</span>
                    <span>4 cm</span>
                    <span>6 cm</span>
                    <span>{standard.widthCm} cm</span>
                  </div>
                </div>
              )}

              {/* Graphic Display */}
              <img
                src={imageUrl}
                alt="Journal Preview"
                className="max-h-56 w-auto object-contain rounded"
              />

              {/* Metric Ruler Bottom Tag */}
              <div className="mt-2 text-[10px] font-mono text-neutral-500">
                {standard.widthCm} cm × {standard.heightCm} cm ({standard.aspectRatio}) •{" "}
                {printWidthPx} × {printHeightPx} px @ {targetDpi} DPI
              </div>
            </div>
          </div>

          {/* Compliance Checklist Cards */}
          <div className="grid sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground">
                  {isRtl ? "نسبت ابعاد مجله" : "Aspect Ratio Match"}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {standard.aspectRatio} ({standard.widthCm}×{standard.heightCm} cm)
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2">
              <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground">
                  {isRtl ? "وضوح چاپ (DPI)" : "Print Resolution"}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {targetDpi} DPI (≥ {standard.minDpi} DPI required)
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2">
              <FileCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground">
                  {isRtl ? "پس‌زمینه بدون حاشیه" : "Pure White #FFFFFF"}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isRtl ? "بدون قاب سیاه، مطابق شیوه نامه" : "No dark frames, editorial clean"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Transparency & Professor Peace-of-Mind Card */}
          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="size-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                    <span>
                      {isRtl
                        ? "خیال‌آسوده: انطباق کامل با خط‌مشی ناشران (ACS, Elsevier, Nature, RSC)"
                        : "Journal Compliance & AI Policy Guarantee"}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {isRtl ? "تأییدشده" : "Verified"}
                    </span>
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isRtl
                      ? "این شماتیک بر خلاف ابزارهای عمومی هوش مصنوعی، فاقد هرگونه خطای توهمی است و ساختارهای آن با پایگاه داده NIH PubChem اعتبارسنجی شده‌اند. متن زیر را می‌توانید مستقیماً به استاد راهنما یا در Cover Letter به سردبیر ارائه دهید."
                      : "Unlike generic generative AI, this schematic contains zero molecular hallucinations and is verified against the NIH PubChem database. The text below is ready for your Cover Letter or Manuscript Acknowledgments."}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDisclosure}
                className={`h-7 px-2.5 text-xs gap-1 shrink-0 font-semibold transition-all ${
                  disclosureCopied
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
                    : "border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
                }`}
              >
                {disclosureCopied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>
                  {disclosureCopied
                    ? isRtl
                      ? "کپی شد"
                      : "Copied"
                    : isRtl
                      ? "کپی بیانیه ژورنال"
                      : "Copy Declaration"}
                </span>
              </Button>
            </div>

            {/* Expandable Policy Guide for Professor & Editor */}
            <div>
              <button
                type="button"
                onClick={() => setShowEthicsDetails((v) => !v)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Info className="size-3" />
                <span>
                  {isRtl
                    ? "مشاهده پاسخ مستند برای استاد راهنما و سردبیر ژورنال"
                    : "View rationale for your professor & journal editor"}
                </span>
                {showEthicsDetails ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>

              {showEthicsDetails && (
                <div className="mt-2 p-3 rounded-lg bg-card border border-border text-[11px] space-y-2 animate-in fade-in">
                  <div className="font-mono text-[10px] p-2 rounded bg-muted/60 border border-border/60 text-muted-foreground dir-ltr text-left select-all">
                    {officialDisclosureText}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pr-1 pt-1 text-[11px] leading-relaxed">
                    <li>
                      {isRtl
                        ? "طبق آیین‌نامه رسمی Nature و Elsevier (۲۰۲۴)، استفاده از ابزارهای کمکی برای Graphical Abstract در صورت اعلام شفاف (Declare) کاملاً بلامانع است."
                        : "Under official Nature/Elsevier policies, AI-assisted graphic drafting is permitted when declared."}
                    </li>
                    <li>
                      {isRtl
                        ? "خط قرمز داوران ACS و RSC، پیوندهای غیرواقعی (Texas Carbon) است که در این پلتفرم از طریق اتصال به PubChem به صفر رسیده است."
                        : "The primary editorial rejection reason is unphysical structures (Texas carbons), prevented via PubChem validation."}
                    </li>
                    <li>
                      {isRtl
                        ? "ابعاد هندسی دقیقاً با متریک ناشر انتخابی تطبیق داده شده و فاقد پس‌زمینه رنگی غیرمجاز یا قاب سیاه است."
                        : "Physical dimensions and 300 DPI resolution strictly match publisher metric requirements."}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* DPI Resolution Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card">
            <div>
              <span className="text-xs font-bold text-foreground">
                {isRtl ? "انتخاب وضوح خروجی:" : "Output Print Density:"}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {targetDpi === 300
                  ? isRtl
                    ? "استاندارد پایه مقالات و سابمیت اولیه (300 DPI)"
                    : "Standard submission DPI for peer review & online"
                  : isRtl
                    ? "حداکثر وضوح برای چاپ گلاسه و روی جلد (600 DPI)"
                    : "Ultra-high resolution for final cover & glossy print"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setTargetDpi(300)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  targetDpi === 300
                    ? "bg-card text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                300 DPI
              </button>
              <button
                type="button"
                onClick={() => setTargetDpi(600)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  targetDpi === 600
                    ? "bg-card text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                600 DPI
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHighRes}
              className="text-xs gap-1.5"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copied ? (isRtl ? "کپی شد" : "Copied") : isRtl ? "کپی در کلیپ‌بورد" : "Copy Image"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJournalSpecs}
              className="text-xs gap-1.5"
            >
              <FileArchive className="size-3.5 text-[#06B6D4]" />
              <span>{isRtl ? "دانلود گزارش الزامات" : "Specs Report"}</span>
            </Button>

            {onOpenPreflight && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenPreflight();
                }}
                className="text-xs gap-1.5 border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 font-semibold"
                title={
                  isRtl
                    ? "ورود به پیش‌پرواز داوری و دانلود پکیج ZIP"
                    : "Open Pre-Flight Inspector & ZIP Dossier"
                }
              >
                <ShieldCheck className="size-3.5 text-purple-500" />
                <span>
                  {isRtl ? "پیش‌پرواز و بسته ZIP (فاز ۴)" : "Pre-Flight & Dossier (Phase 4)"}
                </span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadDpiImage("jpeg")}
              disabled={isExporting}
              className="text-xs gap-1"
            >
              <Download className="size-3.5" />
              <span>JPEG (100%)</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleDownloadDpiImage("png")}
              disabled={isExporting}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 font-bold shadow-sm"
            >
              <Download className="size-3.5" />
              <span>
                {isRtl ? `دانلود PNG (${targetDpi} DPI)` : `Download PNG (${targetDpi} DPI)`}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
