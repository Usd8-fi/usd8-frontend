import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useActionStatus } from './actionStatus.js';

describe('useActionStatus', () => {
  it('tracks progress, failure and clearing as one value', () => {
    const { result } = renderHook(() => useActionStatus());
    act(() => result.current[1].show('Confirm the USD8 mint in your wallet.'));
    expect(result.current[0]).toEqual({ message: 'Confirm the USD8 mint in your wallet.', failed: false });
    act(() => result.current[1].fail('Transaction failed.'));
    expect(result.current[0]).toEqual({ message: 'Transaction failed.', failed: true });
    act(() => result.current[1].show('Mint confirmed on Sepolia.'));
    expect(result.current[0].failed).toBe(false);
    act(() => result.current[1].clear());
    expect(result.current[0]).toEqual({ message: '', failed: false });
  });

  it('drops writes from a superseded wallet scope', () => {
    let current = true;
    const { result } = renderHook(() => useActionStatus(() => current));
    const staleLine = result.current[1];
    current = false;
    act(() => staleLine.fail('Late failure from the previous account.'));
    expect(result.current[0]).toEqual({ message: '', failed: false });
  });

  it('keeps the same state object for an identical write, avoiding a re-render', () => {
    const { result } = renderHook(() => useActionStatus());
    act(() => result.current[1].show('Loading'));
    const before = result.current[0];
    act(() => result.current[1].show('Loading'));
    expect(result.current[0]).toBe(before);
  });
});
