import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { queryClient } from './lib/dataCache.js';
import { initializeWalletConnector, wagmiConfig, walletConnectorConfigured } from './lib/walletConnector.js';

export function prepareWallet() {
  if (!walletConnectorConfigured || !wagmiConfig) throw new Error('Wallet connection is unavailable until VITE_REOWN_PROJECT_ID is configured.');
  initializeWalletConnector();
}
export default function WalletApp({ autoConnect }) {
  return <WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}>
    <App autoConnect={autoConnect} />
  </QueryClientProvider></WagmiProvider>;
}
