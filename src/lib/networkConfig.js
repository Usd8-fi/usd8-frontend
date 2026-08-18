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
