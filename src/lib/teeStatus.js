import { fetchLogsInChunks } from './history.js';
import { readClientFor } from './chainData.js';
import { getProtocolNetwork } from './networkConfig.js';

export const DEFAULT_TEE_STATUS_URL = 'https://dx3jgwcfhb7dxafa2qqtfcbzgu0dodyf.lambda-url.eu-central-1.on.aws/';

export function teeStatusUrl(override = import.meta.env.VITE_TEE_STATUS_URL) {
  return (override || DEFAULT_TEE_STATUS_URL).replace(/\/$/, '') + '/';
}

const registryPcrAbi = [{ type: 'function', name: 'teePcrHash', stateMutability: 'view', inputs: [], outputs: [{ type: 'bytes32' }] }];
const teeSignerEvent = { type: 'event', name: 'TeeSignerSet', inputs: [
  { name: 'signer', type: 'address', indexed: true }, { name: 'authorized', type: 'bool', indexed: false }] };

/// AWS-side view of the claim-verification TEE (read-only status function).
export async function fetchTeeFleet({ signal } = {}) {
  const response = await fetch(teeStatusUrl(), { headers: { accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`TEE status request failed (${response.status})`);
  return response.json();
}

/// Chain-side view: the PCR hash incidents must be signed under, and the
/// signer addresses DefiInsurance currently accepts (replayed from its events).
export async function fetchTeeOnchain(chainId, { signal } = {}) {
  const network = getProtocolNetwork(chainId);
  const client = readClientFor(chainId);
  const head = await client.getBlockNumber();
  const from = BigInt(network.contracts.coverPools[0]?.deployBlock ?? 0);
  const [pcrHash, logs] = await Promise.all([
    client.readContract({ address: network.contracts.registry, abi: registryPcrAbi, functionName: 'teePcrHash' }),
    fetchLogsInChunks(client, { address: network.contracts.defiInsurance, events: [teeSignerEvent] }, from, head, { signal }),
  ]);
  const signers = new Map();
  logs.forEach((log) => signers.set(log.args.signer.toLowerCase(), log.args.authorized));
  return {
    pcrHash,
    signers: [...signers].filter(([, authorized]) => authorized).map(([signer]) => signer),
  };
}
