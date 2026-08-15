/**
 * Per-session daily free usage limit. Isolated so it can be swapped for a
 * server/database-backed counter later without touching the UI.
 */
export const DAILY_LIMIT = 5;

const KEY = "chemabstract.usage";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUsedToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date: string; count: number };
    return parsed.date === today() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

export function recordUse(): number {
  const next = getUsedToday() + 1;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ date: today(), count: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function remainingToday(): number {
  return Math.max(0, DAILY_LIMIT - getUsedToday());
}
