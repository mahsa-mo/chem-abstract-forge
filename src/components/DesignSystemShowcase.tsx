import { useState } from "react";
import {
  Sparkles,
  Palette,
  Zap,
  ShieldCheck,
  Clock,
  Lightbulb,
  ChevronRight,
  Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function TheFeelingSection() {
  const { locale } = useI18n();
  const isFa = locale === "fa";

  return (
    <section className="mt-8 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-5 sm:p-7 shadow-card">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            {isFa ? "هویت بصری و حس تجربه کاربری" : "The Feeling"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground mt-1">
            <span className="text-[#4F46E5] dark:text-[#818CF8]">
              {isFa ? "علمی. " : "Scientific. "}
            </span>
            <span className="text-[#EC4899] dark:text-[#F472B6]">
              {isFa ? "الهام‌بخش. " : "Inspiring. "}
            </span>
            <span className="text-[#10B981] dark:text-[#34D399]">
              {isFa ? "توانمندساز." : "Empowering."}
            </span>
          </h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          {isFa
            ? "ترکیب رنگی غنی و هدفمند با تفکیک بصری بخش‌ها برای جلوگیری از یکنواختی و ایجاد تجربه کاربری خلاق و پرانرژی."
            : "A vibrant, multi-hued scientific palette designed to banish monotony and elevate research communication."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Scientific Accuracy (Cyan) */}
        <div className="relative group rounded-xl p-4 bg-gradient-to-b from-[#06B6D4]/10 to-transparent border border-[#06B6D4]/25 hover:border-[#06B6D4]/60 transition-all shadow-2xs hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="size-9 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#06B6D4]">
                #06B6D4
              </span>
              <h3 className="text-sm font-bold font-display text-foreground">
                {isFa ? "دقت علمی" : "Scientific Accuracy"}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? "طراحی‌شده برای پژوهشگرانی که به جزئیات ساختار شیمیایی و مکانیزم اهمیت می‌دهند."
              : "Designed for researchers who care about precise chemical details and mechanisms."}
          </p>
        </div>

        {/* Card 2: Boost Creativity (Magenta) */}
        <div className="relative group rounded-xl p-4 bg-gradient-to-b from-[#EC4899]/10 to-transparent border border-[#EC4899]/25 hover:border-[#EC4899]/60 transition-all shadow-2xs hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="size-9 rounded-lg bg-[#EC4899]/15 border border-[#EC4899]/30 flex items-center justify-center text-[#EC4899]">
              <Zap className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EC4899]">
                #EC4899
              </span>
              <h3 className="text-sm font-bold font-display text-foreground">
                {isFa ? "تقویت خلاقیت" : "Boost Creativity"}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? "تبدیل ایده‌های پیچیده به تصاویر گرافیکی چشم‌نواز و متناسب با استانداردهای بین‌المللی."
              : "Turn complex ideas into stunning, publication-ready visuals that capture reviewer interest."}
          </p>
        </div>

        {/* Card 3: Save Time (Emerald) */}
        <div className="relative group rounded-xl p-4 bg-gradient-to-b from-[#10B981]/10 to-transparent border border-[#10B981]/25 hover:border-[#10B981]/60 transition-all shadow-2xs hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="size-9 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981]">
                #10B981
              </span>
              <h3 className="text-sm font-bold font-display text-foreground">
                {isFa ? "صرفه‌جویی در زمان" : "Save Time"}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? "دستیار هوش مصنوعی تخصصی برای تسریع فرآیند آماده‌سازی مقالات شیمی و داروسازی."
              : "AI-powered chemical abstraction assistance for faster publication turnaround."}
          </p>
        </div>

        {/* Card 4: Stay Inspired (Amber) */}
        <div className="relative group rounded-xl p-4 bg-gradient-to-b from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/25 hover:border-[#F59E0B]/60 transition-all shadow-2xs hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="size-9 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                #F59E0B
              </span>
              <h3 className="text-sm font-bold font-display text-foreground">
                {isFa ? "الهام‌بخش و پویا" : "Stay Inspired"}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? "محیط کاری مدرن و باانرژی که شما را در جریان پیوسته نوآوری و پژوهش قرار می‌دهد."
              : "An energetic, fluid workspace that keeps you in the creative research flow."}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ColorPaletteInspector() {
  const { locale } = useI18n();
  const isFa = locale === "fa";
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const colors = [
    {
      hex: "#4F46E5",
      name: isFa ? "آبی کبالت" : "Indigo Blue",
      role: isFa ? "اعتماد، دانش، عمق علمی" : "Trust, Knowledge, Scientific Depth",
    },
    {
      hex: "#06B6D4",
      name: isFa ? "فیروزه‌ای" : "Laser Cyan",
      role: isFa ? "نوآوری، خلاقیت، تکنولوژی" : "Innovation, Creativity, Technology",
    },
    {
      hex: "#10B981",
      name: isFa ? "سبز زمردی" : "Emerald Green",
      role: isFa ? "رشد، زندگی، پایداری" : "Growth, Life, Sustainability",
    },
    {
      hex: "#F59E0B",
      name: isFa ? "کهربایی پرانرژی" : "Solar Amber",
      role: isFa ? "انرژی، الهام، خلاقیت" : "Energy, Inspiration, Heat",
    },
    {
      hex: "#EC4899",
      name: isFa ? "سرخابی / صورتی" : "Vivid Magenta",
      role: isFa ? "انگیزه، تجدید، اشتیاق" : "Motivation, Renewal, Passion",
    },
    {
      hex: "#F8FAFC",
      name: isFa ? "بستر بلورین" : "Clean Substrate",
      role: isFa ? "وضوح، تمیزی، خوانایی" : "Clarity, Purity, High Legibility",
    },
  ];

  const gradients = [
    { name: "Ideas Flow", style: "from-[#4F46E5] to-[#06B6D4]" },
    { name: "Energy Burst", style: "from-[#7C3AED] via-[#EC4899] to-[#F59E0B]" },
    { name: "Science Fusion", style: "from-[#4F46E5] to-[#10B981]" },
    { name: "Fresh Light", style: "from-[#10B981] to-[#06B6D4]" },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-md p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-[#4F46E5]" />
          <h3 className="font-display font-bold text-sm text-foreground">
            {isFa ? "پالت رنگی علمی و پرانرژی" : "Design System & Color Spectrum"}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {isFa ? "الهام‌گرفته از هویت بصری ChemAbstract" : "Multi-Color Vibrant Palette"}
        </span>
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        {colors.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => handleCopy(c.hex)}
            className="group relative flex flex-col p-2 rounded-xl border border-border/70 hover:border-foreground/30 bg-secondary/30 transition-all text-left"
            title={`Click to copy ${c.hex}`}
          >
            <div
              className="h-10 w-full rounded-lg mb-2 shadow-2xs flex items-center justify-center transition-transform group-hover:scale-[1.02]"
              style={{ backgroundColor: c.hex }}
            >
              {copiedHex === c.hex ? (
                <Check
                  className={`size-4 ${c.hex === "#F8FAFC" ? "text-slate-900" : "text-white"}`}
                />
              ) : null}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-foreground">{c.hex}</span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Gradients Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60">
        {gradients.map((g) => (
          <div key={g.name} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
              {g.name}
            </span>
            <div className={`h-4 w-full rounded-full bg-gradient-to-r ${g.style} shadow-2xs`} />
          </div>
        ))}
      </div>
    </div>
  );
}
