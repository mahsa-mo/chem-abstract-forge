import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { FREE_LIMIT, startOfTodayISO } from "@/lib/usage-quota";

export function useUsage() {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const isGuest = !user || user.is_anonymous;

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
    used,
    limit: FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - used),
    refresh,
    record,
  };
}
