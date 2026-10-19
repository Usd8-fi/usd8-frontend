#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# The site is built and published from main: GitHub Pages serves main:/docs at
# https://usd8.fi/ (the old preview branch and its path are retired).
branch="$(git branch --show-current)"
if [[ "$branch" != "main" ]]; then
  echo "Refusing to deploy from '$branch': the site publishes from main." >&2
  exit 1
fi

# Sentry source maps: upload only when the auth token is in the macOS Keychain
# (security add-generic-password -a "$USER" -s usd8-sentry-auth-token -w).
# The maps are deleted after upload, so they never reach docs/ or GitHub.
if [ -z "${SENTRY_AUTH_TOKEN:-}" ] && command -v security >/dev/null 2>&1; then
  SENTRY_AUTH_TOKEN="$(security find-generic-password -s usd8-sentry-auth-token -w 2>/dev/null || true)"
  if [ -n "$SENTRY_AUTH_TOKEN" ]; then export SENTRY_AUTH_TOKEN; fi
fi
npm run build
if find docs -name '*.map' -print -quit | grep -q .; then
  echo "Refusing to publish: source maps found in docs/" >&2
  exit 1
fi

# Legacy page URLs (old usd8.fi root) keep redirecting into the docs.
node scripts/publish-redirects.mjs docs

# The custom domain must survive every build (public/CNAME is copied into docs/).
if [[ "$(cat docs/CNAME 2>/dev/null)" != "usd8.fi" ]]; then
  echo "Refusing to publish: docs/CNAME is not usd8.fi" >&2
  exit 1
fi

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "No changes — nothing to publish."
else
  git add -A
  git commit -m "${1:-deploy: $(date +%Y-%m-%d\ %H:%M:%S)}"
fi

git push origin main
echo "Published from main — https://usd8.fi/"
