// Local-only entry: the USD8 System Dashboard, built separately from the public
// site (npm run build:dashboard) and served by the local dashboard server, which
// proxies /api (score API) and /tee-status (TEE status) to avoid CORS.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SystemDashboard from './components/SystemDashboard.jsx';
import './styles.css';
import '../theme/css/link-theme.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SystemDashboard />
  </StrictMode>,
);
