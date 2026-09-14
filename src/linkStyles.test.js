import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
const docsStyles = readFileSync(resolve(process.cwd(), 'theme/css/usd8-docs.css'), 'utf8');
const sharedStyles = readFileSync(resolve(process.cwd(), 'theme/css/link-theme.css'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');
const appEntry = readFileSync(resolve(process.cwd(), 'src/main.jsx'), 'utf8');

describe('shared text-link styling', () => {
  it('uses a visible light rollover for popup close buttons', () => {
    expect(appStyles).toMatch(/\.app-dialog-close:hover,[\s\S]*?background: rgba\(255, 255, 255, 0\.16\);/);
  });

  it('defines the app and docs link system once in the shared stylesheet', () => {
    expect(appEntry).toContain("import '../theme/css/link-theme.css';");
    expect(bookConfig).toContain('additional-css = ["theme/css/link-theme.css", "theme/css/usd8-docs.css"]');
    expect(appStyles).not.toContain('#ffcc00');
    expect(docsStyles).not.toContain('#ffcc00');
    expect(appStyles).toContain('src: url("/assets/fonts/BlexMonoNerdFontMono-ExtraLight.woff2") format("woff2");');
    expect(appStyles).toMatch(/BlexMonoNerdFontMono-ExtraLight\.woff2[\s\S]*?font-weight: 200;/);
    expect(sharedStyles).toContain(`--accent: #ffcc00;`);
    expect(sharedStyles).toContain(`--accent-hover: color-mix(in srgb, var(--accent) 82%, black);`);
    expect(sharedStyles).toContain(`--link: var(--accent);`);
    expect(sharedStyles).toContain(`--navigation-inactive: #5f5f5f;`);
    expect(sharedStyles).toContain(`a {
  color: var(--link);
  text-decoration: underline;
  text-underline-offset: 3px;
}`);
    expect(sharedStyles).toMatch(/\.landing-footer-links \.site-nav-link[\s\S]*?\.content main a:link,[\s\S]*?\.sidebar \.chapter a\.active/);
    expect(sharedStyles).toContain(`.content main a:link,
.content main a:visited {
  color: var(--link);
  text-decoration: underline;
  text-underline-offset: 3px;
}`);
    expect(sharedStyles).toContain(`.content .faq-question::before {
  display: inline-block;
  color: var(--link);
  text-decoration: none;
}`);
    expect(sharedStyles).toContain(`.content .header.faq-question:hover::before,
.content .header.faq-question:focus-visible::before {
  color: var(--link-inverse);
}`);
    expect(`${appStyles}\n${sharedStyles}`).not.toContain('.usd8-dialog-tab');
    expect(appStyles).not.toMatch(/\.(?:sr-only|landing-data-error|usd8-transaction-banner|usd8-dialog-status--warning|cover-pools-page|white-hat-economy-page)\b/);
    expect(appStyles).not.toMatch(/--(?:font-navigation|pool-panel):/);
    expect(sharedStyles).not.toContain('border-bottom-color: var(--accent);');
    expect(appStyles).toMatch(/\.usd8-dialog \{[\s\S]*?min-height: 0;[\s\S]*?padding: 34px 42px 76px;/);

    expect(appStyles).toMatch(/\.usd8-dialog-form \{\s+margin-top: 72px;/);
    expect(appStyles).toMatch(/\.usd8-dialog-submit-row--withdraw \{[\s\S]*?margin-top: 72px;/);
    expect(sharedStyles).toContain(`.landing-footer-links .site-nav-link,
.sidebar .chapter a {
  color: var(--navigation-inactive);
  text-decoration: none;
}`);
    expect(sharedStyles).toContain(`.landing-footer-links .site-nav-link,
.sidebar .chapter a {
  background: transparent;
}`);
    expect(sharedStyles).toContain(`.landing-footer-links .site-nav-link:hover,
.landing-footer-links .site-nav-link:focus-visible,
.sidebar .chapter a:hover,
.sidebar .chapter a:focus-visible {
  color: var(--link);
  text-decoration: none;
}`);
    expect(sharedStyles).toContain(`.sidebar .chapter a.active,
.sidebar .chapter a.current-header {
  background: transparent;
  color: var(--link);
  text-decoration: none;
}`);
    expect(sharedStyles).toContain(`:not(.site-nav-link):not(.sidebar .chapter a):not(.sidebar-logo):not(.sidebar-beta-link):hover`);
    expect(sharedStyles).toContain(`:not(.site-nav-link):not(.sidebar .chapter a):not(.sidebar-logo):not(.sidebar-beta-link):focus-visible`);
    expect(sharedStyles).toMatch(/a:not\([\s\S]*?\.content main a:hover,[\s\S]*?\{\s+background: var\(--link\);\s+color: var\(--link-inverse\);\s+text-decoration: none;\s+\}/);
    expect(sharedStyles.match(/background: var\(--link\);/g)).toHaveLength(1);
    expect(`${appStyles}\n${sharedStyles}`).not.toContain('.landing-product-tab');
    expect(`${appStyles}\n${sharedStyles}`).not.toContain('.landing-product-tabs');
    expect(appStyles).toContain('--font-body: 14px;');
    expect(appStyles).toContain('--font-small: 12px;');
    expect(appStyles).toContain('--font-large: 32px;');
    expect(appStyles).not.toMatch(/font-size: (?:24|28)px;/);
    expect(appStyles).toMatch(/\.usd8-dialog-title \{[\s\S]*?margin: 0;[\s\S]*?font-size: var\(--font-large\);[\s\S]*?font-weight: 200;/);
    expect(appStyles).toMatch(/\.usd8-dialog-amount small,[\s\S]*?\.claim-status-step small \{[\s\S]*?font-size: var\(--font-small\);/);
    expect(appStyles).toMatch(/\.landing-section-title \{[\s\S]*?font-size: var\(--font-large\);\s+font-weight: 200;/);
    expect(appStyles).toMatch(/\.cover-pool-warning,\s+\.white-hat-economy-message \{\s+width: 100%;/);
    expect(appStyles).toMatch(/\.landing-header::before \{[\s\S]*?width: 100vw;[\s\S]*?height: 159px;[\s\S]*?background: #1d1d1d;/);
    expect(appStyles).toMatch(/\.insurance-assets \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
    expect(appStyles).toMatch(/\.cover-pool-card \{[\s\S]*?width: 100%;/);
    expect(appStyles).toMatch(/\.free-insurance-page > \.landing-section-title:first-child \{[\s\S]*?margin-top: 172px;/);
    expect(appStyles).toMatch(/\.cover-pool-actions > \.action-button-shell:nth-child\(3\) \{[\s\S]*?width: 220px;/);
    expect(`${appStyles}\n${docsStyles}`).not.toMatch(/#(?:dc9900|cd9d34|b8892c|f2c158|d2a137|eab308)/i);
    expect(appStyles).toMatch(/\.landing-wallet-button,[\s\S]*?background: var\(--button\);\s+color: var\(--link-inverse\);/);
    expect(appStyles).toMatch(/\.usd8-dialog-submit \{[\s\S]*?background: var\(--accent\);\s+color: var\(--link-inverse\);/);
    expect(appStyles).toContain(`--button-hover: var(--accent-hover);`);
    expect(appStyles).toMatch(/\.usd8-dialog-submit:hover,[\s\S]*?background: var\(--accent-hover\);/);
    expect(appStyles).toMatch(/\.cover-pool-card \{\s+--pool-background: #3674b0;\s+--pool-button-background: color-mix\(in srgb, var\(--pool-background\) 65%, black\);\s+--pool-button-hover: color-mix\(in srgb, var\(--pool-background\) 52%, black\);/);
    expect(appStyles).toMatch(/\.cover-pool-overview \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 220px;[\s\S]*?gap: 64px;/);
    expect(appStyles).toMatch(/\.cover-pool-capacity-metric \{[\s\S]*?width: 220px;/);
    expect(appStyles).toMatch(/\.cover-pool-metrics,[\s\S]*?\.cover-pool-account \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?gap: 56px;/);
    expect(appStyles).toMatch(/\.cover-pool-account \{[\s\S]*?width: calc\(100% - 284px\);/);
    expect(appStyles).toMatch(/\.insurance-summary strong,[\s\S]*?font-size: var\(--font-large\);\s+font-weight: 200;/);
    expect(appStyles).toMatch(/\.usd8-dialog-amount input \{[\s\S]*?font-size: var\(--font-large\);\s+font-weight: 200;/);
    expect(appStyles).toMatch(/\.cover-pool-actions button:nth-child\(n\) \{[\s\S]*?background: var\(--pool-button-background\);\s+color: var\(--text\);/);
    expect(appStyles).toMatch(/\.cover-pool-actions button:nth-child\(n\):not\(:disabled\):hover,[\s\S]*?background: var\(--pool-button-hover\);\s+color: var\(--text\);/);
    expect(appStyles).toMatch(/\.landing-brand:hover,[\s\S]*?filter: brightness\(0\.82\);/);
    expect(appStyles).toMatch(/\.landing-beta-link:hover,[\s\S]*?background: color-mix\(in srgb, rgb\(208, 153, 40\) 82%, black\);/);
    expect(docsStyles).toMatch(/\.sidebar-logo \{[\s\S]*?width: 64px;/);
    expect(docsStyles).toMatch(/\.sidebar-logo:hover,[\s\S]*?filter: brightness\(0\.82\);/);
    expect(docsStyles).toMatch(/\.sidebar-beta-link:hover,[\s\S]*?background: color-mix\(in srgb, rgb\(208, 153, 40\) 82%, black\);/);
    expect(sharedStyles).toContain(':not(.sidebar-logo):not(.sidebar-beta-link):hover');
  });
});
