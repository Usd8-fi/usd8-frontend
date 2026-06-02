import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { protocolConfig } from '../config/protocolConfig.js';

const PLACEHOLDER_PROJECT_IDS = new Set(['', 'YOUR_REOWN_PROJECT_ID']);

export const reownProjectId = String(protocolConfig.reownProjectId || '').trim();
export const walletConnectorConfigured = Boolean(reownProjectId) && !PLACEHOLDER_PROJECT_IDS.has(reownProjectId);
export const walletNetworks = [mainnet];

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
    description: 'USD8 Dashboard',
    url: origin,
    icons: [`${origin}/assets/usd8Logo.svg`],
  };
}

export function initializeWalletConnector() {
  if (!walletConnectorConfigured || !wagmiAdapter || appKitInitialized) return;

  createAppKit({
    adapters: [wagmiAdapter],
    networks: walletNetworks,
    defaultNetwork: mainnet,
    projectId: reownProjectId,
    metadata: getMetadata(),
    themeMode: 'dark',
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
