#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

branch="$(git branch --show-current)"
if [[ "$branch" == "main" ]]; then
  echo "Refusing to build on main: Pages serves main:/docs, which holds the legacy site plus the app under /beta." >&2
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
# main:docs/beta/. The legacy site at the root must survive untouched.
git fetch --quiet origin main
wt="$(mktemp -d)/publish"
trap 'git worktree remove --force "$wt" >/dev/null 2>&1 || true' EXIT
git worktree add --quiet --detach "$wt" origin/main

rm -rf "$wt/docs/beta"
mkdir -p "$wt/docs/beta"
git archive HEAD docs | tar -x -C "$wt/docs/beta" --strip-components=1

git -C "$wt" add -A
if git -C "$wt" diff --cached --quiet; then
  echo "Beta already matches main — nothing to publish."
  exit 0
fi

if git -C "$wt" diff --cached --name-only | grep -qv '^docs/beta/'; then
  echo "Refusing to publish: the swap touched files outside docs/beta/" >&2
  git -C "$wt" diff --cached --name-only | grep -v '^docs/beta/' >&2
  exit 1
fi

git -C "$wt" commit -q -m "deploy: publish beta from ${branch} $(git rev-parse --short HEAD)"
git -C "$wt" push --quiet origin HEAD:main
echo "Published to main:docs/beta/ — https://usd8.fi/beta/"
