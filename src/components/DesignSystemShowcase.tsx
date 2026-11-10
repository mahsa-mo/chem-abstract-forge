import { useState } from "react";
import { Palette, ArrowUpRight, Check, FlaskConical } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  IconAbstractStudio,
  IconStructureDrawer,
  IconChemicalDatabase,
  IconStoichiometryLab,
} from "@/components/ChemIcons";

export function TheFeelingSection({
  onSelectView,
}: {
  onSelectView?: (view: "studio" | "explorer" | "drawer" | "stoich") => void;
}) {
  const { locale, t } = useI18n();
  const isFa = locale === "fa";

  const modules = [
    {
      id: "studio" as const,
      badge: isFa ? "بخش ۱ · استودیو اصلی" : "01 · Core Studio",
      title: isFa ? "استودیو تصویرسازی گرافیکال ابسترکت" : "Graphical Abstract Studio",
      desc: isFa
        ? "تبدیل متن مقاله یا معادله واکنش به تصویر علمی استاندارد 16:9، به همراه افزونه ویرایشگر بوم و پیش‌نمایش سه‌بعدی."
        : "Transform reaction text into 16:9 TOC visuals with integrated canvas editing and 3D molecular preview.",
      Icon: IconAbstractStudio,
      accent: "#06B6D4",
    },
    {
      id: "drawer" as const,
      badge: isFa ? "بخش ۲ · طراحی ساختار" : "02 · Structure Sketcher",
      title: isFa ? "رسم ساختار شیمیایی ۲بعدی" : "2D Structure Drawer",
      desc: isFa
        ? "طراحی مستقیم حلقه‌های آروماتیک، پیوندها و گروه‌های عاملی با تولید زنده کد SMILES و خروجی 300 DPI."
        : "Sketch rings, bonds, and functional groups with bidirectional SMILES sync and 300 DPI vector export.",
      Icon: IconStructureDrawer,
      accent: "#F43F5E",
    },
    {
      id: "explorer" as const,
      badge: isFa ? "بخش ۳ · مرجع شیمیایی" : "03 · Reference Database",
      title: isFa ? "بانک ترکیبات و واکنش‌های نام‌دار" : "Chemical & Reaction DB",
      desc: isFa
        ? "جستجوی زنده در PubChem (خواص فیزیکی و ایمنی GHS) به همراه دانشنامه واکنش‌های نام‌دار شیمی آلی."
        : "Live PubChem compound lookup with GHS safety data plus a curated encyclopedia of named reactions.",
      Icon: IconChemicalDatabase,
      accent: "#6366F1",
    },
    {
      id: "stoich" as const,
      badge: isFa ? "بخش ۴ · محاسبات و جدول" : "04 · Quantitative Lab",
      title: isFa ? "آزمایشگاه استوکیومتری و جدول تناوبی" : "Stoichiometry & Periodic Lab",
      desc: isFa
        ? "موازنه‌گر معادلات شیمیایی، جدول استوکیومتری و بازده، محلول‌سازی، بافر pH و جدول تناوبی ۱۱۸ عنصر."
        : "Equation balancer, reaction yield table, molarity & dilution, pH buffers, and 118-element periodic table.",
      Icon: IconStoichiometryLab,
      accent: "#10B981",
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-5 sm:p-6 shadow-card">
      {/* Dedicated Platform Introduction & Tagline Banner (Moved out of Header for a clean navbar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-border/70">
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#4F46E5]/15 to-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0 mt-0.5">
            <FlaskConical className="size-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-display text-foreground">
                {t("app.name")} —{" "}
                {isFa ? "راهنمای بخش‌های تخصصی پلتفرم" : "Platform Workspace Guide"}
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {t("app.tagline")}
              {" · "}
              {isFa
                ? "تمامی ابزارهای این پلتفرم در ۴ میزکار مجزا و منظم دسته‌بندی شده‌اند تا بدون شلوغی به هر بخش دسترسی داشته باشید."
                : "All scientific instruments are organized into 4 focused workspaces for a clean, distraction-free workflow."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {modules.map((mod) => {
          const IconComponent = mod.Icon;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                onSelectView?.(mod.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative flex flex-col justify-between text-start rounded-xl p-4 bg-background/70 hover:bg-background border border-border/80 hover:border-foreground/25 transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className="size-11 rounded-xl flex items-center justify-center border p-1.5"
                    style={{
                      backgroundColor: `${mod.accent}12`,
                      borderColor: `${mod.accent}30`,
                    }}
                  >
                    <IconComponent className="size-8" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5 group-hover:text-foreground transition-colors">
                    <span>{mod.badge}</span>
                    <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>

                <h3 className="text-sm font-bold font-display text-foreground group-hover:text-[#06B6D4] transition-colors">
                  {mod.title}
                </h3>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
              </div>
            </button>
          );
        })}
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
    },
    {
      hex: "#06B6D4",
      name: isFa ? "فیروزه‌ای" : "Laser Cyan",
    },
    {
      hex: "#10B981",
      name: isFa ? "سبز زمردی" : "Emerald Green",
    },
    {
      hex: "#F59E0B",
      name: isFa ? "کهربایی پرانرژی" : "Solar Amber",
    },
    {
      hex: "#EC4899",
      name: isFa ? "سرخابی / صورتی" : "Vivid Magenta",
    },
    {
      hex: "#F8FAFC",
      name: isFa ? "بستر بلورین" : "Clean Substrate",
    },
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
    </div>
  );
}
