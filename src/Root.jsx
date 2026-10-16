import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import PublicApp from './PublicApp.jsx';
import ActivityTicker from './components/ActivityTicker.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// The dashboard and its charts load only when its page is opened.
const SystemDashboard = lazy(() => import('./components/SystemDashboard.jsx'));
export const SYSTEM_DASHBOARD_HASH = '#system-dashboard';

function useDashboardRoute() {
  const [open, setOpen] = useState(() => window.location.hash === SYSTEM_DASHBOARD_HASH);
  useEffect(() => {
    const onChange = () => {
      setOpen(window.location.hash === SYSTEM_DASHBOARD_HASH);
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return open;
}

export default function Root() {
  const dashboardOpen = useDashboardRoute();
  const [runtime, setRuntime] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(null);
  const explicitConnect = useRef(false);
  async function connect(explicit = true) {
    if (explicit) explicitConnect.current = true;
    if (pending.current) return;
    setConnecting(true);
    setError('');
    const request = import('./WalletApp.jsx');
    pending.current = request;
    try {
      const module = await request;
      module.prepareWallet();
      setRuntime({ Component: module.default, autoConnect: explicitConnect.current });
    } catch (error) { setError(error.message || 'Could not load the wallet. Please try again.'); }
    finally { pending.current = null; setConnecting(false); }
  }
  useEffect(() => {
    // Restore an existing Wagmi session after the public page has painted.
    let saved;
    try { saved = JSON.parse(localStorage.getItem('wagmi.store')); } catch { return; }
    if (!saved?.state?.current) return;
    const timer = setTimeout(() => connect(false), 100);
    return () => clearTimeout(timer);
  }, []);
  if (dashboardOpen) {
    return <Suspense fallback={<LoadingSpinner label="Loading system dashboard" />}><SystemDashboard /></Suspense>;
  }
  return (
    <>
      {runtime ? <runtime.Component autoConnect={runtime.autoConnect} />
        : <PublicApp onConnect={() => connect(true)} connecting={connecting} connectError={error} />}
      <ActivityTicker />
    </>
  );
}
