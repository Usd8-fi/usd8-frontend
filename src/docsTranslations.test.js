import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every docs page must ship in every language: a page added to book-src/
// without its translations fails here. Legal stays English (build-docs.sh
// copies it in), so it is the only chapter a translated book may omit.
const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const chapters = (summary) => [...summary.matchAll(/\]\(([^)]+\.md)\)/g)].map(([, file]) => file);
const english = chapters(read('book-src/SUMMARY.md'));
const languages = readdirSync(resolve(root, 'book-i18n')).filter((name) => !name.startsWith('_'));
const ENGLISH_ONLY = new Set(['legal.md']);

// Widget hooks a translated page must keep byte-identical: element ids, data-* and widget classes.
const hooks = (markdown) => [...markdown.matchAll(/\s(id|data-[a-z-]+|for)="([^"]*)"/g)].map(([, name, value]) => `${name}=${value}`).sort();
const widgetKeys = (row) => [...row.matchAll(/(?:^|[{,]\s*)"?([A-Za-z_]+)"?: "/g)].map(([, key]) => key);
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();

describe('translated docs', () => {
  it('has 17 translated books', () => {
    expect(languages).toHaveLength(17);
  });

  it.each(languages)('%s lists every English chapter, in order, and ships each page', (lang) => {
    expect(chapters(read(`book-i18n/${lang}/SUMMARY.md`))).toEqual(english);
    for (const file of english) {
      if (ENGLISH_ONLY.has(file)) continue;
      expect(existsSync(resolve(root, `book-i18n/${lang}/${file}`)), `${lang}/${file}`).toBe(true);
    }
  });

  it.each(languages)('%s keeps the anti-scam widget hooks and the English anchor', (lang) => {
    const page = read(`book-i18n/${lang}/anti-scam-check.md`);
    expect(hooks(page)).toEqual(hooks(read('book-src/anti-scam-check.md')));
    expect(page).toMatch(/^# .+ \{#anti-scam-check\}\n/);
    expect(read(`book-i18n/${lang}/SUMMARY.md`)).toContain('<!-- Hidden:');
  });

  it('gives every docs language every anti-scam widget string with the same placeholders', () => {
    const theme = read('docs-theme.js');
    const block = theme.slice(theme.indexOf('var WIDGET_TEXT = {'), theme.indexOf('\n    };', theme.indexOf('var WIDGET_TEXT = {')));
    const rows = Object.fromEntries(block.split('\n').slice(1)
      .map((line) => line.match(/^\s*"?([a-zA-Z-]+)"?: \{(.*)\},?$/)).filter(Boolean)
      .map(([, lang, body]) => [lang, body]));
    expect(Object.keys(rows).sort()).toEqual(['en', ...languages].sort());
    const keys = widgetKeys(rows.en).filter((key) => key.startsWith('antiScam'));
    expect(keys).toEqual(['antiScamInvalid', 'antiScamOfficial', 'antiScamUnknown', 'antiScamUnavailable']);
    for (const [lang, body] of Object.entries(rows)) {
      for (const key of keys) {
        const value = body.match(new RegExp(`${key}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1];
        expect(value, `${lang}.${key}`).toBeTruthy();
        expect(placeholders(value), `${lang}.${key}`).toEqual(placeholders(rows.en.match(new RegExp(`${key}: "([^"]*)"`))[1]));
      }
    }
  });
});
