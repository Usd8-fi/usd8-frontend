import { createPublicClient } from 'viem';
import { rpcTransportFor } from './chainData.js';
import { getProtocolNetwork } from './networkConfig.js';

// Full public client for the wallet runtime only: gas estimation and receipt
// polling need viem's complete action set, which the read-only public page
// deliberately leaves out (see readClient.js).
const clients = new Map();

export function transactionClientFor(chainId) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw new Error('USD8 is not deployed on the selected network');
  let client = clients.get(network.id);
  if (!client) {
    client = createPublicClient({ chain: network.chain, transport: rpcTransportFor(network.rpcUrl) });
    clients.set(network.id, client);
  }
  return client;
}
