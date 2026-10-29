import { describe, expect, it } from 'vitest';
import { mergeSnapshot } from './mergeSnapshot.js';

describe('mergeSnapshot pool APY', () => {
  it('keeps the APY spinner off once the APY read has answered, even if it failed', () => {
    const current = { pools: [{ id: 'wsteth', apy: null, apyPending: false }] };
    const next = { pools: [{ id: 'wsteth', apy: null, apyPending: true }] };
    expect(mergeSnapshot(current, next).pools[0].apyPending).toBe(false);
  });

  it('leaves a first snapshot pending until the APY read answers', () => {
    const next = { pools: [{ id: 'wsteth', apy: null, apyPending: true }] };
    expect(mergeSnapshot({ pools: [] }, next).pools[0].apyPending).toBe(true);
  });
});
