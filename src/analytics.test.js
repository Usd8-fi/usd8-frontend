import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const appHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');
const analytics = readFileSync(resolve(process.cwd(), 'analytics.js'), 'utf8');

function runAnalytics(consent) {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  localStorage.clear();
  delete window.gtag;
  delete window.dataLayer;
  delete window.USD8AnalyticsConsent;
  if (consent) localStorage.setItem('usd8.analyticsConsent', consent);
  window.eval(analytics);
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

afterEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  localStorage.clear();
  clearCookies();
  delete window.gtag;
  delete window.dataLayer;
  delete window.USD8AnalyticsConsent;
  delete window['ga-disable-G-XZ3M0DQJ6M'];
});

describe('Google Analytics', () => {
  it('loads the existing USD8 analytics on the app and every docs page from one source', () => {
    expect(appHtml).toContain('<script type="module" src="./analytics.js"></script>');
    expect(bookConfig).toMatch(/additional-js = \[[^\]]*"analytics\.js"/);

    expect(analytics).toContain("G-XZ3M0DQJ6M");
    expect(analytics).toContain('https://www.googletagmanager.com/gtag/js?id=');
  });

  it('does not load Google Analytics before the visitor accepts', () => {
    runAnalytics();

    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    const dialog = document.querySelector('[role="dialog"][aria-label="Cookie and analytics preferences"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Cookie & Analytics Preferences');
    expect(dialog).toHaveTextContent('USD8 uses optional Google Analytics cookies to understand aggregate site usage. We only load analytics after you accept. Rejecting does not affect the app.');
    expect(dialog.querySelector('[data-analytics-reject]')).toHaveTextContent('Reject Analytics Cookies');
    expect(dialog.querySelector('[data-analytics-accept]')).toHaveTextContent('Accept Analytics Cookies');
  });

  it('keeps analytics blocked after rejection', () => {
    runAnalytics();
    document.querySelector('[data-analytics-reject]').click();

    expect(localStorage.getItem('usd8.analyticsConsent')).toBe('rejected');
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    expect(document.querySelector('[role="dialog"][aria-label="Cookie and analytics preferences"]')).toBeNull();
  });

  it('loads Google Analytics once after acceptance', () => {
    runAnalytics();
    document.querySelector('[data-analytics-accept]').click();
    document.querySelector('[data-analytics-accept]')?.click();

    expect(localStorage.getItem('usd8.analyticsConsent')).toBe('accepted');
    expect(document.querySelectorAll('script[src="https://www.googletagmanager.com/gtag/js?id=G-XZ3M0DQJ6M"]')).toHaveLength(1);
    expect(window.dataLayer).toEqual(expect.arrayContaining([
      expect.objectContaining({ 0: 'config', 1: 'G-XZ3M0DQJ6M' }),
    ]));
    expect(document.querySelector('[role="dialog"][aria-label="Cookie and analytics preferences"]')).toBeNull();
  });

  it('restores accepted consent without showing the banner', () => {
    runAnalytics('accepted');

    expect(document.querySelectorAll('script[src*="googletagmanager.com"]')).toHaveLength(1);
    expect(document.querySelector('[role="dialog"][aria-label="Cookie and analytics preferences"]')).toBeNull();
  });

  it('lets a persistent settings control reopen the preference dialog', () => {
    runAnalytics('rejected');
    const settings = document.createElement('button');
    settings.dataset.analyticsSettings = '';
    document.body.appendChild(settings);
    settings.click();

    expect(document.querySelector('[role="dialog"][aria-label="Cookie and analytics preferences"]')).toBeInTheDocument();
  });

  it('withdraws accepted consent, clears GA cookies, and restores settings focus', () => {
    runAnalytics();
    document.querySelector('[data-analytics-accept]').click();
    document.cookie = '_ga=GA1.1.123; path=/';
    document.cookie = '_ga_USD8=GS1.1.456; path=/';

    const settings = document.createElement('button');
    settings.dataset.analyticsSettings = '';
    settings.textContent = 'Cookie Settings';
    document.body.appendChild(settings);
    settings.focus();
    settings.click();

    const reject = document.querySelector('[data-analytics-reject]');
    expect(reject).toHaveFocus();
    reject.click();

    expect(localStorage.getItem('usd8.analyticsConsent')).toBe('rejected');
    expect(window['ga-disable-G-XZ3M0DQJ6M']).toBe(true);
    expect(window.dataLayer.some((entry) => (
      entry[0] === 'consent'
      && entry[1] === 'update'
      && entry[2]?.analytics_storage === 'denied'
    ))).toBe(true);
    expect(document.cookie).not.toContain('_ga=');
    expect(document.cookie).not.toContain('_ga_USD8=');
    expect(settings).toHaveFocus();
  });
});
