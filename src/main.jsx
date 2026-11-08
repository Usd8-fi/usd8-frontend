import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root.jsx';
import PrivateBetaGate from './components/PrivateBetaGate.jsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import { startErrorReporting } from './lib/errorReporting.js';
import { initLanguage } from './lib/i18n.js';
import './styles.css';
import '../theme/css/link-theme.css';

startErrorReporting();
initLanguage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <PrivateBetaGate><Root /></PrivateBetaGate>
    </AppErrorBoundary>
  </StrictMode>,
);
