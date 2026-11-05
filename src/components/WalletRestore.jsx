import { useEffect, useRef } from 'react';
import { useAccount, useReconnect } from 'wagmi';

// Browser wallets such as Ambire announce themselves (EIP-6963) a moment after
// page load, but wagmi's mount-time restore only tries the wallets it already
// knows. A saved session whose wallet announced late was skipped and the user
// ended up disconnected. Retry the restore a few times while a saved session
// exists and nothing is connected. It never opens a connect popup.
export const RESTORE_RETRY_DELAYS_MS = [400, 1200, 2500, 4500];

export function hasSavedSession(storage = globalThis.localStorage) {
  try { return Boolean(JSON.parse(storage.getItem('wagmi.store'))?.state?.current); } catch { return false; }
}

export default function WalletRestore() {
  const { status } = useAccount();
  const { reconnect } = useReconnect();
  const statusRef = useRef(status);
  statusRef.current = status;
  useEffect(() => {
    if (!hasSavedSession()) return undefined;
    const timers = RESTORE_RETRY_DELAYS_MS.map(delay => setTimeout(() => {
      // Skip while a restore is running or once connected.
      if (statusRef.current === 'disconnected') reconnect();
    }, delay));
    return () => timers.forEach(clearTimeout);
  }, []);
  return null;
}
