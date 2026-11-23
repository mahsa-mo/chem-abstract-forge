#!/usr/bin/env bash
# Verifies the chemistry engine against objective checks. Run from the repo root:
#   npm install --legacy-peer-deps   (or bun install)
#   bash scripts/verify-engine.sh
# Exit code is 0 only if every FAIL-level check passes.
set -u
fail=0
ok()   { echo "PASS  $1"; }
bad()  { echo "FAIL  $1"; fail=1; }
warn() { echo "WARN  $1"; }

TSC_LIMIT=225   # type-error count at the time the engine fixes were made (was 236 before)

[ -d node_modules ] || { echo "node_modules missing — install dependencies first"; exit 2; }

# 1. Automated tests
if npx vitest run >/tmp/verify-vitest.out 2>&1; then
  ok "tests: $(grep -E '^\s+Tests ' /tmp/verify-vitest.out | sed 's/^ *//')"
else
  bad "tests failed"; tail -40 /tmp/verify-vitest.out
fi

# 2. Type errors must not grow
n=$(npx tsc --noEmit -p . 2>&1 | grep -c "error TS")
if [ "$n" -le "$TSC_LIMIT" ]; then ok "type errors: $n (limit $TSC_LIMIT)"; else bad "type errors rose to $n (limit $TSC_LIMIT)"; fi

# 3. No logging of user text or API key material
if grep -rEn 'user-inputs\.log|/tmp/[A-Za-z-]*\.log|apiKey\.(slice|substring)' src --include=*.ts --include=*.tsx >/dev/null 2>&1; then
  bad "user input / API key is being logged"; grep -rEn 'user-inputs\.log|/tmp/[A-Za-z-]*\.log|apiKey\.(slice|substring)' src --include=*.ts --include=*.tsx | head
else ok "no logging of user input or API key"; fi

# 4. Known bug patterns must stay fixed
if grep -rn 'pubchem\.smiles' src --include=*.ts --include=*.tsx | grep -vE ':[0-9]+:\s*//' | grep -q .; then bad "pubchem.smiles (non-existent field) is back"; else ok "PubChem SMILES field correct"; fi
if grep -n 'includes("S(N)(=O)=O")' src/lib/chemdraw-engine.ts >/dev/null 2>&1; then bad "celecoxib preset matches every sulfonamide again"; else ok "celecoxib preset is exact-match only"; fi
if grep -n 'Math.random' src/lib/chem-core/*.ts | grep -v test >/dev/null 2>&1; then bad "Math.random in chem-core (output must be deterministic)"; else ok "chem-core is deterministic"; fi
if grep -n '|| 12.0\|?? 12.0' src/lib/reaction-parser.ts >/dev/null 2>&1; then bad "fake default atomic weight 12.0 is back"; else ok "no fake default atomic weight"; fi

# 5. Did anyone change the core files? (informational: a change is allowed but must be explained)
if [ -f scripts/chem-core.sha256 ]; then
  if sha256sum -c scripts/chem-core.sha256 --quiet >/dev/null 2>&1; then ok "chem-core files identical to the reviewed version"
  else warn "chem-core files differ from the reviewed version:"; sha256sum -c scripts/chem-core.sha256 2>/dev/null | grep -v ': OK$'; fi
fi

# 6. Secrets exposed to the browser bundle
if grep -rn 'VITE_GEMINI' src --include=*.ts --include=*.tsx >/dev/null 2>&1; then warn "VITE_GEMINI* name is read in code: Vite puts VITE_* values into the public browser bundle"; fi

echo
[ "$fail" -eq 0 ] && echo "RESULT: all checks passed" || echo "RESULT: some checks FAILED"
exit $fail
