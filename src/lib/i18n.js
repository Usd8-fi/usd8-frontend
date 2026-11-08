import { createElement, Fragment, useSyncExternalStore } from 'react';

/// Site languages. English is the source text and the fallback for any key a
/// translation lacks. Numbers, token amounts and names stay in English format.
export const LANGUAGES = Object.freeze([
  { code: 'en', label: 'English', html: 'en' },
  { code: 'zh', label: '简体中文', html: 'zh-CN' },
  { code: 'zh-TW', label: '繁體中文', html: 'zh-TW' },
  { code: 'ko', label: '한국어', html: 'ko' },
  { code: 'ja', label: '日本語', html: 'ja' },
  { code: 'de', label: 'Deutsch', html: 'de' },
  { code: 'es', label: 'Español', html: 'es' },
  { code: 'it', label: 'Italiano', html: 'it' },
  { code: 'ru', label: 'Русский', html: 'ru' },
  { code: 'pt', label: 'Português (Brasil)', html: 'pt-BR' },
  { code: 'fr', label: 'Français', html: 'fr' },
  { code: 'tr', label: 'Türkçe', html: 'tr' },
  { code: 'vi', label: 'Tiếng Việt', html: 'vi' },
  { code: 'id', label: 'Bahasa Indonesia', html: 'id' },
  { code: 'uk', label: 'Українська', html: 'uk' },
  { code: 'th', label: 'ไทย', html: 'th' },
  { code: 'ar', label: 'العربية', html: 'ar', dir: 'rtl' },
  { code: 'fa', label: 'فارسی', html: 'fa', dir: 'rtl' },
]);
export const STORAGE_KEY = 'usd8.language';
const CODES = new Set(LANGUAGES.map(language => language.code));

// One JSON file per namespace per language: src/locales/<lang>/<namespace>.json.
// English ships with the bundle; other languages load only when chosen.
const englishFiles = import.meta.glob('../locales/en/*.json', { eager: true, import: 'default' });
const otherFiles = import.meta.glob(['../locales/*/*.json', '!../locales/en/*.json'], { import: 'default' });

function merge(files) {
  const out = {};
  for (const [path, value] of Object.entries(files)) out[path.split('/').pop().replace(/\.json$/, '')] = value;
  return out;
}
const english = merge(englishFiles);
const loaded = new Map([['en', english]]);

let current = 'en';
let version = 0;
const listeners = new Set();
const notify = () => { version++; listeners.forEach(listener => listener()); };

function lookup(dictionary, key) {
  let node = dictionary;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])));
}

/// Translates `key` (namespace.path) into the current language, falling back
/// to English, then to the key itself. `{name}` placeholders take `vars`.
export function t(key, vars) {
  const text = lookup(loaded.get(current), key) ?? lookup(english, key) ?? key;
  return interpolate(text, vars);
}

/// Renders a translated sentence that contains markup, e.g.
/// "Read the <docs>docs</docs>." with { docs: text => <a href=…>{text}</a> }.
/// Keeps word order per language while the elements stay in code.
export function tRich(key, components = {}, vars) {
  const text = t(key, vars);
  const parts = [];
  const pattern = /<(\w+)>(.*?)<\/\1>/gs;
  let last = 0;
  let match;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const render = components[match[1]];
    parts.push(render ? render(match[2], parts.length) : match[2]);
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return createElement(Fragment, null, ...parts.map((part, index) => (
    typeof part === 'string' ? part : createElement(Fragment, { key: index }, part))));
}

export function getLanguage() { return current; }

/// Translated cover pool name (common.pools.<id>), else the configured name.
export function poolDisplayName(pool) {
  const key = `common.pools.${pool?.id}`;
  const text = t(key);
  return text === key ? pool?.name : text;
}

function apply(code) {
  current = code;
  const language = LANGUAGES.find(entry => entry.code === code);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language?.html || 'en';
    // Arabic and Persian read right to left; every other language left to right.
    document.documentElement.dir = language?.dir || 'ltr';
  }
  notify();
}

async function load(code) {
  if (loaded.has(code)) return loaded.get(code);
  const files = Object.fromEntries(await Promise.all(Object.entries(otherFiles)
    .filter(([path]) => path.split('/').at(-2) === code)
    .map(async ([path, importer]) => [path, await importer()])));
  const dictionary = merge(files);
  loaded.set(code, dictionary);
  return dictionary;
}

/// Switches language without a reload and remembers the choice.
export async function setLanguage(code) {
  if (!CODES.has(code)) code = 'en';
  try { globalThis.localStorage?.setItem(STORAGE_KEY, code); } catch { /* private mode */ }
  try { await load(code); } catch { code = 'en'; }
  apply(code);
}

/// The saved choice, else the browser language when the site supports it.
export function detectLanguage() {
  try {
    const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (saved && CODES.has(saved)) return saved;
  } catch { /* storage blocked */ }
  for (const tag of globalThis.navigator?.languages || [globalThis.navigator?.language || 'en']) {
    const lower = String(tag).toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-TW';
    const base = lower.split('-')[0];
    if (CODES.has(base)) return base;
  }
  return 'en';
}

/// Starts in the detected language. English renders immediately; another
/// language swaps in once its file has loaded.
export function initLanguage() {
  const code = detectLanguage();
  if (code === 'en') { apply('en'); return Promise.resolve(); }
  return load(code).then(() => apply(code), () => apply('en'));
}

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };

/// Re-renders the calling component when the language changes; returns t.
export function useTranslation() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { t, tRich, language: current };
}

/// Test helper: reset to English and forget loaded languages.
export function resetLanguageForTests() {
  for (const code of [...loaded.keys()]) if (code !== 'en') loaded.delete(code);
  apply('en');
}
