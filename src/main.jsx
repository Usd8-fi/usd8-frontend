import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import App from './App.jsx';
import { initializeWalletConnector, wagmiConfig, walletConnectorConfigured } from './lib/walletConnector.js';
import './styles.css';

const queryClient = new QueryClient();

initializeWalletConnector();

function Root() {
  if (!walletConnectorConfigured || !wagmiConfig) return <App />;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
