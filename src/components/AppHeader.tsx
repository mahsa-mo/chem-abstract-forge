import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Languages, LogOut, Mail, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, locales, type Locale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useUsage } from "@/lib/use-usage";
import { supabase } from "@/integrations/supabase/client";
import { FlaskLogo } from "@/components/FlaskLogo";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import {
  IconAbstractStudio,
  IconStructureDrawer,
  IconChemicalDatabase,
  IconStoichiometryLab,
  IconReactionArchive,
  IconLabSignIn,
  IconLabSignUp,
  IconLabLanguage,
  IconLabQuota,
} from "@/components/ChemIcons";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-secondary/60 p-1 shadow-2xs"
      role="group"
      aria-label={t("lang.switch")}
    >
      <Languages className="mx-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code as Locale)}
          aria-pressed={locale === l.code}
          title={l.name}
          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
            locale === l.code
              ? "bg-card text-foreground shadow-2xs border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

type SavedAbstract = { id: string; title: string; created_at: string; url: string | null };

export function AccountMenu({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const { t, locale } = useI18n();
  const { user, profile, signOut } = useAuth();
  const { used, limit } = useUsage();
  const [items, setItems] = useState<SavedAbstract[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("abstracts")
        .select("id, title, created_at, image_path")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!data) return;
      const withUrls = await Promise.all(
        data.map(async (row) => {
          let url: string | null = null;
          if (row.image_path) {
            const signed = await supabase.storage
              .from("abstracts")
              .createSignedUrl(row.image_path, 3600);
            url = signed.data?.signedUrl ?? null;
          }
          return { id: row.id, title: row.title, created_at: row.created_at, url };
        }),
      );
      if (active) setItems(withUrls);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const name = profile?.display_name || user?.email || "";
  const isPro = profile?.plan === "pro";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-border bg-card py-1 pe-2.5 ps-1.5 text-foreground transition-colors hover:bg-secondary/80 shadow-2xs"
        >
          <Avatar className="size-7">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[9rem] truncate text-xs font-semibold">{name}</span>
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <section className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("menu.projects")}
            </p>
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-[11px] font-medium text-accent-strong hover:underline"
              >
                {t("history.title")}
              </button>
            )}
          </div>
          <ul className="mt-2 space-y-2">
            {items.length === 0 && (
              <li className="text-sm text-muted-foreground">{t("menu.projects.empty")}</li>
            )}
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
                onClick={onOpenHistory}
              >
                <span className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {it.url && <img src={it.url} alt="" className="size-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">{it.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {new Date(it.created_at).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <DropdownMenuSeparator />

        <section className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("menu.plan")}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {isPro ? t("menu.plan.pro") : t("menu.plan.free")}
          </p>
          {!isPro && (
            <p className="text-xs text-muted-foreground">
              {t("menu.plan.usage", { used, max: limit })}
            </p>
          )}
          <div className="mt-2 flex flex-col gap-1.5">
            {user?.email?.toLowerCase() === "derakh77@gmail.com" && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:underline"
              >
                <Sparkles className="size-3.5 text-[#06B6D4]" aria-hidden />
                {locale === "fa" ? "پنل مدیریت مالکین (/admin)" : "Owner Admin Panel (/admin)"}
              </Link>
            )}
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-strong hover:underline"
            >
              <Sparkles className="size-3.5" aria-hidden />
              {t("menu.plan.upgrade")}
            </Link>
          </div>
        </section>

        <DropdownMenuSeparator />

        <section className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("menu.support")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("menu.support.body")}</p>
          <a
            href="mailto:support@chemstudio.app?subject=ChemStudio%20support"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent-strong hover:underline"
          >
            <Mail className="size-3.5" aria-hidden />
            {t("menu.support.cta")}
          </a>
        </section>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => void signOut()} className="m-1 gap-2">
          <LogOut className="size-4" aria-hidden />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Dedicated Vertical Studio Icon Station positioned alongside the outer edge of the workspace.
 * Keeps Account, Sign In, Sign Up, Language, and Quota/Pricing completely out of the main top navbar,
 * out of the middle between horizontal bars, and out of the page bottom — using custom scientific
 * SVG icons with compact labels underneath.
 */
