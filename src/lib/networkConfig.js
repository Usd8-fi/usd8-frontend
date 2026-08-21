import { mainnet, sepolia } from 'viem/chains';

const SEPOLIA_CONTRACTS = Object.freeze({
  registry: '0x7d09c1e9ee03350a177c2a542e90285b55e8a218',
  usdc: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
  usd8: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
  treasury: '0x26f85ec30a753451d218f4dc526f696d2d805097',
  savingsVault: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
  coverPool: '0xecbfc3b78cd4b29ed589b78c46a8819da8924432',
  coverAsset: '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa',
  coverAssetUsdOracle: '0x00e79afb10a84d153803f00e73900803179d594e',
  defiInsurance: '0xc74439a7a3d5db8a48766a5fc2d200bd2858026d',
  booster: '0xc0012770848fcd350ab11906e93ba9fdfda19f4c',
  insuredTokens: Object.freeze({
    usd8: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
    susd8: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
    'aave-sgho': '0x6e5eb99a5923bea10eb3990ec8da84e70007e668',
    'sky-susds': '0x5279e60d104110db53b9d00a54f323e978be3757',
    'test-msloss': '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
  }),
});

const NETWORKS = Object.freeze({
  [sepolia.id]: Object.freeze({
    id: sepolia.id,
    name: 'Sepolia',
    chain: sepolia,
    scoreAvailable: true,
    protocolAvailable: true,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    contracts: SEPOLIA_CONTRACTS,
  }),
  [mainnet.id]: Object.freeze({
    id: mainnet.id,
    name: 'Ethereum',
    chain: mainnet,
    scoreAvailable: false,
    protocolAvailable: false,
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
