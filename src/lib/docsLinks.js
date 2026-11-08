import { getLanguage } from './i18n.js';

/// The one place the app's documentation location is defined. Relative, so it
/// resolves under whichever path the site is published at (for example /beta/).
export const DOCS_BASE_URL = './docs/';

/// Docs in the visitor's language: translated books live at docs/<lang>/.
/// Heading anchors keep their English ids in every language, so deep links work.
export const docsUrl = (path = '') => {
  const language = getLanguage();
  return `${DOCS_BASE_URL}${language === 'en' ? '' : `${language}/`}${path}`;
};
