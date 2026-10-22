// Content-Security-Policy for the production app (index.html only).
// GitHub Pages cannot send response headers, so the policy ships as a
// <meta http-equiv> tag. That form cannot carry frame-ancestors, report-uri or
// sandbox; everything else below is enforced by the browser.
//
// Every origin here is one the app actually calls. Adding a new API, RPC or
// wallet service means adding its origin here, or the browser blocks it.

export const CSP_DIRECTIVES = Object.freeze({
  'default-src': ["'self'"],
  // Google Tag Manager loads gtag.js only after analytics consent.
  'script-src': ["'self'", 'https://www.googletagmanager.com'],
  // React style props and the Reown/AppKit web components inject inline styles.
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.reown.com'],
  'font-src': ["'self'", 'data:', 'https://fonts.reown.com'],
  // Wallet icons come from wallet registries and arbitrary wallet metadata URLs.
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'connect-src': [
    "'self'",
    // Chain reads: primary and fallback mainnet RPC, Sepolia RPC for Sepolia builds.
    'https://ethereum-rpc.publicnode.com',
    'https://mainnet.gateway.tenderly.co',
    'https://rpc.sepolia.ethpandaops.io',
    // USD8 services: score API, mainnet and Sepolia claim APIs, terms.
    // (The TEE status API is read only by the local-only System Dashboard.)
    'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com',
    'https://c8cnx9estd.execute-api.eu-central-1.amazonaws.com',
    'https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com',
    'https://oz43wdk335yzi5k2kdt3qm7uzq0nbpsd.lambda-url.eu-central-1.on.aws',
    // Activity feed and history, and the Morpho vault APY.
    'https://eth.blockscout.com',
    'https://eth-sepolia.blockscout.com',
    'https://api.morpho.org',
    // WalletConnect / Reown AppKit (relay, RPC, wallet registry, verify, pulse).
    'https://*.walletconnect.org',
    'https://*.walletconnect.com',
    'wss://relay.walletconnect.org',
    'wss://relay.walletconnect.com',
    'https://*.reown.com',
    'https://api.web3modal.org',
    // Coinbase Wallet SDK.
    'https://*.coinbase.com',
    'wss://*.coinbase.com',
    'https://www.walletlink.org',
    'wss://www.walletlink.org',
    // Google Analytics (after consent).
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
  ],
  // WalletConnect verify iframe and Coinbase smart-wallet keys popup frame.
  'frame-src': [
    'https://verify.walletconnect.org',
    'https://verify.walletconnect.com',
    'https://secure.walletconnect.org',
    'https://keys.coinbase.com',
  ],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
});

export function cspContent(directives = CSP_DIRECTIVES) {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(' ')}` : name))
    .join('; ');
}

/// Add origins that depend on build configuration (e.g. the Sentry ingest host
/// from VITE_SENTRY_DSN) to connect-src.
export function withConnectOrigins(origins = []) {
  const extra = origins.filter(Boolean).filter((origin) => !CSP_DIRECTIVES['connect-src'].includes(origin));
  return { ...CSP_DIRECTIVES, 'connect-src': [...CSP_DIRECTIVES['connect-src'], ...extra] };
}

/// Vite plugin: inject the policy as the first <head> child of the production
/// build only. The dev server needs inline module scripts and is left alone.
export function contentSecurityPolicy({ connectOrigins = [] } = {}) {
  const directives = withConnectOrigins(connectOrigins);
  return {
    name: 'usd8-content-security-policy',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: () => [{
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: cspContent(directives) },
        injectTo: 'head-prepend',
      }],
    },
  };
}

/// Sentry ingest origin for the Content-Security-Policy, from a DSN like
/// https://<key>@o123.ingest.de.sentry.io/456.
export function sentryIngestOrigin(dsn = '') {
  try {
    const url = new URL(dsn);
    return url.protocol === 'https:' && /(^|\.)sentry\.io$/.test(url.hostname) ? `https://${url.hostname}` : null;
  } catch {
    return null;
  }
}
