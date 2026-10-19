import { useState } from 'react';
import usd8Logo from '../assets/usd8Logo.svg';
import usd8Wordmark from '../assets/usd8-wordmark.svg';

// Client-side gate only: it hides the app from casual visitors, it is not real
// security. The code itself is never in the repository: the build reads only
// its SHA-256 from VITE_PRIVATE_BETA_CODE_SHA256 (set in the untracked
// .env.local). With no hash configured, no code is accepted.
export const PRIVATE_BETA_STORAGE_KEY = 'usd8.privateBetaAccess';
const MAX_CODE_LENGTH = 32;

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function matchesInvitationCode(code) {
  const expected = String(import.meta.env.VITE_PRIVATE_BETA_CODE_SHA256 || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expected) || !code) return false;
  try {
    return (await sha256Hex(code)) === expected;
  } catch {
    return false;
  }
}

function hasStoredAccess() {
  try {
    return localStorage.getItem(PRIVATE_BETA_STORAGE_KEY) === 'granted';
  } catch {
    return false;
  }
}

export default function PrivateBetaGate({ children }) {
  const [granted, setGranted] = useState(hasStoredAccess);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (granted) return children;

  async function submit(event) {
    event.preventDefault();
    if (!(await matchesInvitationCode(code))) {
      setError('Invalid invitation code.');
      return;
    }
    try {
      localStorage.setItem(PRIVATE_BETA_STORAGE_KEY, 'granted');
    } catch {
      // Storage can be unavailable; access still lasts for this page view.
    }
    setGranted(true);
  }

  return (
    <main className="private-beta">
      <section className="private-beta-panel">
        {/* Two lines: logo + USD8 wordmark, then the invitation-code label. */}
        <h1 className="private-beta-brand">
          <img className="private-beta-logo" src={usd8Logo} alt="" />
          <img className="private-beta-wordmark" src={usd8Wordmark} alt="USD8" />
        </h1>
        <form className="private-beta-form" onSubmit={submit}>
          <label htmlFor="private-beta-code">Private Beta Invitation Code</label>
          <input
            id="private-beta-code"
            autoComplete="off"
            autoFocus
            autoCapitalize="off"
            spellCheck={false}
            maxLength={MAX_CODE_LENGTH}
            placeholder="••••••••"
            type="text"
            value={code}
            onChange={(event) => {
              // Letters and digits only; a long random code keeps the published hash unguessable.
              setCode(event.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, MAX_CODE_LENGTH));
              setError('');
            }}
          />
          {error ? <p className="private-beta-error" role="alert">{error}</p> : null}
          <button className="private-beta-button" type="submit">Access beta</button>
        </form>
      </section>
    </main>
  );
}
