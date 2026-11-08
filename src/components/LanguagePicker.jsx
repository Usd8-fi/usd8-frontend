import { LANGUAGES, setLanguage, useTranslation } from '../lib/i18n.js';

/// Footer language menu: switches the site language in place and remembers it.
export default function LanguagePicker() {
  const { t, language } = useTranslation();
  return (
    <label className="language-picker">
      <select
        className="language-select"
        aria-label={t('common.language')}
        value={language}
        onChange={event => { setLanguage(event.target.value); }}
      >
        {LANGUAGES.map(option => <option key={option.code} value={option.code} lang={option.html}>{option.label}</option>)}
      </select>
    </label>
  );
}
