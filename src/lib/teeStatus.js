import { readClientFor } from './chainData.js';
import { getProtocolNetwork } from './networkConfig.js';

export const DEFAULT_TEE_STATUS_URL = 'https://dx3jgwcfhb7dxafa2qqtfcbzgu0dodyf.lambda-url.eu-central-1.on.aws/';

export function teeStatusUrl(override = import.meta.env.VITE_TEE_STATUS_URL) {
  return (override || DEFAULT_TEE_STATUS_URL).replace(/\/$/, '') + '/';
}

const registryPcrAbi = [{ type: 'function', name: 'teePcrHash', stateMutability: 'view', inputs: [], outputs: [{ type: 'bytes32' }] }];

/// AWS-side view of the claim-verification TEE (read-only status function).
export async function fetchTeeFleet({ signal } = {}) {
  const response = await fetch(teeStatusUrl(), { headers: { accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`TEE status request failed (${response.status})`);
  return response.json();
}

/// Chain-side view: the PCR hash incidents must be signed under. One contract
/// read; the accepted-signer list was dropped (it needed an ever-growing log scan).
export async function fetchTeeOnchain(chainId) {
  const network = getProtocolNetwork(chainId);
  const client = readClientFor(chainId);
  const pcrHash = await client.readContract({ address: network.contracts.registry, abi: registryPcrAbi, functionName: 'teePcrHash' });
  return { pcrHash };
}
