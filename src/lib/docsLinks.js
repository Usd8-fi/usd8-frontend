/// The one place the app's documentation location is defined. Relative, so it
/// resolves under whichever path the site is published at (for example /beta/).
export const DOCS_BASE_URL = './docs/';

export const docsUrl = (path = '') => `${DOCS_BASE_URL}${path}`;
