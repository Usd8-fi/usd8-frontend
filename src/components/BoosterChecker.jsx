import { useState } from 'react';

const RPC_URL = 'https://ethereum.publicnode.com';
const CONTRACT = '0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d';
const BALANCE_OF_SELECTOR = '0x00fdd58e';
const TOKEN_ID = 1;

function encodeBalanceOf(address) {
  const addressPadded = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const tokenPadded = TOKEN_ID.toString(16).padStart(64, '0');
  return `${BALANCE_OF_SELECTOR}${addressPadded}${tokenPadded}`;
}

export default function BoosterChecker() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState({ state: '', message: '' });
  const [count, setCount] = useState(0);
  const [checking, setChecking] = useState(false);

  async function checkBoosters() {
    const value = address.trim();
    setCount(0);

    if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
      setStatus({ state: 'error', message: 'Enter a valid Ethereum address.' });
      return;
    }

    setChecking(true);
    setStatus({ state: 'loading', message: 'Checking...' });

    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: CONTRACT, data: encodeBalanceOf(value) }, 'latest'],
        }),
      });
      const json = await response.json();
      if (json.error) throw new Error(json.error.message || 'RPC error');

      const nextCount = Number.parseInt(json.result, 16);
      if (!nextCount) {
        setStatus({ state: 'empty', message: 'No Boosters found for this address.' });
        return;
      }

      setCount(nextCount);
      setStatus({
        state: 'success',
        message: `Congratulations! You have ${nextCount} Booster${nextCount === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      setStatus({ state: 'error', message: `Error: ${error.message || 'could not fetch balance'}` });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="booster-check">
      <input
        value={address}
        type="text"
        placeholder="0x..."
        autoComplete="off"
        spellCheck="false"
        onChange={(event) => setAddress(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') checkBoosters();
        }}
      />
      <button type="button" disabled={checking} onClick={checkBoosters}>
        Check
      </button>
      <div className="booster-result" data-state={status.state}>
        {status.message ? <p className="booster-message">{status.message}</p> : null}
        {count > 0 ? (
          <div className="booster-grid">
            {Array.from({ length: count }, (_, index) => (
              <img key={index} src="/assets/booster.png" alt="Booster" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