export function AccountAndLanguageBar({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const isRtl = locale === "fa";
  const { user, profile, loading, signOut } = useAuth();
  const { remaining, limit } = useUsage();

  const cycleLocale = () => {
    const currentIndex = locales.findIndex((l) => l.code === locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]!.code);
  };

  const currentLocaleObj = locales.find((l) => l.code === locale) || locales[0]!;
  const nextLocaleObj =
    locales[(locales.findIndex((l) => l.code === locale) + 1) % locales.length] || locales[1]!;

  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || (isRtl ? "پژوهشگر" : "Profile");

  return (
    <aside
      aria-label={isRtl ? "ستون ابزار کاربری و زبان" : "User & Language Icon Station"}
      className="w-full md:w-[86px] lg:w-[92px] shrink-0 flex flex-col"
    >
      <div className="h-full flex flex-row md:flex-col items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-2 sm:p-2.5 shadow-card">
        {/* Top Section: Micro Header Badge + Auth Icons (Sign In & Sign Up or Active Account) */}
        <div className="flex flex-row md:flex-col items-center gap-2 w-auto md:w-full">
          {/* Top Station Label (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-1 w-full pb-1 border-b border-border/60">
            <span className="size-1.5 rounded-full bg-[#06B6D4]" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {isRtl ? "پنل کاربری" : "ACCOUNT"}
            </span>
          </div>

          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group relative w-full flex flex-col items-center justify-center rounded-xl p-2 bg-secondary/40 hover:bg-secondary/80 border border-[#06B6D4]/40 transition-all cursor-pointer"
                  >
                    <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4]/20 via-[#6366F1]/15 to-[#10B981]/20 border border-[#06B6D4]/40 group-hover:scale-105 transition-transform">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="rounded-lg bg-primary/20 text-[11px] font-bold text-foreground">
                          {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -top-1 -end-1 size-2.5 rounded-full bg-[#10B981] ring-2 ring-card" />
                    </div>
                    <span className="mt-1.5 text-[10px] font-bold text-foreground truncate max-w-full leading-tight">
                      {isRtl ? "حساب من" : "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={12}
                  className="w-64 p-2"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {onOpenHistory && (
                    <DropdownMenuItem
                      onClick={onOpenHistory}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <IconReactionArchive className="size-4" />
                      <span>{t("history.title")}</span>
                    </DropdownMenuItem>
                  )}
                  {user?.email?.toLowerCase() === "derakh77@gmail.com" && (
                    <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                      <Link to="/admin">
                        <Sparkles className="size-3.5 text-[#06B6D4]" />
                        <span className="font-bold text-[#06B6D4]">
                          {isRtl ? "پنل مدیریت و مالک (/admin)" : "Owner Admin Panel (/admin)"}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link to="/pricing">
                      <Sparkles className="size-3.5 text-muted-foreground" />
                      <span>{t("menu.plan.upgrade")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="gap-2 text-xs text-destructive cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>{t("auth.signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Sign In Icon Button */}
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="group relative flex-1 md:w-full flex flex-col items-center justify-center rounded-xl px-2.5 py-2 bg-secondary/30 hover:bg-secondary/80 border border-border/60 hover:border-[#06B6D4]/50 transition-all"
                  title={t("auth.signIn")}
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#6366F1]/15 border border-border/60 group-hover:border-[#06B6D4]/50 group-hover:-translate-y-0.5 group-hover:scale-105 transition-all">
                    <IconLabSignIn className="size-7 drop-shadow-2xs" />
                  </div>
                  <span className="mt-1.5 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground leading-tight text-center whitespace-nowrap">
                    {t("auth.signIn")}
                  </span>
                </Link>

                {/* Sign Up Icon Button */}
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="group relative flex-1 md:w-full flex flex-col items-center justify-center rounded-xl px-2.5 py-2 bg-secondary/30 hover:bg-secondary/80 border border-border/60 hover:border-[#10B981]/50 transition-all"
                  title={t("auth.signUp")}
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1]/20 via-[#06B6D4]/15 to-[#10B981]/20 border border-border/60 group-hover:border-[#10B981]/50 group-hover:-translate-y-0.5 group-hover:scale-105 transition-all">
                    <IconLabSignUp className="size-7 drop-shadow-2xs" />
                  </div>
                  <span className="mt-1.5 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground leading-tight text-center whitespace-nowrap">
                    {t("auth.signUp")}
                  </span>
                </Link>
              </>
            ))}
        </div>

        {/* Center Structural Spine (Connects Top & Bottom inside the full-height column so it never looks floating) */}
        <div
          className="hidden md:flex flex-1 flex-col items-center justify-center py-2 w-full"
          aria-hidden="true"
        >
          <div className="w-px flex-1 bg-gradient-to-b from-[#06B6D4]/35 via-border to-border/40" />
          <div className="my-1.5 flex size-5 items-center justify-center rounded-full border border-border/80 bg-secondary/60">
            <span className="size-1.5 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#10B981]" />
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-border/40 via-border to-[#F59E0B]/35" />
        </div>

        {/* Bottom Section: Language Switcher & Quota/Pricing */}
        <div className="flex flex-row md:flex-col items-center gap-2 w-auto md:w-full">
          {/* Station 3: Language Switcher Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group relative flex-1 md:w-full flex flex-col items-center justify-center rounded-xl px-2.5 py-2 bg-secondary/30 hover:bg-secondary/80 border border-border/60 hover:border-[#8B5CF6]/50 transition-all cursor-pointer"
                title={t("lang.switch")}
              >
                <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#8B5CF6]/20 border border-border/60 group-hover:border-[#8B5CF6]/50 group-hover:-translate-y-0.5 group-hover:scale-105 transition-all">
                  <IconLabLanguage className="size-7 drop-shadow-2xs" />
                  <span className="absolute -top-1 -end-1 rounded-full bg-card border border-[#06B6D4]/50 px-1 py-0.2 text-[8px] font-mono font-extrabold text-[#06B6D4] shadow-2xs">
                    {currentLocaleObj.flag}
                  </span>
                </div>
                <span className="mt-1.5 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground leading-tight text-center whitespace-nowrap">
                  {currentLocaleObj.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side={isRtl ? "left" : "right"}
              sideOffset={12}
              className="w-48 p-1.5 rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl z-50"
            >
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                {t("lang.switch")}
              </div>
              {locales.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    locale === l.code
                      ? "bg-primary/15 text-primary font-bold"
                      : "hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{l.flag}</span>
                    <span>{l.name}</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold opacity-60">{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Station 4: Quota & Pricing Icon Button */}
          <Link
            to="/pricing"
            className="group relative flex-1 md:w-full flex flex-col items-center justify-center rounded-xl px-2.5 py-2 bg-secondary/30 hover:bg-secondary/80 border border-border/60 hover:border-[#F59E0B]/50 transition-all"
            title={t("quota.remaining", { n: remaining, max: limit })}
          >
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B]/20 via-[#EC4899]/15 to-[#06B6D4]/20 border border-border/60 group-hover:border-[#F59E0B]/50 group-hover:-translate-y-0.5 group-hover:scale-105 transition-all">
              <IconLabQuota className="size-7 drop-shadow-2xs" />
              <span className="absolute -top-1 -end-1.5 rounded-full bg-card border border-[#10B981]/50 px-1 text-[8px] font-mono font-bold text-[#10B981] shadow-2xs">
                {remaining}/{limit}
              </span>
            </div>
            <span className="mt-1.5 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground leading-tight text-center whitespace-nowrap">
              {t("nav.pricing")}
            </span>
          </Link>

          {/* Bottom Station Label (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-1 w-full pt-1 border-t border-border/60">
            <span className="text-[8px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">
              {locale === "fa" ? "FA • 300 DPI" : "EN • 300 DPI"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppHeader({
  onOpenHistory,
  historyCount = 0,
  activeView = "studio",
  onSelectView,
}: {
  onOpenHistory?: () => void;
  historyCount?: number;
  activeView?: "studio" | "explorer" | "drawer" | "stoich";
  onSelectView?: (view: "studio" | "explorer" | "drawer" | "stoich") => void;
}) {
  const { t, locale } = useI18n();
  const isRtl = locale === "fa";

  const navModules = [
    {
      id: "studio" as const,
      label: t("nav.studio"),
      code: "TOC • 16:9",
      Icon: IconAbstractStudio,
      accent: "#06B6D4",
      medallionBg: "from-[#06B6D4]/20 via-[#6366F1]/10 to-[#EC4899]/15",
      activeBorder: "border-[#06B6D4]/50",
    },
    {
      id: "drawer" as const,
      label: t("nav.drawer"),
      code: "IUPAC • SMILES",
      Icon: IconStructureDrawer,
      accent: "#F43F5E",
      medallionBg: "from-[#F43F5E]/20 via-[#6366F1]/10 to-[#06B6D4]/15",
      activeBorder: "border-[#F43F5E]/50",
    },
    {
      id: "explorer" as const,
      label: t("nav.explorer"),
      code: "3D • PUBCHEM",
      Icon: IconChemicalDatabase,
      accent: "#6366F1",
      medallionBg: "from-[#6366F1]/20 via-[#06B6D4]/15 to-[#10B981]/10",
      activeBorder: "border-[#6366F1]/50",
    },
    {
      id: "stoich" as const,
      label: t("nav.stoich"),
      code: "118 • MOLAR",
      Icon: IconStoichiometryLab,
      accent: "#10B981",
      medallionBg: "from-[#10B981]/20 via-[#06B6D4]/15 to-[#3B82F6]/10",
      activeBorder: "border-[#10B981]/50",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/80 text-foreground shadow-xs">
      <div className="mx-auto max-w-[1320px] px-3 py-2.5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-5">
          {/* Brand Identity Station */}
          <div className="flex items-center justify-between md:justify-start gap-3.5 shrink-0">
            <Link
              to="/"
              onClick={() => onSelectView?.("studio")}
              className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/40 hover:bg-secondary/70 px-3.5 py-2 transition-all shadow-2xs"
            >
              <FlaskLogo className="size-10 sm:size-11" />
              <div className="flex flex-col">
                <span className="font-display text-sm sm:text-base font-extrabold tracking-tight text-foreground group-hover:text-[#06B6D4] transition-colors leading-none">
                  {t("app.name")}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-[#06B6D4]" />
                  {t("nav.workbench")}
                </span>
              </div>
            </Link>

            {/* In-App PWA Installation Prompt Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Mobile History Quick Button when on small screens */}
            {onSelectView && onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="md:hidden relative flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/50 px-3 py-2 text-xs font-semibold text-foreground"
              >
                <IconReactionArchive className="size-6" />
                <span>{t("history.title")}</span>
                {historyCount > 0 && (
                  <span className="min-w-[18px] h-4 rounded-full bg-[#06B6D4] px-1 text-[10px] font-mono font-bold text-white flex items-center justify-center">
                    {historyCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Vertical Structural Divider on Desktop */}
          {onSelectView && (
            <div
              className="hidden md:block h-11 w-px bg-gradient-to-b from-transparent via-border to-transparent shrink-0"
              aria-hidden="true"
            />
          )}

          {/* Balanced Full-Span Scientific Navigation Dock */}
          {onSelectView ? (
            <nav
              aria-label={isRtl ? "بخش‌های اصلی آزمایشگاه" : "Main Chemistry Workspaces"}
              className={`flex-1 grid ${
                onOpenHistory ? "grid-cols-4 md:grid-cols-5" : "grid-cols-4"
              } gap-1.5 sm:gap-2.5`}
            >
              {navModules.map((item) => {
                const isActive = activeView === item.id;
                const IconComponent = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 sm:px-3 sm:py-2 transition-all duration-200 cursor-pointer border ${
                      isActive
                        ? `bg-secondary/95 text-foreground shadow-xs ${item.activeBorder}`
                        : "bg-secondary/25 hover:bg-secondary/65 text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                    }`}
                  >
                    {/* Framed Scientific Icon Medallion (Larger Icon on Top) */}
                    <div
                      className={`relative flex size-10 sm:size-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.medallionBg} border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 ${
                        isActive
                          ? "border-white/25 shadow-xs scale-105"
                          : "border-border/60 opacity-90 group-hover:opacity-100"
                      }`}
                    >
                      <IconComponent className="size-7 sm:size-8 drop-shadow-2xs" />
                    </div>

                    {/* Smaller Crisp Label Underneath */}
                    <span
                      className={`mt-1.5 text-[10px] sm:text-xs leading-tight tracking-tight text-center line-clamp-1 ${
                        isActive
                          ? "font-bold text-foreground"
                          : "font-semibold text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active Indicator Line */}
                    {isActive && (
                      <span
                        className="absolute bottom-0 inset-x-5 h-[2.5px] rounded-full"
                        style={{ backgroundColor: item.accent }}
                      />
                    )}
                  </button>
                );
              })}

              {/* 5th Station: Saved Abstracts Archive (Desktop Grid Item) */}
              {onOpenHistory && (
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="hidden md:flex group relative flex-col items-center justify-center rounded-2xl px-2 py-2 sm:px-3 sm:py-2 bg-secondary/25 hover:bg-secondary/65 text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all duration-200 cursor-pointer"
                >
                  <div className="relative flex size-10 sm:size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B]/20 via-[#06B6D4]/10 to-[#EA580C]/15 border border-border/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <IconReactionArchive className="size-7 sm:size-8 drop-shadow-2xs" />
                    {historyCount > 0 && (
                      <span className="absolute -top-1 -end-1.5 min-w-[18px] h-4 rounded-full bg-[#06B6D4] px-1 text-[9px] font-mono font-bold text-white flex items-center justify-center shadow-xs ring-2 ring-card">
                        {historyCount}
                      </span>
                    )}
                  </div>
                  <span className="mt-1.5 text-[10px] sm:text-xs leading-tight font-semibold text-muted-foreground group-hover:text-foreground text-center line-clamp-1">
                    {t("history.title")}
                  </span>
                </button>
              )}
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border text-foreground transition-all"
              >
                <IconAbstractStudio className="size-7" />
                <span className="mt-1 text-[11px] font-semibold">
                  {isRtl ? "بازگشت به استودیو" : "Back to Studio"}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
