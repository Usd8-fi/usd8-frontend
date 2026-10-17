#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

branch="$(git branch --show-current)"
if [[ "$branch" == "main" ]]; then
  echo "Refusing to build on main: Pages serves main:/docs, which holds the published site." >&2
  exit 1
fi

npm run build

if git diff --quiet && git diff --cached --quiet; then
  echo "No source changes — skipping commit."
else
  git add -A
  git commit -m "${1:-deploy: $(date +%Y-%m-%d\ %H:%M:%S)}"
fi

git push

# Pages serves main:/docs, so the build is only live once it lands in
# main:docs/. The app replaces the whole site at the domain root; the custom
# domain (CNAME) is kept, and the old /beta/ and legacy page URLs redirect.
git fetch --quiet origin main
wt="$(mktemp -d)/publish"
trap 'git worktree remove --force "$wt" >/dev/null 2>&1 || true' EXIT
git worktree add --quiet --detach "$wt" origin/main

cname="$(mktemp)"
cp "$wt/docs/CNAME" "$cname"
rm -rf "$wt/docs"
mkdir -p "$wt/docs"
git archive HEAD docs | tar -x -C "$wt/docs" --strip-components=1
cp "$cname" "$wt/docs/CNAME"
node scripts/publish-redirects.mjs "$wt/docs"

git -C "$wt" add -A
if git -C "$wt" diff --cached --quiet; then
  echo "Site already matches main — nothing to publish."
  exit 0
fi

if ! git -C "$wt" diff --cached --name-only -z | node scripts/publish-scope.mjs --null; then
  echo "Refusing to publish: the release touched files outside docs/ or the CNAME" >&2
  exit 1
fi

git -C "$wt" commit -q -m "deploy: publish site from ${branch} $(git rev-parse --short HEAD)"
git -C "$wt" push --quiet origin HEAD:main
echo "Published to main:docs/ — https://usd8.fi/"
