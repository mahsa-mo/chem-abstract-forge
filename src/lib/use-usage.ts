import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { startOfTodayISO } from "@/lib/usage-quota";

export function useUsage() {
  const { user, profile } = useAuth();
  const [used, setUsed] = useState(0);
  const isGuest = !user || user.is_anonymous;

  const plan = profile?.plan || "free";
  const isOwner = user?.email?.toLowerCase() === "derakh77@gmail.com" || profile?.role === "admin";

  // Dynamic daily limit based on user plan
  const limit = isOwner ? 9999 : plan === "pro" ? 100 : plan === "team" ? 500 : 3; // Free Academic plan gets 3 daily generations

  const refresh = useCallback(async () => {
    if (!user) {
      setUsed(0);
      return;
    }
    const { count } = await supabase
      .from("abstracts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfTodayISO());
    setUsed(count ?? 0);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const record = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    isGuest,
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    refresh,
    record,
  };
}
