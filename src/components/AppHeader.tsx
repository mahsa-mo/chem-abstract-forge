import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Languages, LogIn, LogOut, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1"
      role="group"
      aria-label={t("lang.switch")}
    >
      <Languages className="mx-1 size-4 text-primary-foreground/70" aria-hidden />
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code as Locale)}
          aria-pressed={locale === l.code}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            locale === l.code
              ? "bg-primary-foreground text-primary"
              : "text-primary-foreground/75 hover:bg-white/10"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

type SavedAbstract = { id: string; title: string; created_at: string; url: string | null };

function AccountMenu() {
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
        <button className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pe-2 ps-1 text-primary-foreground transition-colors hover:bg-white/20">
          <Avatar className="size-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-primary-foreground text-xs text-primary">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[9rem] truncate text-sm font-medium">{name}</span>
          <ChevronDown className="size-4 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <section className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("menu.projects")}
          </p>
          <ul className="mt-2 space-y-2">
            {items.length === 0 && (
              <li className="text-sm text-muted-foreground">{t("menu.projects.empty")}</li>
            )}
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-2">
                <span className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {it.url && <img src={it.url} alt="" className="size-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{it.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {new Date(it.created_at).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
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
          <Link
            to="/pricing"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent-strong hover:underline"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {t("menu.plan.upgrade")}
          </Link>
        </section>

        <DropdownMenuSeparator />

        <section className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("menu.support")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("menu.support.body")}</p>
          <a
            href="mailto:support@chemabstract.app?subject=ChemAbstract%20support"
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

export function AppHeader() {
  const { t } = useI18n();
  const { user, loading, signInWithGoogle } = useAuth();

  return (
    <header className="bg-header text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <FlaskLogo />
          <span>
            <span className="block font-display text-base font-bold tracking-tight">
            {t("app.name")}
          </span>
            <span className="hidden text-xs text-primary-foreground/70 sm:block">
              {t("app.tagline")}
            </span>
          </span>
        </Link>

        <nav className="ms-auto flex items-center gap-2">
          <Link
            to="/pricing"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            {t("nav.pricing")}
          </Link>
          <LanguageSwitcher />
          {user && !loading ? (
            <AccountMenu />
          ) : (
            <span className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void signInWithGoogle()}
                className="gap-1.5"
              >
                <LogIn className="size-4" aria-hidden />
                {t("auth.signIn")}
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:inline-flex"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("auth.signUp")}
                </Link>
              </Button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
