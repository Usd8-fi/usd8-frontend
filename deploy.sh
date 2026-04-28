#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

mdbook build

if git diff --quiet && git diff --cached --quiet; then
  echo "No file changes — skipping commit."
else
  git add -A
  msg="${1:-deploy: $(date +%Y-%m-%d\ %H:%M:%S)}"
  git commit -m "$msg"
fi

git push
