export const DEFAULT_CLAIM_API_URL = 'https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com';

export function claimApiBaseUrl(hostname = globalThis.location?.hostname, configuredUrl = import.meta.env.VITE_CLAIM_API_URL) {
  const localPreview = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
  const defaultUrl = localPreview ? '/api/claims' : DEFAULT_CLAIM_API_URL;
  if (configuredUrl) {
    try {
      const hostname = new URL(configuredUrl).hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return defaultUrl;
      }
    } catch {
      // Preserve the configured value so requests fail closed with a visible error.
    }
  }
  return configuredUrl || defaultUrl;
}

export const CLAIM_API_BASE_URL = claimApiBaseUrl().replace(/\/$/, '');
export const claimApiConfigured = Boolean(CLAIM_API_BASE_URL);

export function matchesSettlementContext(settlement, incidentId, root) {
  return settlement?.incidentId === String(incidentId)
    && typeof settlement.root === 'string'
    && typeof root === 'string'
    && settlement.root.toLowerCase() === root.toLowerCase();
}
