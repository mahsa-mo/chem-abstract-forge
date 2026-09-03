/**
 * Daily free usage limits. With Anonymous Auth, every visitor (guest or
 * permanent) has a real auth.uid() and is tracked server-side via the
 * `abstracts` table. No localStorage fallback remains.
 */
export const FREE_LIMIT = 50;

/** Legacy alias kept for compatibility. */
export const DAILY_LIMIT = FREE_LIMIT;

export function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
