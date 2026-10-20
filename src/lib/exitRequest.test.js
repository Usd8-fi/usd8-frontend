import { describe, expect, it } from 'vitest';
import { keccak256, toBytes } from 'viem';
import { cooldownProgressPercent, latestRequestBefore, REDEEM_REQUESTED_TOPIC } from './exitRequest.js';

describe('exit request timing', () => {
  it('uses the RedeemRequested event topic', () => {
    expect(REDEEM_REQUESTED_TOPIC).toBe(keccak256(toBytes('RedeemRequested(address,uint256)')));
  });

  it('takes the latest request filed before the exit ends', () => {
    const end = 2_000_000_000_000;
    const logs = [{ timeStamp: '0x6ad473eb' }, { timeStamp: '0x6ad5c56b' }, { timeStamp: (end / 1000 + 10).toString(16) }];
    expect(latestRequestBefore(logs, end)).toBe(0x6ad5c56b * 1000);
    expect(latestRequestBefore([], end)).toBeNull();
    expect(latestRequestBefore(undefined, end)).toBeNull();
  });

  it('measures elapsed cooldown, clamped to 0-100', () => {
    expect(cooldownProgressPercent(1_000, 11_000, 3_500)).toBe(25);
    expect(cooldownProgressPercent(1_000, 11_000, 500)).toBe(0);
    expect(cooldownProgressPercent(1_000, 11_000, 20_000)).toBe(100);
    expect(cooldownProgressPercent(null, 11_000, 3_500)).toBeNull();
    expect(cooldownProgressPercent(12_000, 11_000, 3_500)).toBeNull();
  });
});
