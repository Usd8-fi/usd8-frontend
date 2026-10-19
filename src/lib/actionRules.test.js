import { describe, expect, it } from 'vitest';
import {
  cooldownReadyLabel,
  defaultTokenAmount,
  isWaitingStatus,
  parseTokenAmount,
  poolActionState,
  tokenAmountValidationReason,
} from './actionRules.js';

const NOW = 1_700_000_000_000;
const base = {
  mode: 'deposit',
  amount: '1',
  available: '10',
  inputToken: 'wstETH',
  assetSymbol: 'wstETH',
  estimatedAssets: '1',
  activeIncidentId: '0',
  availableForWithdraw: '0',
  availableForCooldownAssets: '5',
  inCooldown: '0',
  cooldownEndsAtMilliseconds: 0,
  nowMilliseconds: NOW,
  capacityUncapped: true,
  remainingDepositCapacity: '',
  hasEarnings: true,
};

describe('amount helpers', () => {
  it('defaults only to a positive canonical balance', () => {
    expect(defaultTokenAmount('1,234.5')).toBe('1234.5');
    expect(defaultTokenAmount('0.000')).toBe('');
    expect(defaultTokenAmount('—')).toBe('');
  });

  it('parses exact decimals and rejects extra precision', () => {
    expect(parseTokenAmount('1.5', 6)).toBe(1_500_000n);
    expect(() => parseTokenAmount('1.1234567', 6)).toThrow('Use at most 6 decimal places.');
    expect(() => parseTokenAmount('1e3', 18)).toThrow('Please enter a valid number.');
  });

  it('names the token and action in every validation reason', () => {
    expect(tokenAmountValidationReason('1', '0', 'USDC', 'mint USD8')).toBe('You do not have any USDC available to mint USD8.');
    expect(tokenAmountValidationReason('x', '5', 'USDC', 'mint USD8')).toBe('Enter a valid USDC amount to mint USD8.');
    expect(tokenAmountValidationReason('0', '5', 'USDC', 'mint USD8')).toBe('Enter a USDC amount greater than zero to mint USD8.');
    expect(tokenAmountValidationReason('5.000001', '5', 'USDC', 'mint USD8')).toBe('The USDC amount exceeds your available balance.');
    expect(tokenAmountValidationReason('5', '5', 'USDC', 'mint USD8')).toBe('');
  });

  it('counts down cooldown readiness through minutes, hours and days', () => {
    expect(cooldownReadyLabel(0, NOW)).toBe('');
    expect(cooldownReadyLabel(NOW - 1, NOW)).toBe('ready now');
    expect(cooldownReadyLabel(NOW + 60_000, NOW)).toBe('ready in 1 minute');
    expect(cooldownReadyLabel(NOW + 2 * 3_600_000, NOW)).toBe('ready in 2 hours');
    expect(cooldownReadyLabel(NOW + 36 * 3_600_000, NOW)).toBe('ready in 2 days');
  });

  it('spins only for waiting lifecycle messages', () => {
    expect(isWaitingStatus('Confirm the claim in your wallet.')).toBe(true);
    expect(isWaitingStatus('Transaction submitted: 0xabc…1234')).toBe(true);
    expect(isWaitingStatus('Claim submitted.')).toBe(false);
  });
});

describe('poolActionState', () => {
  it('lets a valid deposit through', () => {
    expect(poolActionState(base).amountUnavailableReason).toBe('');
  });

  it('puts the external blocker ahead of every local rule', () => {
    const state = poolActionState({ ...base, amount: '999', activeIncidentId: '3', submitUnavailableReason: 'A transaction is already in progress.' });
    expect(state.amountUnavailableReason).toBe('A transaction is already in progress.');
  });

  it('blocks deposits during an active incident before amount validation', () => {
    expect(poolActionState({ ...base, amount: '999', activeIncidentId: '3' }).amountUnavailableReason)
      .toBe('Deposits are temporarily unavailable while insurance incident #3 is active. Try again after the incident is finalized.');
  });

  it('reports remaining capacity, then a full pool', () => {
    const capped = { ...base, capacityUncapped: false, amount: '3' };
    expect(poolActionState({ ...capped, remainingDepositCapacity: '2' }).amountUnavailableReason)
      .toBe("This deposit exceeds the cover pool's remaining capacity. You can deposit up to 2 wstETH.");
    expect(poolActionState({ ...capped, remainingDepositCapacity: '0' }).amountUnavailableReason)
      .toBe('The cover pool is full and cannot accept additional wstETH deposits.');
    expect(poolActionState({ ...capped, remainingDepositCapacity: '3' }).amountUnavailableReason).toBe('');
  });

  it('allows only one live withdrawal request', () => {
    const withdraw = { ...base, mode: 'withdraw', inputToken: 'USD8-cp-wstETH' };
    expect(poolActionState({ ...withdraw, inCooldown: '1' }).amountUnavailableReason)
      .toBe('Please finish the existing withdrawal request before starting a new one.');
    expect(poolActionState({ ...withdraw, availableForWithdraw: '1' }).amountUnavailableReason)
      .toBe('Please finish the existing withdrawal request before starting a new one.');
    expect(poolActionState({ ...withdraw, estimatedAssets: null }).amountUnavailableReason)
      .toBe('Waiting for a valid withdrawal estimate.');
    expect(poolActionState({ ...withdraw, availableForCooldownAssets: null }).amountUnavailableReason)
      .toBe('Withdrawal amounts are unavailable. Retry Data to continue.');
  });

  it('keeps amount blockers off completing a matured withdrawal', () => {
    const matured = { ...base, mode: 'withdraw', amount: 'not a number', availableForWithdraw: '1' };
    expect(poolActionState(matured).withdrawUnavailableReason).toBe('');
    expect(poolActionState({ ...matured, availableForWithdraw: '0' }).withdrawUnavailableReason)
      .toBe('No cover-pool withdrawal is available yet.');
  });

  it('holds an elapsed cooldown while an incident is open', () => {
    const state = poolActionState({
      ...base,
      mode: 'withdraw',
      activeIncidentId: '3',
      inCooldown: '1',
      availableForWithdraw: '1',
      cooldownEndsAtMilliseconds: NOW - 1,
    });
    expect(state.cooldownCompleteWaitingForClaims).toBe(true);
    expect(state.cooldownTiming).toBe('');
    expect(state.withdrawUnavailableReason).toBe('Waiting for claims to finish');
  });

  it('shows cooldown timing while the request is maturing', () => {
    const state = poolActionState({ ...base, mode: 'withdraw', inCooldown: '1', cooldownEndsAtMilliseconds: NOW + 90 * 60_000 });
    expect(state.cooldownTiming).toBe('ready in 2 hours');
  });

  it('requires earnings before withdrawing them, without validating an amount', () => {
    const reward = { ...base, mode: 'claimReward', amount: '', available: '0' };
    expect(poolActionState({ ...reward, hasEarnings: false }).amountUnavailableReason).toBe('No earnings to withdraw.');
    expect(poolActionState(reward).amountUnavailableReason).toBe('');
  });
});
