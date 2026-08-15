import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

type Search = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode: search['mode'] === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — ChemAbstract" },
      {
        name: "description",
        content:
          "Create a free ChemAbstract account to save your graphical abstracts and get more free generations each day.",
      },
      { property: "og:title", content: "Log in or sign up — ChemAbstract" },
      {
        property: "og:description",
        content: "Save your graphical abstracts and unlock more free generations each day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const isSignUp = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) void navigate({ to: "/", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const res = isSignUp ? await signUp(email, password, name) : await signIn(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (isSignUp) setNotice(t("auth.checkEmail"));
  }

  return (
    <div className="min-h-screen bg-background font-sans molecular-bg" dir={dir}>
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isSignUp ? t("auth.title.signUp") : t("auth.title.signIn")}
        </h1>

        <form
          onSubmit={submit}
          className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          {isSignUp && (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-accent-strong">{notice}</p>}

          <Button type="submit" className="w-full" disabled={busy}>
            {isSignUp ? t("auth.signUp") : t("auth.signIn")}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={async () => {
              const res = await signInWithGoogle();
              if (res.error) setError(res.error);
            }}
          >
            {t("auth.google")}
          </Button>

          <Link
            to="/auth"
            search={{ mode: isSignUp ? "signin" : "signup" }}
            className="block text-center text-sm font-medium text-accent-strong hover:underline"
          >
            {isSignUp ? t("auth.toSignIn") : t("auth.toSignUp")}
          </Link>
        </form>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("auth.back")}
        </Link>
      </main>
    </div>
  );
}
