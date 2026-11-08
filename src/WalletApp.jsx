import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import WalletRestore from './components/WalletRestore.jsx';
import { queryClient } from './lib/dataCache.js';
import { t } from './lib/i18n.js';
import { initializeWalletConnector, wagmiConfig, walletConnectorConfigured } from './lib/walletConnector.js';

export function prepareWallet() {
  if (!walletConnectorConfigured || !wagmiConfig) throw new Error(t('app.wallet.connectUnavailable'));
  initializeWalletConnector();
}
export default function WalletApp({ autoConnect }) {
  return <WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}>
    <WalletRestore />
    <App autoConnect={autoConnect} />
  </QueryClientProvider></WagmiProvider>;
}
