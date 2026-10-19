import { createClient, getBlock, getBlockNumber, getLogs, multicall, readContract } from './viemLite.js';

// The public page only reads chain state. `createPublicClient` decorates every
// public action — CCIP lookups, signature verification, simulation, watchers —
// and drags secp256k1 and the full ABI/error catalogue onto first load. Binding
// the five reads the data layer uses keeps that code in the wallet chunk.
export function createReadClient(config) {
  const client = createClient(config);
  return {
    chain: client.chain,
    getBlock: (args) => getBlock(client, args),
    getBlockNumber: (args) => getBlockNumber(client, args),
    getLogs: (args) => getLogs(client, args),
    multicall: (args) => multicall(client, args),
    readContract: (args) => readContract(client, args),
  };
}
