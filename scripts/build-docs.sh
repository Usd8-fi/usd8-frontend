#!/usr/bin/env bash
# Builds the English docs into docs/docs, then each translated book from
# book-i18n/<lang> into docs/docs/<lang>. English first: mdbook empties its
# output directory, which would otherwise wipe the translations.
# Translated sources keep the English "../assets/" paths; they are rewritten
# here because the translated pages sit one directory deeper.
# Legal stays English (binding text): it is copied in when not translated.
set -euo pipefail
cd "$(dirname "$0")/.."
mdbook build
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
for pair in zh:zh-CN zh-TW:zh-TW ko:ko ja:ja de:de es:es it:it ru:ru pt:pt-BR fr:fr tr:tr vi:vi id:id uk:uk th:th ar:ar fa:fa; do
  lang="${pair%%:*}"; html="${pair#*:}"
  [ -f "book-i18n/$lang/SUMMARY.md" ] || continue
  src="$work/$lang"
  mkdir -p "$src"
  cp book-i18n/"$lang"/*.md "$src"/
  [ -f "$src/legal.md" ] || cp book-src/legal.md "$src/legal.md"
  for file in "$src"/*.md; do
    perl -pi -e 's#\.\./assets/#../../assets/#g' "$file"
  done
  direction=ltr; case "$lang" in ar|fa) direction=rtl ;; esac
  MDBOOK_BOOK__SRC="$src" MDBOOK_BOOK__LANGUAGE="$html" MDBOOK_BOOK__TEXT_DIRECTION="$direction" \
  MDBOOK_BUILD__BUILD_DIR="docs/docs/$lang" MDBOOK_OUTPUT__HTML__SITE_URL="/docs/$lang/" \
    mdbook build >/dev/null
  # The shared theme CSS loads fonts (BlexMono, FontAwesome social icons) via
  # ../../../assets/, written for docs/docs/theme/css/. Translated books sit
  # one directory deeper, so point those URLs one level further up.
  for css in "docs/docs/$lang"/theme/css/*.css; do
    perl -pi -e 's#url\("\.\./\.\./\.\./assets/#url("../../../../assets/#g' "$css"
  done
done
