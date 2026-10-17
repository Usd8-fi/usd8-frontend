import { mainnet, sepolia } from './viemLite.js';

// Step-01 CREATE3 deployment (deployments/sepolia/01-system-create3-plan.json).
// Launch scope: one wstETH cover pool, USD8 as the only insured token, no sUSD8 yet.
// Entries set to null are not deployed; chainData skips their reads.
const SEPOLIA_CONTRACTS = Object.freeze({
  registry: '0x9bff24a44bb20f8d1f1de86eca56295c5bb46430',
  usdc: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
  treasury: '0x0eae2d44dfeb2154f60cd702dc2c9c5abb090f05',
  // First Treasury block; bounds the reserve-history log scan.
  treasuryDeployBlock: 11915255,
  savingsVault: null,
  // Registry order. Each entry is rendered as its own cover-pool card.
  coverPools: Object.freeze([
    Object.freeze({
      id: 'wsteth',
      name: 'wstEth Cover Pool',
      address: '0x4bf47e25e8b42579c5cbaf84edaefb1a0f30c1b8',
      asset: '0x0539fcd774c5351da3c1d8efd64d4511f46662df',
      assetSymbol: 'wstETH',
      shareSymbol: 'USD8-cp-wstETH',
      usdOracle: '0x6ae3bb0897f0b15e175ba96ba0aaa55ccb719a05',
      // First block of the pool's history; bounds the APY log scan.
      deployBlock: 11915276,
    }),
  ]),
  defiInsurance: '0xac1a522d0fdc1c39d455d1688ad54615de5b48b9',
  insuredTokens: Object.freeze({
    usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
    // Sepolia loss-test token (slashable ERC-4626), listed for claim E2E.
    'test-msloss': '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
  }),
});

// Mainnet step-01 CREATE3 deployment (usd8-core tag v1,
// deployments/mainnet/01-system-create3-plan.json, blocks 26211008-26211082).
// CREATE3 gives the protocol contracts the same addresses as on Sepolia; the
// external dependencies (USDC, wstETH, feeds) are the canonical mainnet ones.
const MAINNET_CONTRACTS = Object.freeze({
  registry: '0x9bff24a44bb20f8d1f1de86eca56295c5bb46430',
  usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
  treasury: '0x0eae2d44dfeb2154f60cd702dc2c9c5abb090f05',
  // First Treasury block; bounds the reserve-history log scan.
  treasuryDeployBlock: 26211029,
  savingsVault: null,
  coverPools: Object.freeze([
    Object.freeze({
      id: 'wsteth',
      name: 'wstEth Cover Pool',
      address: '0x4bf47e25e8b42579c5cbaf84edaefb1a0f30c1b8',
      asset: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      assetSymbol: 'wstETH',
      shareSymbol: 'USD8-cp-wstETH',
      // Chainlink "wstETH / USD Calculated".
      usdOracle: '0x164b276057258d81941e97b0a900d4c7b358bce0',
      deployBlock: 26211040,
    }),
  ]),
  defiInsurance: '0xac1a522d0fdc1c39d455d1688ad54615de5b48b9',
  // Launch scope: USD8 is the only insured token.
  insuredTokens: Object.freeze({
    usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
  }),
});

const MAINNET_PAYOUT_ASSETS = Object.freeze({
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': Object.freeze({ symbol: 'wstETH', decimals: 18 }),
  '0x2fe01f5e235eeab9045066f873f531de20f31947': Object.freeze({ symbol: 'USD8', decimals: 18 }),
});

// Keep metadata for retired payout assets so historical claims remain readable.
const SEPOLIA_PAYOUT_ASSETS = Object.freeze({
  '0x0539fcd774c5351da3c1d8efd64d4511f46662df': Object.freeze({ symbol: 'wstETH', decimals: 18 }),
  '0x2fe01f5e235eeab9045066f873f531de20f31947': Object.freeze({ symbol: 'USD8', decimals: 18 }),
  '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa': Object.freeze({ symbol: 'wstETH', decimals: 18 }),
  '0xbbd327336d5135e146312dd16f2491c1e6ce8822': Object.freeze({ symbol: 'mGHO-CP', decimals: 18 }),
  '0xa5b32853235619b5e9af364a40c0c6386dbd6055': Object.freeze({ symbol: 'USD8', decimals: 18 }),
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
    // HTTP index for the activity ticker. Reads here cost no RPC calls.
    explorerApiUrl: 'https://eth-sepolia.blockscout.com/api/v2',
    contracts: SEPOLIA_CONTRACTS,
    payoutAssets: SEPOLIA_PAYOUT_ASSETS,
  }),
  [mainnet.id]: Object.freeze({
    id: mainnet.id,
    name: 'Ethereum',
    chain: mainnet,
    // Served by the same score API as Sepolia, via /score/1/{account}.
    scoreAvailable: true,
    protocolAvailable: true,
    blockTimeSeconds: 12,
    // PublicNode: keyless and CORS-open, and unlike the keyless dRPC endpoint it
    // serves eth_getLogs (10k-block chunks), which the reserve and TEE panels need.
    rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    explorerApiUrl: 'https://eth.blockscout.com/api/v2',
    contracts: MAINNET_CONTRACTS,
    payoutAssets: MAINNET_PAYOUT_ASSETS,
  }),
});

/// The chain the frontend serves; wallets are asked to switch here. Mainnet by
/// default; set VITE_PROTOCOL_CHAIN_ID=11155111 to run against Sepolia.
const requestedChainId = Number(import.meta.env.VITE_PROTOCOL_CHAIN_ID || mainnet.id);
export const PROTOCOL_CHAIN_ID = NETWORKS[requestedChainId]?.protocolAvailable ? requestedChainId : mainnet.id;

export function getNetwork(chainId) {
  return Number.isSafeInteger(chainId) ? NETWORKS[chainId] || null : null;
}

/// Only the served chain counts as a protocol network, so a wallet on the other
/// deployment is asked to switch instead of silently showing its data.
export function getProtocolNetwork(chainId) {
  const network = getNetwork(chainId);
  return network?.protocolAvailable && network.id === PROTOCOL_CHAIN_ID ? network : null;
}

export { MAINNET_CONTRACTS, NETWORKS, SEPOLIA_CONTRACTS };
