import { createAppKit } from '@reown/appkit/react';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const PLACEHOLDER_PROJECT_IDS = new Set(['', 'YOUR_REOWN_PROJECT_ID']);
const DEFAULT_REOWN_PROJECT_ID = '0a6111479b9c06dc90f816d4138a6c4e';
export const reownProjectId = String(import.meta.env.VITE_REOWN_PROJECT_ID || DEFAULT_REOWN_PROJECT_ID).trim();
export const walletConnectorConfigured = Boolean(reownProjectId) && !PLACEHOLDER_PROJECT_IDS.has(reownProjectId);
export const walletNetworks = [sepolia, mainnet];

export const wagmiAdapter = walletConnectorConfigured
  ? new WagmiAdapter({
      networks: walletNetworks,
      projectId: reownProjectId,
    })
  : null;

export const wagmiConfig = wagmiAdapter?.wagmiConfig || null;

let appKitInitialized = false;

function getMetadata() {
  const origin = typeof window === 'undefined' ? 'https://usd8.fi' : window.location.origin;

  return {
    name: 'USD8',
    description: 'USD8 DeFi insurance and cover pools',
    url: origin,
    icons: [`${origin}/assets/usd8Logo.svg`],
  };
}

export function initializeWalletConnector() {
  if (!walletConnectorConfigured || !wagmiAdapter || appKitInitialized) return;

  createAppKit({
    adapters: [wagmiAdapter],
    networks: walletNetworks,
    defaultNetwork: sepolia,
    projectId: reownProjectId,
    metadata: getMetadata(),
    themeMode: 'dark',
    themeVariables: {
      '--w3m-font-family': '"BlexMono Nerd Font Mono", monospace',
    },
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    enableWalletConnect: true,
    enableReconnect: true,
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
      receive: false,
      send: false,
      history: false,
    },
  });

  appKitInitialized = true;
}
