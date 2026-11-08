import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LANGUAGES, detectLanguage, getLanguage, resetLanguageForTests, setLanguage, STORAGE_KEY, t, tRich } from './i18n.js';
import LanguagePicker from '../components/LanguagePicker.jsx';

const LOCALES = resolve(process.cwd(), 'src/locales');
const read = (lang, file) => JSON.parse(readFileSync(resolve(LOCALES, lang, file), 'utf8'));
const flatten = (node, prefix = '') => Object.entries(node).flatMap(([key, value]) => (
  value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]));
const tokens = text => ({
  placeholders: [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
  tags: [...text.matchAll(/<(\w+)>/g)].map(match => match[1]).sort(),
});
const PLURAL = /_(zero|one|two|few|many|other)$/;

afterEach(() => { resetLanguageForTests(); localStorage.clear(); });

describe('translation files', () => {
  const namespaces = readdirSync(resolve(LOCALES, 'en')).filter(name => name.endsWith('.json'));

  for (const { code } of LANGUAGES.filter(language => language.code !== 'en')) {
    it(`${code} has every English string, with the same placeholders and markup`, () => {
      const problems = [];
      for (const file of namespaces) {
        let translated;
        try { translated = new Map(flatten(read(code, file))); } catch { problems.push(`${file}: missing`); continue; }
        const english = flatten(read('en', file));
        for (const [key, source] of english) {
          // Plural keys may differ per language (e.g. Russian adds _few/_many); compare the group.
          const value = translated.get(key) ?? (PLURAL.test(key) ? translated.get(key.replace(PLURAL, '_other')) : undefined);
          if (typeof value !== 'string' || !value.trim()) { problems.push(`${file} ${key}: missing`); continue; }
          if (JSON.stringify(tokens(value)) !== JSON.stringify(tokens(source))) problems.push(`${file} ${key}: placeholders/markup differ`);
        }
        for (const key of translated.keys()) {
          if (!english.some(([source]) => source === key) && !PLURAL.test(key)) problems.push(`${file} ${key}: not in English`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});

describe('i18n runtime', () => {
  it('falls back to English, then to the key, and fills placeholders', async () => {
    expect(t('common.language')).toBe('Language');
    expect(t('missing.key')).toBe('missing.key');
    await setLanguage('de');
    expect(getLanguage()).toBe('de');
    expect(document.documentElement.lang).toBe('de');
    expect(t('common.language')).not.toBe('Language');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('de');
  });

  it('renders markup sentences with real elements', () => {
    // A missing key renders as itself, so the key doubles as the template here.
    const { container } = render(<p>{tRich('Read the <docs>docs</docs> now.', { docs: text => <a href="/d">{text}</a> })}</p>);
    expect(container.innerHTML).toBe('<p>Read the <a href="/d">docs</a> now.</p>');
  });

  it('prefers a saved choice, then the browser language, then English', () => {
    localStorage.setItem(STORAGE_KEY, 'ja');
    expect(detectLanguage()).toBe('ja');
    localStorage.setItem(STORAGE_KEY, 'xx');
    expect(['en', ...LANGUAGES.map(language => language.code)]).toContain(detectLanguage());
  });

  it('maps Taiwan, Hong Kong and Hant browsers to Traditional Chinese, other Chinese to Simplified', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'languages');
    const detectFor = (tags) => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => tags });
      return detectLanguage();
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
      expect(detectFor(['zh-TW'])).toBe('zh-TW');
      expect(detectFor(['zh-HK', 'en'])).toBe('zh-TW');
      expect(detectFor(['zh-Hant-TW'])).toBe('zh-TW');
      expect(detectFor(['zh-CN'])).toBe('zh');
      expect(detectFor(['zh'])).toBe('zh');
      localStorage.setItem(STORAGE_KEY, 'zh-TW');
      expect(detectFor(['en-US'])).toBe('zh-TW');
    } finally {
      if (original) Object.defineProperty(navigator, 'languages', original);
      else delete navigator.languages;
    }
  });

  it('switches language from the footer picker without a reload', async () => {
    render(<LanguagePicker />);
    const select = screen.getByRole('combobox', { name: 'Language' });
    expect(select.options).toHaveLength(LANGUAGES.length);
    fireEvent.change(select, { target: { value: 'zh' } });
    await waitFor(() => expect(getLanguage()).toBe('zh'));
    expect(document.documentElement.lang).toBe('zh-CN');
  });
});
