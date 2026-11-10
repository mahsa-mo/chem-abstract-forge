import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, ShieldCheck, Crown, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "تعرفه‌ها و اشتراک کاربران — ChemStudio" },
      {
        name: "description",
        content:
          "طرح‌های اشتراک ماهانه و سالانه ChemStudio برای ساخت چکیده تصویری مقالات شیمی و تولید نمودارهای علمی high-resolution.",
      },
      { property: "og:title", content: "طرح‌های اشتراک ChemStudio" },
      {
        property: "og:description",
        content: "پلن‌های اختصاصی پژوهشگران، دانشگاه‌ها و آزمایشگاه‌های تحقیقاتی شیمی.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
      <Check className="mt-0.5 size-4 shrink-0 text-[#06B6D4]" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function PricingPage() {
  const { t, dir, locale, l, isRtl } = useI18n();
  const { user, profile } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const currentPlan = profile?.plan || "free";

  async function handleActivatePlan(planId: string, planName: string) {
    if (!user) {
      toast.error(l("لطفاً ابتدا وارد حساب کاربری شوید", "Please sign in first to subscribe"));
      return;
    }
    setUpgrading(planId);
    try {
      if (user.id) {
        await supabase.from("profiles").update({ plan: planId }).eq("id", user.id);
      }
      toast.success(
        l(
          `طرح ${planName} با موفقیت برای حساب شما فعال شد!`,
          `${planName} Plan successfully activated for your account!`,
        ),
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(l("خطا در بروزرسانی طرح", "Failed to update plan"));
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div className="relative min-h-screen font-sans bg-background text-foreground" dir={dir}>
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Title Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30 px-3 py-1 font-mono text-xs">
            <ShieldCheck className="size-3.5 me-1 text-[#06B6D4]" />
            {l("تعرفه‌های ساخت چکیده تصویری مقالات", "Scientific Publishing & Lab Subscriptions")}
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {l("طرح‌های اشتراک و تعرفه کاربران", "Simple & Flexible Plans for Chemistry Labs")}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {l(
              "انتخاب مناسب‌ترین طرح برای پژوهشگران، دانشجویان و تیم‌های تحقیقاتی دانشگاهی جهت تولید بی‌محدودیت تصاویر کیفیت بالا (Nature / ACS Standard)",
              "Choose the ideal subscription tier for researchers, students, and academic chemical research teams.",
            )}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center rounded-xl border border-border/80 bg-secondary/60 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-card text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l("پرداخت ماهانه", "Monthly Billing")}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-[#06B6D4] text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{l("پرداخت سالانه (۲۰٪ تخفیف)", "Annual Billing (Save 20%)")}</span>
                <span className="rounded bg-white/20 px-1 py-0.2 text-[9px]">OFF</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tier Pricing Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* TIER 1: Free Academic Tier */}
          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:border-border">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">
                  {l("طرح رایگان (دانشجویی)", "Free Academic Tier")}
                </h2>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {l("رایگان", "Free")}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">
                  {isRtl ? "۰ تومان" : "$0"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {l("همیشگی", "forever")}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {l(
                  "مناسب برای تست اولیه، رسم فرمول‌های دوبعدی و ۳ درخواست روزانه",
                  "Ideal for initial tests, 2D drawing, and 3 daily abstract requests.",
                )}
              </p>

              <div className="my-6 h-px bg-border/60" />

              <ul className="space-y-3">
                <Feature>
                  {l("۳ درخواست تولید تصویر روزانه", "3 Daily abstract generations")}
                </Feature>
                <Feature>{l("رسم ساختار شیمیایی ۲D (SMILES)", "Full 2D ChemDraw editor")}</Feature>
                <Feature>{l("نمایش مولکولی ۳D عناصر CPK", "3D Molecule inspector")}</Feature>
                <Feature>{l("دانلود کیفیت استاندارد", "Standard resolution export")}</Feature>
              </ul>
            </div>

            <div className="mt-8">
              {currentPlan === "free" ? (
                <Button variant="outline" className="w-full text-xs" disabled>
                  <CheckCircle2 className="size-4 me-1.5 text-emerald-500" />
                  {l("طرح فعلی شما", "Current Active Plan")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleActivatePlan("free", l("رایگان", "Free"))}
                  className="w-full text-xs"
                >
                  {l("انتخاب طرح رایگان", "Switch to Free")}
                </Button>
              )}
            </div>
          </section>

          {/* TIER 2: Pro Researcher Tier (POPULAR) */}
          <section className="relative rounded-2xl border-2 border-[#06B6D4] bg-gradient-to-b from-card via-card to-[#06B6D4]/5 p-6 shadow-xl flex flex-col justify-between">
            <span className="absolute -top-3 inset-x-0 mx-auto w-max rounded-full bg-[#06B6D4] px-3 py-0.5 text-[10px] font-mono font-extrabold uppercase text-white shadow-sm flex items-center gap-1">
              <Sparkles className="size-3" />
              {l("پیشنهاد ویژه پژوهشگران", "Most Popular for Researchers")}
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">
                  {l("پژوهشگر حرفه‌ای (Pro Lab)", "Pro Researcher")}
                </h2>
                <Badge className="bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/40 text-[10px]">
                  PRO
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#06B6D4]">
                  {billingCycle === "monthly"
                    ? isRtl
                      ? "۹۹,۰۰۰ تومان"
                      : "$9"
                    : isRtl
                      ? "۷۹,۰۰۰ تومان"
                      : "$7"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {l("/ در ماه", "/ month")}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {l(
                  "تولید نامحدود چکیده تصویری با کیفیت ۳۰۰ DPI مناسب ژورنال‌های ACS و Nature",
                  "Unlimited high-resolution 300 DPI vector abstracts for ACS & Nature.",
                )}
              </p>

              <div className="my-6 h-px bg-[#06B6D4]/30" />

              <ul className="space-y-3">
                <Feature>
                  {l("تولید نامحدود تصویر و واکنش", "Unlimited visual generations")}
                </Feature>
                <Feature>
                  {l("کیفیت انتشارات علمی ۳۰۰ DPI Vector", "300 DPI publication quality")}
                </Feature>
                <Feature>
                  {l("دانلود فرمت SVG ،EPS و PNG", "SVG, EPS & PNG vector downloads")}
                </Feature>
                <Feature>
                  {l("اولویت بالا در پردازش هوش مصنوعی", "Priority AI generation queue")}
                </Feature>
                <Feature>
                  {l("ایجاد پرونده داوری ژورنال (Pre-Flight)", "Journal pre-flight dossier")}
                </Feature>
              </ul>
            </div>

            <div className="mt-8">
              {currentPlan === "pro" ? (
                <Button
                  className="w-full text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled
                >
                  <CheckCircle2 className="size-4 me-1.5" />
                  {l("طرح فعال شما (پرو)", "Active Pro Plan")}
                </Button>
              ) : (
                <Button
                  onClick={() => handleActivatePlan("pro", l("پژوهشگر حرفه‌ای", "Pro Researcher"))}
                  disabled={upgrading === "pro"}
                  className="w-full text-xs bg-[#06B6D4] text-white hover:bg-[#06B6D4]/90 font-bold shadow-md"
                >
                  <Crown className="size-4 me-1.5" />
                  {upgrading === "pro"
                    ? l("در حال فعال‌سازی…", "Activating…")
                    : l("ارتقا به طرح پرو", "Upgrade to Pro")}
                </Button>
              )}
            </div>
          </section>

          {/* TIER 3: Enterprise / Academic Institution Tier */}
          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:border-border">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">
                  {l("دانشگاه و آزمایشگاه (Team)", "University & Team Lab")}
                </h2>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {l("تیمی", "Team")}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">
                  {billingCycle === "monthly"
                    ? isRtl
                      ? "۴۹۰,۰۰۰ تومان"
                      : "$49"
                    : isRtl
                      ? "۳۹۰,۰۰۰ تومان"
                      : "$39"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {l("/ در ماه", "/ month")}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {l(
                  "دسترسی تیمی کامل برای گروه شیمی، آزمایشگاه‌ها و اعضای هیئت علمی",
                  "Full team license for academic chemistry departments and research groups.",
                )}
              </p>

              <div className="my-6 h-px bg-border/60" />

              <ul className="space-y-3">
                <Feature>{l("شامل کلیه امکانات طرح پرو", "Includes all Pro features")}</Feature>
                <Feature>{l("حساب‌های کاربری تیمی (تا ۱۰ کاربر)", "Up to 10 team seats")}</Feature>
                <Feature>
                  {l("آرشیو مشترک واکنش‌های آزمایشگاه", "Shared lab reaction library")}
                </Feature>
                <Feature>
                  {l("پشتیبانی ۲۴ ساعته مستقیم مالک", "Direct priority owner support")}
                </Feature>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => handleActivatePlan("pro", l("تیمی و آزمایشگاهی", "Team Lab"))}
                className="w-full text-xs border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/10 font-bold"
              >
                {l("فعال‌سازی طرح تیمی", "Activate Team Plan")}
              </Button>
            </div>
          </section>
        </div>

        {/* Bottom Direct Owner Portal Button for Admin Access */}
        <div className="mt-12 rounded-2xl border border-border/80 bg-card p-6 text-center space-y-3 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <Crown className="size-5 text-[#06B6D4]" />
            <h3 className="text-sm font-bold text-foreground">
              {l("ورود و مدیریت مالکین سایت (Owner Admin Access)", "Owner & Admin Portal")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            {l(
              "اگر مالک اصلی سایت هستید، می‌توانید مستقیماً وارد پنل مدیریت کاربران، سهمیه‌ها و تنظیمات هوش مصنوعی شوید.",
              "Access user quota management, abstract generation logs, and AI engine settings.",
            )}
          </p>
          <div className="pt-1 flex justify-center gap-3">
            <Link to="/admin">
              <Button className="gap-2 text-xs bg-[#06B6D4] text-white hover:bg-[#06B6D4]/90">
                <Crown className="size-4" />
                {l("ورود به پنل ادمین مالکین (/admin)", "Go to Owner Admin Panel (/admin)")}
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
