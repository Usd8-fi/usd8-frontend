// External services (AWS bill and usage, dRPC, public providers, GitHub Pages,
// domain) for the System Dashboard. Served ONLY by the local dashboard server
// (~/defi-dashboard/server.py, GET /services/summary), which holds the AWS
// profile and the dRPC Statistics token; the public site has no such endpoint.

export const SERVICES_URL = '/services/summary';
export const SERVICE_SECTIONS = Object.freeze(['costs', 'aws', 'drpc', 'providers', 'web']);

export async function fetchServices({ signal, refresh = [] } = {}) {
  const sections = refresh.filter((name) => SERVICE_SECTIONS.includes(name));
  const url = sections.length ? `${SERVICES_URL}?refresh=${sections.join(',')}` : SERVICES_URL;
  const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store', signal });
  if (response.status === 404) throw new Error('LOCAL_ONLY');
  if (!response.ok) throw new Error(`Services request failed (${response.status})`);
  const payload = await response.json();
  if (!payload || typeof payload !== 'object' || !SERVICE_SECTIONS.every((name) => payload[name])) {
    throw new Error('Malformed services response');
  }
  return payload;
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return null;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = Number(bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${unit ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/// Whole numbers without thousands separators (site convention).
export const count = (value) => (value === null || value === undefined ? null : String(Math.round(Number(value))));
export const dollars = (value) => {
  if (value === null || value === undefined) return null;
  const amount = Number(value);
  return `${amount < 0 && amount.toFixed(2) !== '-0.00' ? '-' : ''}$${Math.abs(amount).toFixed(2)}`;
};
