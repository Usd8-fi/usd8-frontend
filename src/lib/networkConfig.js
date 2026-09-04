import { mainnet, sepolia } from 'viem/chains';

const SEPOLIA_CONTRACTS = Object.freeze({
  registry: '0xb34d92cd05005df36050370433819597a9bac693',
  usdc: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
  usd8: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
  treasury: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
  savingsVault: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
  // Registry order. Each entry is rendered as its own cover-pool card.
  coverPools: Object.freeze([
    Object.freeze({
      id: 'wsteth',
      name: 'wstEth Cover Pool',
      address: '0x55cb69271da9937d0cb3c548409fd3f77586df79',
      asset: '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa',
      assetSymbol: 'wstETH',
      shareSymbol: 'USD8-cp-wstETH',
      usdOracle: '0x00e79afb10a84d153803f00e73900803179d594e',
    }),
  ]),
  defiInsurance: '0x4e346ccd0a46d51ebae6810d653791982968d502',
  insuredTokens: Object.freeze({
    usd8: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
    susd8: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
    'aave-sgho': '0x6e5eb99a5923bea10eb3990ec8da84e70007e668',
    'sky-susds': '0x5279e60d104110db53b9d00a54f323e978be3757',
    'test-msloss': '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
  }),
});

// Keep metadata for retired payout assets so historical claims remain readable.
const SEPOLIA_PAYOUT_ASSETS = Object.freeze({
  '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa': Object.freeze({ symbol: 'wstETH', decimals: 18 }),
  '0xbbd327336d5135e146312dd16f2491c1e6ce8822': Object.freeze({ symbol: 'mGHO-CP', decimals: 18 }),
});

const NETWORKS = Object.freeze({
  [sepolia.id]: Object.freeze({
    id: sepolia.id,
    name: 'Sepolia',
    chain: sepolia,
    scoreAvailable: true,
    protocolAvailable: true,
    blockTimeSeconds: 12,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.ethpandaops.io',
    contracts: SEPOLIA_CONTRACTS,
    payoutAssets: SEPOLIA_PAYOUT_ASSETS,
  }),
  [mainnet.id]: Object.freeze({
    id: mainnet.id,
    name: 'Ethereum',
    chain: mainnet,
    scoreAvailable: false,
    protocolAvailable: false,
    rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || 'https://eth.drpc.org',
  }),
});

export function getNetwork(chainId) {
  return Number.isSafeInteger(chainId) ? NETWORKS[chainId] || null : null;
}

export function getProtocolNetwork(chainId) {
  const network = getNetwork(chainId);
  return network?.protocolAvailable ? network : null;
}

export { NETWORKS, SEPOLIA_CONTRACTS };
