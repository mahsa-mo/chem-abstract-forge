/**
 * Daily free usage limits. Guests are tracked per browser session/day;
 * signed-in users are tracked by their saved abstracts for the current day.
 * Isolated so the counter can be swapped for another backend later.
 */
export const GUEST_LIMIT = 2;
export const FREE_LIMIT = 3;

/** Legacy alias kept for compatibility. */
export const DAILY_LIMIT = FREE_LIMIT;

const KEY = "chemabstract.usage";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getGuestUsedToday(): number {
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

export function recordGuestUse(): number {
  const next = getGuestUsedToday() + 1;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ date: today(), count: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
