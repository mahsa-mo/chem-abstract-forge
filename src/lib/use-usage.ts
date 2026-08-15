import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  FREE_LIMIT,
  GUEST_LIMIT,
  getGuestUsedToday,
  recordGuestUse,
  startOfTodayISO,
} from "@/lib/usage-quota";

export function useUsage() {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const isGuest = !user;
  const limit = isGuest ? GUEST_LIMIT : FREE_LIMIT;

  const refresh = useCallback(async () => {
    if (!user) {
      setUsed(getGuestUsedToday());
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
    if (!user) {
      setUsed(recordGuestUse());
      return;
    }
    await refresh();
  }, [user, refresh]);

  return {
    isGuest,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    refresh,
    record,
  };
}
