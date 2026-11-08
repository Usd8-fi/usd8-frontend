import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGES, resetLanguageForTests, setLanguage } from './i18n.js';
import { tCount } from './plural.js';
import { durationAdjective, durationPhrase } from './durations.js';
import { cooldownReadyLabel, cooldownRemaining, parseTokenAmount, poolActionState, tokenAmountValidationReason } from './actionRules.js';
import { claimLifecycle } from './claimLifecycle.js';
import { RPC_READ_ERROR, readErrorMessage, readErrorText, resourceErrorMessage } from './readErrorMessage.js';
import { settlementPayoutDetails } from './settlement.js';
import { clearClaimHistory, unresolvedHistoricalClaim } from './claimHistory.js';
import { transactionClientFor } from './transactionClient.js';

const DAY = 86_400_000;
const ZERO_ROOT = `0x${'00'.repeat(32)}`;
const NOW = 1_800_000_000_000;
const LOCALES = resolve(process.cwd(), 'src/locales');
const flatten = (node, prefix = '') => Object.entries(node).flatMap(([key, value]) => (
  value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]));
const readLib = (code) => new Map(flatten(JSON.parse(readFileSync(resolve(LOCALES, code, 'lib.json'), 'utf8'))));

const poolState = (overrides = {}) => poolActionState({
  mode: 'withdraw',
  amount: '1',
  available: '5',
  inputToken: 'cwstETH',
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
  hasEarnings: false,
  ...overrides,
});

afterEach(() => { resetLanguageForTests(); localStorage.clear(); });

