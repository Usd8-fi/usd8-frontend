import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root.jsx';
import PrivateBetaGate from './components/PrivateBetaGate.jsx';
import './styles.css';
import '../theme/css/link-theme.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrivateBetaGate><Root /></PrivateBetaGate>
  </StrictMode>,
);
