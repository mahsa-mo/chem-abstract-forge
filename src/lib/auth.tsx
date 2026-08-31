import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAnonymous: boolean;
  sessionError: string | null;
  retrySession: () => Promise<void>;
  /** Ensures a session exists right now; resolves true when one is available. */
  ensureSession: () => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  linkWithGoogle: () => Promise<{ error?: string }>;
  convertToPermanent: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

/** Startup validation of the browser-safe backend config, with clear diagnostics. */
function validateEnv(): string | null {
  const url =
    import.meta.env['VITE_SUPABASE_URL'] ||
    (import.meta.env['VITE_SUPABASE_PROJECT_ID']
      ? `https://${import.meta.env['VITE_SUPABASE_PROJECT_ID']}.supabase.co`
      : undefined);
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  const missing: string[] = [];
  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!key) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (missing.length) {
    console.error(
      `[auth] Backend configuration missing: ${missing.join(", ")}. ` +
        `The app cannot create a session until these are provided.`,
    );
    return `Configuration missing: ${missing.join(", ")}`;
  }
  if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(String(url))) {
    console.warn(`[auth] Unexpected backend URL shape: ${url}`);
  }
  return null;
}

const MAX_ATTEMPTS = 4;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Module-level guard: prevents duplicate anonymous sign-in calls across
// React StrictMode double-invokes and fast re-renders.
let anonSignInInFlight: Promise<boolean> | null = null;

/**
 * Creates an anonymous session with bounded exponential-backoff retries so a
 * transient network drop never leaves the app permanently stuck.
 */
async function ensureAnonymousSession(onError: (msg: string | null) => void): Promise<boolean> {
  if (anonSignInInFlight) return anonSignInInFlight;
  anonSignInInFlight = (async () => {
    try {
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        onError(null);
        return true;
      }

      let lastMessage = "Unable to start a session";
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (!error && data.session) {
            onError(null);
            return true;
          }
          lastMessage = error?.message ?? lastMessage;
        } catch (e) {
          lastMessage = e instanceof Error ? e.message : String(e);
        }
        console.warn(`[auth] anonymous sign-in attempt ${attempt} failed: ${lastMessage}`);
        if (attempt < MAX_ATTEMPTS) await sleep(400 * 2 ** (attempt - 1));
      }
      onError(lastMessage);
      return false;
    } finally {
      anonSignInInFlight = null;
    }
  })();
  return anonSignInInFlight;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        setSessionError(null);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        // After sign-out, bootstrap a fresh anonymous session.
        setSessionError(null);
        setLoading(true);
        void ensureAnonymousSession((msg) => {
          if (!mounted) return;
          setSessionError(msg);
          setLoading(false);
        });
      }
      // For INITIAL_SESSION with null, don't set loading=false —
      // the mount effect's getSession + anonymous bootstrap handles it.
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        setSession(data.session);
        setLoading(false);
        return;
      }

      // No existing session — bootstrap an anonymous one silently.
      void ensureAnonymousSession((msg) => {
        if (!mounted) return;
        setSessionError(msg);
        setLoading(false);
      });
      // On success, onAuthStateChange fires SIGNED_IN and sets loading=false.
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, plan")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile((data as Profile | null) ?? null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name },
      },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return { error: String(result.error.message ?? result.error) };
    return {};
  }, []);

  const linkWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const convertToPermanent = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.updateUser({
        email,
        password,
        data: { full_name: name },
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const retrySession = useCallback(async () => {
    setSessionError(null);
    setLoading(true);
    void ensureAnonymousSession((msg) => {
      setSessionError(msg);
      setLoading(false);
    });
  }, []);

  const isAnonymous = session?.user?.is_anonymous ?? false;

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAnonymous,
      sessionError,
      retrySession,
      signUp,
      signIn,
      signInWithGoogle,
      linkWithGoogle,
      convertToPermanent,
      signOut,
    }),
    [
      session,
      profile,
      loading,
      isAnonymous,
      sessionError,
      retrySession,
      signUp,
      signIn,
      signInWithGoogle,
      linkWithGoogle,
      convertToPermanent,
      signOut,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
