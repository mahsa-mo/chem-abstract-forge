import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function SeoKnowledgeSection() {
  const { l, dir } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: l(
        "آیا تصاویر وکتور ChemStudio با قوانین ژورنال‌های ACS و Elsevier مطابقت دارد؟",
        "Are ChemStudio vector graphics compliant with ACS & Elsevier policies?",
      ),
      a: l(
        "بله، ۱۰۰٪. کلیه طرح‌ها و واکنش‌ها در ChemStudio به صورت فایل وکتور برداری (SVG/EPS) و با رزولوشن ۳۰۰ DPI تولید می‌شوند که با تمام قوانین ناشران بین‌المللی از جمله ACS Publications, Elsevier, Cell Press, Nature Portfolio, Wiley و RSC انطباق کامل دارد.",
        "Yes, 100%. All graphics and reaction schemes in ChemStudio are generated as deterministic vector SVG/EPS files with 300 DPI resolution, fully compliant with ACS, Elsevier, Nature, Cell, and Wiley guidelines.",
      ),
    },
    {
      q: l(
        "چگونه فرمول‌های ۲D و کدهای SMILES را در ChemStudio رسم و ویرایش کنیم؟",
        "How do I convert SMILES and chemical formulas into 2D structures?",
      ),
      a: l(
        "در بخش 2D Structure Drawer، می‌توانید کد SMILES یا فرمول شیمیایی خود را وارد کنید تا ساختار دوبعدی با رنگ‌آمیزی استاندارد CPK به صورت لایه‌باز وکتور رسم شود و سپس آن را ویرایش یا دانلود نمایید.",
        "In the 2D Structure Drawer, simply paste your SMILES string or chemical formula to parse a clean 2D vector structure with CPK color schemes, fully editable and downloadable as SVG.",
      ),
    },
    {
      q: l(
        "آیا ChemStudio جایگزینی آنلاین برای نرم‌افزارهای ChemDraw و BioRender است؟",
        "Is ChemStudio a web-based alternative to ChemDraw and BioRender?",
      ),
      a: l(
        "بله. ChemStudio یک استودیوی یکپارچه است که قابلیت‌های رسم ساختار ChemDraw، طراحی وکتور مقاله BioRender، مشاهده‌گر سه‌بعدی PubChem و آزمایشگاه استوکیومتری را در یک محیط آنلاین بدون نیاز به نصب ارائه می‌دهد.",
        "Yes. ChemStudio unifies 2D ChemDraw-style drawing, BioRender-grade vector formatting, PubChem 3D molecular visualization, and stoichiometry reaction balancing into one web-based platform.",
      ),
    },
    {
      q: l(
        "نحوه موازنه واکنش و محاسبه بازده در بخش آزمایشگاه استوکیومتری چگونه است؟",
        "How does reaction balancing and atom economy work in the Stoichiometry Lab?",
      ),
      a: l(
        "کافیست فرمول واکنش شیمیایی را وارد کنید؛ سیستم به‌طور خودکار ضریب‌های موازنه، جرم مولی دقیق عناصر، درصد بازده، اقتصاد اتمی (Atom Economy) و فاکتور زیست‌محیطی (E-Factor) را محاسبه می‌کند.",
        "Enter your chemical reaction equation; the lab automatically calculates stoichiometric balancing coefficients, precise molar masses, reaction yield percentage, atom economy, and environmental E-factor.",
      ),
    },
  ];

  return (
    <section
      aria-label="راهنمای جامع سئو و سوالات متداول ChemStudio"
      className="mt-12 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md p-6 sm:p-10 shadow-card font-sans"
      dir={dir}
    >
      {/* Top Header Badge */}
      <div className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto">
        <Badge className="bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30 px-3.5 py-1 font-mono text-xs">
          <Sparkles className="size-3.5 me-1.5 text-[#06B6D4]" />
          {l(
            "راهنمای علمی و استانداردهای انتشار مقالات",
            "Scientific Publishing Standards & Knowledge Base",
          )}
        </Badge>

        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {l(
            "طراحی وکتور چکیده تصویری و رسم واکنش‌های شیمیایی (ACS & Elsevier Ready)",
            "Scientific Vector Graphics Workbench & Reaction Publication Guide",
          )}
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {l(
            "پلتفرم ChemStudio ابزاری تخصصی برای ساخت چارت‌های وکتور ۱۶:۹، رسم فرمول‌های دوبعدی، مشاهده‌گر سه‌بعدی مولکولی و موازنه واکنش‌های شیمیایی منطبق بر قوانین ژورنال‌های معتبر بین‌المللی است.",
            "ChemStudio is the premier scientific vector graphics workbench for 16:9 ToC graphics, 2D SMILES drawing, 3D molecular visualization, and stoichiometry reaction balancing.",
          )}
        </p>
      </div>

      {/* 3 Core Feature SEO Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {l("۱۰۰٪ منطبق بر قوانین ACS و Elsevier", "ACS & Elsevier Journal Compliant")}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            {l(
              "خروجی وکتور هندسی SVG و EPS با رزولوشن ۳۰۰ DPI بدون هیچ‌گونه خطا یا استامپ غیرمجاز برای سابمیت مستقیم مقاله.",
              "Export 300 DPI vector SVG and EPS files fully compliant with ACS, Elsevier, Cell Press, Nature, and Wiley publishing guidelines.",
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#6366F1]">
            <BookOpen className="size-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {l("جایگزین تحت‌وب ChemDraw و BioRender", "Web Alternative to ChemDraw & BioRender")}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            {l(
              "رسم سریع ساختارهای ۲D بر پایه SMILES، نمایش مدل‌های CPK و چیدمان مکانیسم‌های شیمیایی در یک بوم آنلاین.",
              "Draw 2D SMILES structures, inspect CPK molecular models, and lay out reaction mechanisms in a web-based canvas.",
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
            <FileText className="size-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {l("آزمایشگاه استوکیومتری و پرونده داوری", "Stoichiometry Lab & Journal Dossier")}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            {l(
              "محاسبه وزن مولی، موازنه معادلات شیمیایی، بازده واکنش و ایجاد خودکار پرونده کامل ارسال مقاله.",
              "Calculate molar masses, balance equations, evaluate atom economy, and build complete submission dossiers.",
            )}
          </p>
        </article>
      </div>

      {/* Accordion FAQ for Search Snippets */}
      <div className="mt-10 border-t border-border/60 pt-8 space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-foreground text-center mb-4 flex items-center justify-center gap-2">
          <Search className="size-4 text-[#06B6D4]" />
          <span>
            {l(
              "سوالات متداول پژوهشگران و نویسندگان مقالات (FAQ)",
              "Frequently Asked Questions (FAQ)",
            )}
          </span>
        </h3>

        <div className="space-y-2.5 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-secondary/20 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-start text-xs sm:text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#06B6D4] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#06B6D4]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-card/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
