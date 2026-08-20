#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

branch="$(git branch --show-current)"
if [[ "$branch" == "main" ]]; then
  echo "Refusing to build directly on main: GitHub Pages main:/docs contains the preserved legacy site plus the new app under /beta."
  echo "Build the new app on the that-website branch, then publish its generated docs/ tree into main:docs/beta/."
  exit 1
fi

npm run build

if git diff --quiet && git diff --cached --quiet; then
  echo "No file changes — skipping commit."
else
  git add -A
  msg="${1:-deploy: $(date +%Y-%m-%d\ %H:%M:%S)}"
  git commit -m "$msg"
fi

git push
