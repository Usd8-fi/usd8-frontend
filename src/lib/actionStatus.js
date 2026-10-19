import { useState } from 'react';

const IDLE = Object.freeze({ message: '', failed: false });

/**
 * One action's inline status line: a message plus whether it reports a failure.
 *
 * `isCurrent` guards late writes from a superseded wallet scope. The returned
 * setters are deliberately rebuilt every render, so an async handler keeps the
 * guard from the render that started it and a stale transaction can't write
 * into the next account's dialog.
 */
export function useActionStatus(isCurrent = () => true) {
  const [status, setStatus] = useState(IDLE);
  const write = (next) => {
    if (!isCurrent()) return;
    setStatus(previous => (previous.message === next.message && previous.failed === next.failed ? previous : next));
  };
  return [status, {
    show: (message) => write(message ? { message, failed: false } : IDLE),
    fail: (message) => write({ message, failed: true }),
    clear: () => write(IDLE),
  }];
}