describe('lib dictionary', () => {
  it('ships lib.json for every language', () => {
    for (const { code } of LANGUAGES) expect(readdirSync(resolve(LOCALES, code))).toContain('lib.json');
  });

  it('writes every plural form each language selects, so no form falls back to English', () => {
    const english = readLib('en');
    const bases = [...new Set([...english.keys()].filter(key => /_other$/.test(key)).map(key => key.replace(/_other$/, '')))];
    const problems = [];
    for (const { code, html } of LANGUAGES) {
      const dictionary = readLib(code);
      for (const base of bases) {
        if (!dictionary.has(`${base}_other`)) problems.push(`${code} ${base}_other`);
        for (const category of new Intl.PluralRules(html).resolvedOptions().pluralCategories) {
          // A form English also lacks falls back to this language's _other.
          if (english.has(`${base}_${category}`) && !dictionary.has(`${base}_${category}`)) problems.push(`${code} ${base}_${category}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('chooses Russian one/few/many forms and falls back to _other', async () => {
    await setLanguage('ru');
    expect(tCount('lib.duration.day', 1)).toBe('1 день');
    expect(tCount('lib.duration.day', 3)).toBe('3 дня');
    expect(tCount('lib.duration.day', 5)).toBe('5 дней');
    expect(tCount('lib.duration.day', 21)).toBe('21 день');
    expect(tCount('lib.duration.day', 1.5)).toBe('1.5 дня');
  });
});

describe('durations', () => {
  it('keeps English and translates with plurals', async () => {
    expect(durationPhrase(604_800)).toBe('7 days');
    expect(durationPhrase(86_400)).toBe('1 day');
    expect(durationAdjective(604_800)).toBe('7-day');
    await setLanguage('de');
    expect(durationPhrase(604_800)).toBe('7 Tagen');
    expect(durationPhrase(86_400)).toBe('1 Tag');
    expect(durationAdjective(604_800)).toBe('7-tägige');
    await setLanguage('ru');
    expect(durationPhrase(300)).toBe('5 минут');
    expect(durationPhrase(60)).toBe('1 минуту');
    expect(durationAdjective(172_800)).toBe('2 дня');
    expect(durationPhrase(null)).toBeNull();
  });
});

describe('cooldown timing', () => {
  it('keeps English labels and translates them', async () => {
    expect(cooldownReadyLabel(NOW + 6 * DAY, NOW)).toBe('ready in 6 days');
    expect(cooldownReadyLabel(NOW - 1, NOW)).toBe('ready now');
    expect(cooldownReadyLabel(NOW + 60_000, NOW)).toBe('ready in 1 minute');
    await setLanguage('zh');
    expect(cooldownReadyLabel(NOW + 6 * DAY, NOW)).toBe('6天后可提取');
    expect(cooldownReadyLabel(NOW - 1, NOW)).toBe('现在可提取');
    expect(cooldownReadyLabel(0, NOW)).toBe('');
  });

  it('reports readiness as a value, independent of language', async () => {
    expect(cooldownRemaining(NOW + 2 * 3_600_000, NOW)).toEqual({ ready: false, count: 2, unit: 'hour' });
    expect(cooldownRemaining(0, NOW)).toBeNull();
    await setLanguage('ja');
    const ready = poolState({ inCooldown: '1', cooldownEndsAtMilliseconds: NOW - 1 });
    expect(ready).toMatchObject({ cooldownReady: true, cooldownTiming: '引き出し可能' });
    const waiting = poolState({ inCooldown: '1', cooldownEndsAtMilliseconds: NOW + 3 * DAY });
    expect(waiting).toMatchObject({ cooldownReady: false, cooldownTiming: 'あと3日で引き出し可能' });
  });
});

describe('amount validation', () => {
  it('keeps English reasons and translates each known action', async () => {
    expect(tokenAmountValidationReason('1', '0', 'USDC', 'mint USD8')).toBe('You do not have any USDC available to mint USD8.');
    expect(tokenAmountValidationReason('x', '5', 'wstETH', 'deposit')).toBe('Enter a valid wstETH amount to deposit.');
    expect(tokenAmountValidationReason('0', '5', 'cwstETH', 'start cooldown')).toBe('Enter a cwstETH amount greater than zero to start cooldown.');
    expect(tokenAmountValidationReason('9', '5', 'USD8', 'redeem USD8')).toBe('The USD8 amount exceeds your available balance.');
    expect(tokenAmountValidationReason('1', '0', 'USD8', 'stake')).toBe('You do not have any USD8 available to stake.');
    expect(() => parseTokenAmount('abc', 18)).toThrow('Please enter a valid number.');
    expect(() => parseTokenAmount('1.123', 2)).toThrow('Use at most 2 decimal places.');
    await setLanguage('es');
    expect(tokenAmountValidationReason('1', '0', 'USDC', 'mint USD8')).toBe('No tienes USDC disponible para acuñar USD8.');
    expect(tokenAmountValidationReason('9', '5', 'USD8', 'redeem USD8')).toBe('La cantidad de USD8 supera tu saldo disponible.');
    await setLanguage('ko');
    expect(() => parseTokenAmount('1.123', 2)).toThrow('소수점 이하는 최대 2자리까지 사용할 수 있습니다.');
  });
});

describe('cover-pool blockers', () => {
  it('keeps English reasons and translates them', async () => {
    const claimsPending = { inCooldown: '1', cooldownEndsAtMilliseconds: NOW - 1, activeIncidentId: '4' };
    expect(poolState(claimsPending).withdrawUnavailableReason).toBe('Waiting for claims to finish');
    expect(poolState({ mode: 'deposit', activeIncidentId: '4' }).amountUnavailableReason)
      .toBe('Deposits are temporarily unavailable while insurance incident #4 is active. Try again after the incident is finalized.');
    expect(poolState({ mode: 'deposit', capacityUncapped: false, remainingDepositCapacity: '0.5' }).amountUnavailableReason)
      .toBe("This deposit exceeds the cover pool's remaining capacity. You can deposit up to 0.5 wstETH.");
    await setLanguage('it');
    expect(poolState(claimsPending).withdrawUnavailableReason).toBe('In attesa che le richieste di risarcimento vengano completate');
    expect(poolState({ mode: 'deposit', capacityUncapped: false, remainingDepositCapacity: '0' }).amountUnavailableReason)
      .toBe('Il Cover Pool è pieno e non può accettare altri depositi di wstETH.');
  });
});

describe('claim lifecycle stage', () => {
  it('keeps the English stage and translates it, with a fixed state id', async () => {
    const incident = { phaseDeadlineMilliseconds: 3 * DAY, phaseWindowMilliseconds: 3 * DAY, root: ZERO_ROOT };
    expect(claimLifecycle(incident, DAY)).toMatchObject({ state: 'claim-open', stage: 'Claim Open' });
    expect(claimLifecycle(incident, 4 * DAY)).toMatchObject({ state: 'settlement-open', stage: 'Settle Open' });
    await setLanguage('ru');
    expect(claimLifecycle(incident, DAY)).toMatchObject({ state: 'claim-open', stage: 'Приём заявок' });
    expect(claimLifecycle(incident, 7 * DAY)).toMatchObject({ state: 'settlement-expired', stage: 'Не урегулировано' });
  });
});

describe('read errors', () => {
  const transportError = { name: 'ContractFunctionExecutionError', cause: { name: 'HttpRequestError' } };

  it('keeps English and shows friendly texts in the current language', async () => {
    expect(readErrorMessage(transportError)).toBe(RPC_READ_ERROR);
    expect(readErrorMessage({})).toBe('Data unavailable');
    await setLanguage('ja');
    expect(readErrorMessage(transportError)).toMatch(/^RPCエラー：/);
    expect(readErrorMessage({})).toBe('データを取得できません');
    // A head failure rethrown as new Error(RPC_READ_ERROR) is translated too.
    expect(readErrorMessage(new Error(RPC_READ_ERROR))).toMatch(/^RPCエラー：/);
    expect(readErrorMessage(new Error('Contract reverted.'))).toBe('Contract reverted.');
  });

  it('stores English markers and still recognizes them after a language switch', async () => {
    await setLanguage('de');
    expect(readErrorText(transportError)).toBe(RPC_READ_ERROR);
    expect(resourceErrorMessage({ pool: RPC_READ_ERROR }, 'fallback')).toMatch(/^RPC-Fehler:/);
    expect(resourceErrorMessage({ pool: 'Contract reverted.' }, 'fallback')).toBe('fallback');
    expect(resourceErrorMessage({}, 'fallback')).toBe('');
  });
});

describe('settlement payout fallback symbol', () => {
  it('keeps English and translates', async () => {
    const asset = '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa';
    expect(settlementPayoutDetails([5n], [asset])[0].symbol).toBe(`base units of ${asset}`);
    expect(settlementPayoutDetails([5n], [])[0].symbol).toBe('base units of unknown asset');
    await setLanguage('es');
    expect(settlementPayoutDetails([5n], [asset])[0].symbol).toBe(`unidades base de ${asset}`);
  });
});

describe('claim history range error', () => {
  it('keeps English and translates', async () => {
    const run = () => unresolvedHistoricalClaim({ key: 'k', account: '0x1', nextIncidentId: 20_000n, readClaimIds: vi.fn(), readClaims: vi.fn() });
    await expect(run()).rejects.toThrow('Claim history exceeds the supported range. Contact support to load this claim.');
    await setLanguage('zh');
    await expect(run()).rejects.toThrow('理赔历史超出支持范围。请联系支持团队加载此理赔。');
    clearClaimHistory();
  });
});

describe('network errors', () => {
  it('keeps English and translates', async () => {
    expect(() => transactionClientFor(424242)).toThrow('USD8 is not deployed on the selected network');
    await setLanguage('ko');
    expect(() => transactionClientFor(424242)).toThrow('선택한 네트워크에는 USD8이 배포되어 있지 않습니다');
  });
});

describe('claim service messages', () => {
  const INSURED_TOKEN = '0x6e5eb99a5923bEA10Eb3990Ec8Da84e70007E668';
  const options = { chainId: 11155111, registry: '0xB34D92cd05005DF36050370433819597a9BaC693', defiInsurance: '0x4E346CcD0a46D51ebaE6810d653791982968d502', pollIntervalMs: 0 };

  async function load() {
    vi.resetModules();
    vi.stubEnv('VITE_CLAIM_API_URL', 'https://claims.example');
    const i18n = await import('./i18n.js');
    const api = await import('./claimApi.js');
    return { i18n, api };
  }

  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('keeps English and translates service responses', async () => {
    const { i18n, api } = await load();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 422 })));
    await expect(api.checkIncidentOpen(INSURED_TOKEN, options)).rejects.toThrow('No qualifying >20% price drop was detected.');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Not Found', { status: 404 })));
    await expect(api.checkIncidentOpen(INSURED_TOKEN, options)).rejects.toThrow('Claim verification request failed (404).');
    await i18n.setLanguage('de');
    await expect(api.checkIncidentOpen(INSURED_TOKEN, options)).rejects.toThrow('Die Anfrage zur Anspruchsprüfung ist fehlgeschlagen (404).');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    await expect(api.checkIncidentOpen(INSURED_TOKEN, options))
      .rejects.toThrow('Der Dienst zur Anspruchsprüfung ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.');
    i18n.resetLanguageForTests();
  });
});
