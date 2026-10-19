import { createAppKit } from '@reown/appkit/react';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const PLACEHOLDER_PROJECT_IDS = new Set(['', 'YOUR_REOWN_PROJECT_ID']);
const DEFAULT_REOWN_PROJECT_ID = '0a6111479b9c06dc90f816d4138a6c4e';
const reownProjectId = String(import.meta.env.VITE_REOWN_PROJECT_ID || DEFAULT_REOWN_PROJECT_ID).trim();
export const walletConnectorConfigured = Boolean(reownProjectId) && !PLACEHOLDER_PROJECT_IDS.has(reownProjectId);
// Only the protocol network is offered. Listing Sepolia next to mainnet let
// AppKit restore a Sepolia choice persisted from the retired /beta app on the
// same origin, which left the app idle behind a "Switch to Ethereum" button.
// With one network, a stale stored chain falls back to it and connecting asks
// the wallet for it.
export const walletNetworks = Number(import.meta.env.VITE_PROTOCOL_CHAIN_ID || mainnet.id) === sepolia.id ? [sepolia] : [mainnet];

const wagmiAdapter = walletConnectorConfigured
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
    defaultNetwork: walletNetworks[0],
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
      // Wallets only. Reown's cloud config returns no per-feature settings for
      // this project, so these local values are the ones applied; each paid or
      // account feature is switched off explicitly so a dashboard default can't
      // add it to the popup.
      emailCapture: false,
      payWithExchange: false,
      payments: false,
      reownAuthentication: false,
      reownBranding: false,
    },
  });

  appKitInitialized = true;
}
