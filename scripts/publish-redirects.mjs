import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

/// Old URLs that must keep working after the app replaced the legacy site at
/// the domain root: the retired /beta/ app path and the legacy mdBook pages.
/// Each maps to its closest page on the new site (root-relative).
export const DOCS_PAGES = [
  'index.html', 'philosophy.html', 'defi-insurance.html', 'cover-pools.html', 'white-hat-economy.html',
  'faqs.html', 'transparency.html', 'addresses.html', 'legal.html', 'usd8.html', 'print.html', 'toc.html',
];

export const REDIRECTS = Object.freeze({
  // Retired app path: the app now lives at the root.
  'beta/index.html': '/',
  ...Object.fromEntries(DOCS_PAGES.map((page) => [`beta/docs/${page}`, page === 'index.html' ? '/docs/' : `/docs/${page}`])),
  // Legacy site pages (the previous usd8.fi root).
  'boosters.html': '/docs/defi-insurance.html#boosters',
  'contact.html': '/docs/usd8.html#contact',
  'cover-pool.html': '/docs/cover-pools.html',
  'faqs.html': '/docs/faqs.html',
  'help-needed.html': '/docs/',
  'philosophy.html': '/docs/philosophy.html',
  'protected-savings.html': '/docs/defi-insurance.html',
  'toc.html': '/docs/toc.html',
  'usd8.html': '/docs/',
  'white-hat-economy.html': '/docs/white-hat-economy.html',
  'print.html': '/docs/print.html',
});

const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/// A static redirect page: instant meta refresh plus a script that keeps any
/// #fragment of the old URL (e.g. /beta/#system-dashboard) unless the target has its own.
export function redirectPage(target) {
  const href = escapeHtml(target);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>USD8</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="https://usd8.fi${href}" />
    <meta http-equiv="refresh" content="0; url=${href}" />
    <script>
      (function () {
        var target = ${JSON.stringify(target)};
        if (target.indexOf('#') === -1 && location.hash) target += location.hash;
        location.replace(target);
      })();
    </script>
  </head>
  <body>
    <p>USD8 has moved. <a href="${href}">Continue to usd8.fi</a>.</p>
  </body>
</html>
`;
}

export function writeRedirects(siteRoot) {
  for (const [path, target] of Object.entries(REDIRECTS)) {
    const file = join(siteRoot, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, redirectPage(target));
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!process.argv[2]) {
    console.error('usage: node scripts/publish-redirects.mjs <site-root>');
    process.exit(2);
  }
  writeRedirects(process.argv[2]);
}
