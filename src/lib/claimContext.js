export const DEFAULT_CLAIM_API_URL = 'https://u3eb72vdu4.execute-api.eu-central-1.amazonaws.com';

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

// Ethereum mainnet has its own TEE job service (separate enclave release,
// signer and KMS key); every other chain uses the default service above.
export const MAINNET_CLAIM_API_URL = 'https://c8cnx9estd.execute-api.eu-central-1.amazonaws.com';

export function claimApiBaseUrlForChain(chainId, hostname = globalThis.location?.hostname) {
  if (Number(chainId) !== 1) return CLAIM_API_BASE_URL;
  const localPreview = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
  return localPreview ? '/api/claims-mainnet' : MAINNET_CLAIM_API_URL;
}

export function matchesSettlementContext(settlement, incidentId, root) {
  return settlement?.incidentId === String(incidentId)
    && typeof settlement.root === 'string'
    && typeof root === 'string'
    && settlement.root.toLowerCase() === root.toLowerCase();
}
