import { getLanguage, LANGUAGES, t } from './i18n.js';

const rules = new Map();

function pluralRules(code) {
  if (!rules.has(code)) {
    const tag = LANGUAGES.find(language => language.code === code)?.html || 'en';
    rules.set(code, new Intl.PluralRules(tag));
  }
  return rules.get(code);
}

/// Translates a counted phrase: picks `<base>_<category>` for the current
/// language (Intl plural category: one, few, many, other ...) and falls back to
/// `<base>_other` when that form is not written. `{count}` is filled with the
/// number in English digits; numbers are never localized.
export function tCount(base, count, vars = {}) {
  const values = { ...vars, count: String(count) };
  const key = `${base}_${pluralRules(getLanguage()).select(Number(count))}`;
  const text = t(key, values);
  return text === key ? t(`${base}_other`, values) : text;
}
