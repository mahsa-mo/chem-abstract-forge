import React, { useState } from "react";
import {
  JOURNAL_STANDARDS,
  COLOR_SCHEMES,
  type JournalId,
  type ColorSchemeId,
} from "@/lib/journal-standards";
import { useI18n } from "@/lib/i18n";
import {
  BookOpen,
  Palette,
  Check,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

interface JournalPresetSelectorProps {
  selectedJournal: JournalId;
  onSelectJournal: (id: JournalId) => void;
  selectedColorScheme: ColorSchemeId;
  onSelectColorScheme: (id: ColorSchemeId) => void;
  className?: string;
}

export function JournalPresetSelector({
  selectedJournal,
  onSelectJournal,
  selectedColorScheme,
  onSelectColorScheme,
  className = "",
}: JournalPresetSelectorProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";
  const [showDetails, setShowDetails] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const currentStandard = JOURNAL_STANDARDS[selectedJournal] ?? JOURNAL_STANDARDS.acs;
  const currentColorScheme = COLOR_SCHEMES[selectedColorScheme] ?? COLOR_SCHEMES["academic-clean"];

  const journalList: JournalId[] = ["acs", "elsevier", "rsc", "nature", "wiley", "general"];
  const colorList: ColorSchemeId[] = [
    "academic-clean",
    "colorblind-safe",
    "high-contrast",
    "nature-editorial",
  ];

  return (
    <div
      className={`rounded-xl border border-border/80 bg-background/60 p-3 shadow-2xs backdrop-blur-xs transition-all ${className}`}
    >
      {/* Top Header: Label + Active Standard Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
            <BookOpen className="size-3.5" aria-hidden />
          </div>
          <div>
            <span className="text-xs font-bold font-display text-foreground">
              {isRtl ? "استاندارد ژورنال علمی" : "Journal Editorial Standard"}
            </span>
            <span className="hidden sm:inline-block ms-2 text-[10px] font-mono text-muted-foreground">
              {currentStandard.widthCm}×{currentStandard.heightCm} cm •{" "}
              {currentStandard.aspectRatio}
            </span>
          </div>
        </div>

        {/* Action icons / details toggle */}
        <div className="flex items-center gap-1.5 ms-auto">
          {/* Color palette popover toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowDetails(false);
              }}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border border-border/70 bg-card hover:bg-secondary text-foreground transition-colors"
              title={isRtl ? "انتخاب پالت رنگی" : "Select color scheme"}
            >
              <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                {currentColorScheme.colors.slice(0, 3).map((col, idx) => (
                  <span
                    key={idx}
                    className="size-2.5 rounded-full border border-background shadow-2xs"
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
              <span className="hidden md:inline text-[10px]">
                {isRtl ? currentColorScheme.nameFa : currentColorScheme.nameEn}
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {/* Color Scheme Dropdown */}
            {showColorPicker && (
              <div className="absolute top-full mt-1.5 end-0 z-30 w-64 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-2 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-foreground px-2 py-1 border-b border-border/50 flex items-center gap-1.5">
                  <Palette className="size-3 text-[#06B6D4]" />
                  <span>{isRtl ? "پالت رنگ و دسترسی‌پذیری" : "Color Palette & Accessibility"}</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {colorList.map((cid) => {
                    const c = COLOR_SCHEMES[cid];
                    const active = selectedColorScheme === cid;
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => {
                          onSelectColorScheme(cid);
                          setShowColorPicker(false);
                        }}
                        className={`w-full text-start px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{isRtl ? c.nameFa : c.nameEn}</span>
                            {cid === "colorblind-safe" && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                                Safe
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {isRtl ? c.descriptionFa : c.descriptionEn}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ms-2">
                          <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                            {c.colors.map((clr, i) => (
                              <span
                                key={i}
                                className="size-2.5 rounded-full border border-background shadow-2xs"
                                style={{ backgroundColor: clr }}
                              />
                            ))}
                          </div>
                          {active && <Check className="size-3.5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Journal Guidelines toggle */}
          <button
            type="button"
            onClick={() => {
              setShowDetails(!showDetails);
              setShowColorPicker(false);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
              showDetails
                ? "bg-primary/15 border-primary/40 text-primary"
                : "border-border/70 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title={isRtl ? "مشاهده الزامات تحریریه" : "View editorial guidelines"}
          >
            <Info className="size-3" />
            <span className="text-[10px]">{isRtl ? "الزامات" : "Rules"}</span>
          </button>
        </div>
      </div>

      {/* Journal Pills Carousel / Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {journalList.map((jid) => {
          const item = JOURNAL_STANDARDS[jid];
          const isSelected = selectedJournal === jid;
          return (
            <button
              key={jid}
              type="button"
              onClick={() => onSelectJournal(jid)}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                isSelected
                  ? "bg-card border-primary ring-1 ring-primary/40 shadow-xs"
                  : "bg-secondary/40 border-border/60 hover:bg-secondary hover:border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`text-xs font-bold font-display line-clamp-1 transition-colors ${
                  isSelected ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {item.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                {item.aspectRatio}
              </span>

              {/* Tiny indicator bar with journal brand accent */}
              <span
                className={`mt-1.5 h-0.5 w-6 rounded-full transition-all ${
                  isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-40"
                }`}
                style={{ backgroundColor: item.color }}
              />
            </button>
          );
        })}
      </div>

      {/* Collapsible Journal Requirement Inspector */}
      {showDetails && (
        <div className="mt-2.5 p-2.5 rounded-lg border border-border/70 bg-secondary/30 text-xs animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="size-3.5 text-emerald-500" />
                <span className="font-bold text-foreground">
                  {currentStandard.fullName} ({currentStandard.publisher})
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isRtl ? currentStandard.descriptionFa : currentStandard.descriptionEn}
              </p>
            </div>
            <div className="text-end shrink-0 font-mono text-[10px] text-muted-foreground">
              <span className="block font-semibold text-foreground">
                {currentStandard.widthCm} × {currentStandard.heightCm} cm
              </span>
              <span>≥ {currentStandard.minDpi} DPI</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-border/40 grid sm:grid-cols-2 gap-1.5 text-[11px]">
            {currentStandard.editorialRules.slice(0, 4).map((rule, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                <CheckCircle2 className="size-3 text-[#06B6D4] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
