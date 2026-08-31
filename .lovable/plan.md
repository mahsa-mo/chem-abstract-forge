# Backend connection check + republish

## What I found

There is nothing to connect manually. This project already uses Lovable Cloud, so the backend URL and publishable key are injected automatically — I confirmed all five values are present in the environment right now (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the three `VITE_` equivalents), and the current build reports OK.

The "Missing Supabase environment variable(s)" blank screen you saw came from the **published** bundle, which was built while the app had a failing typecheck (the Regenerate work). That old bundle is still what the live URL serves. The preview build is healthy.

One real gap: `.env.production` only carries `VITE_SUPABASE_PROJECT_ID`, not the URL/key. The generated client falls back to deriving the URL from the project ID, but the publishable key has no fallback, so a production build that doesn't get the value injected will throw exactly that error.

## Plan

1. Verify in the live preview that the backend client initializes and that a signed-in session can read/write `generations` and `abstracts` — i.e. the quota and Regenerate rows do save and load.
2. Confirm the production environment injection supplies `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. If it does not, add them to `.env.production` alongside the existing project ID so published builds can never boot without them.
3. Republish so the live site serves the current, working bundle instead of the stale one.
4. Re-check the published URL for the runtime error and a non-blank first paint.

## Notes

- No schema, quota, or Regenerate logic changes — the database work from the previous change is already applied and correct.
- The publishable key is safe to ship in client code; the service-role key is not touched and stays server-only.
