import { useEffect, useMemo, useState } from 'react';
import { readClientFor } from '../lib/chainData.js';
import { simulateClaimPayout } from '../lib/claimSimulation.js';
import { PROTOCOL_CHAIN_ID, getProtocolNetwork } from '../lib/networkConfig.js';
import { formatUnits, parseUnits, readContract } from '../lib/viemLite.js';
import InfoTooltip from './InfoTooltip.jsx';
import { useDialogFocus } from './useDialogFocus.js';

const DEFAULT_PAYOUT_BPS = 5000;
const DEFAULT_FEE_SHARE_BPS = 2000;
const registryPayoutAbi = [
  { type: 'function', name: 'maxCoverPoolPayoutBps', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'protocolFeeConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'receiver', type: 'address' },
        { name: 'claimProtocolFeeShareBps', type: 'uint16' },
        { name: 'reserveYieldFeeBps', type: 'uint16' },
      ],
    }],
  },
];

function cleanDecimal(value) {
  const cleaned = String(value ?? '').replace(/,/g, '').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
}

function toWad(value) {
  try {
    const cleaned = cleanDecimal(value);
    return cleaned && cleaned !== '.' ? parseUnits(cleaned, 18) : 0n;
  } catch {
    return 0n;
  }
}

function plainNumber(value) {
  const parsed = Number(cleanDecimal(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(wad) {
  const value = Number(formatUnits(wad, 18));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAmount(units, decimals) {
  const value = Number(formatUnits(units, decimals));
  if (value === 0) return '0';
  const digits = value >= 1 ? 4 : 6;
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
}

function SliderField({ id, label, help, value, onChange, max, step, prefix = '', suffix = '' }) {
  const numeric = plainNumber(value);
  return (
    <div className="claim-simulator-field">
      <span className="metric-label-with-help">
        <label htmlFor={id}>{label}</label>
        {help ? <InfoTooltip ariaLabel={`About ${label.toLowerCase()}`} floating>{help}</InfoTooltip> : null}
      </span>
      <div className="claim-simulator-input-row">
        <input
          className="claim-simulator-range"
          type="range"
          min="0"
          max={Math.max(max, numeric)}
          step={step}
          value={Math.min(numeric, Math.max(max, numeric))}
          aria-label={`${label} slider`}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="claim-simulator-number">
          {prefix ? <span aria-hidden="true">{prefix}</span> : null}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(event) => onChange(cleanDecimal(event.target.value))}
          />
          {suffix ? <span aria-hidden="true">{suffix}</span> : null}
        </span>
      </div>
    </div>
  );
}

export default function SimulateClaimDialog({
  onClose,
  insuredTokens = [],
  pools = [],
}) {
  const dialogRef = useDialogFocus(onClose);
  const [claimedValue, setClaimedValue] = useState('10000');
  const [weight, setWeight] = useState('20');
  const [params, setParams] = useState({ payoutBps: DEFAULT_PAYOUT_BPS, feeShareBps: DEFAULT_FEE_SHARE_BPS, live: false });

  useEffect(() => {
    const network = getProtocolNetwork(PROTOCOL_CHAIN_ID);
    if (!network) return undefined;
    let cancelled = false;
    const client = readClientFor(network.id);
    Promise.all([
      readContract(client, { address: network.contracts.registry, abi: registryPayoutAbi, functionName: 'maxCoverPoolPayoutBps' }),
      readContract(client, { address: network.contracts.registry, abi: registryPayoutAbi, functionName: 'protocolFeeConfig' }),
    ]).then(([payoutBps, feeConfig]) => {
      if (!cancelled) {
        setParams({ payoutBps: Number(payoutBps), feeShareBps: Number(feeConfig.claimProtocolFeeShareBps), live: true });
      }
    }).catch(() => { /* keep protocol defaults; labelled below */ });
    return () => { cancelled = true; };
  }, []);

  // Coverage is a per-token setting; every listed token currently uses the same value.
  const coverageBps = insuredTokens[0]?.maxCoverageBps ?? 8000;
  const poolInputs = useMemo(() => pools.filter((pool) => pool.balance > 0n && pool.price > 0n), [pools]);
  const weightPercent = Math.min(100, plainNumber(weight));

  const result = useMemo(() => {
    // Your weight is your boosted score over everyone's boosted score; model it as
    // weight% for you and the remainder for all other claimants.
    const yours = toWad(String(weightPercent));
    return simulateClaimPayout({
      claimedValueUsd: toWad(claimedValue),
      coverageBps,
      scoreToSpend: yours,
      othersBoostedScore: toWad('100') - yours,
      pools: poolInputs,
      maxCoverPoolPayoutBps: params.payoutBps,
      protocolFeeShareBps: params.feeShareBps,
    });
  }, [claimedValue, coverageBps, weightPercent, poolInputs, params]);

  // Slider tops out ~20% above the live claimant budget; typing a larger value still works.
  const claimantBudgetNumber = Number(formatUnits(result.claimantBudgetUsd, 18));
  const claimedMax = Math.max(1_000, Math.ceil((claimantBudgetNumber * 1.2) / 100) * 100);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="usd8-dialog claim-simulator-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Simulate Claim"
      >
        <button className="app-dialog-close" type="button" aria-label="Close claim simulator" onClick={onClose}>×</button>
        <h2 className="file-claim-title"><span>Simulate Claim</span></h2>
        <p className="file-claim-requirement">
          Estimate your reimbursement using live cover pool sizes and prices. Settlement recalculates
          everything in the TEE, so the final payout may differ.
        </p>

        <div className="claim-simulator-layout">
          <div className="claim-simulator-inputs">
            <SliderField
              id="claim-simulator-value"
              label="Loss Value (USD)"
              help="Value of the insured tokens you claim for, at the 7-day average price before the drop. The loss cap is a percentage of this value."
              value={claimedValue}
              onChange={setClaimedValue}
              max={claimedMax}
              step={claimedMax / 1000}
              prefix="$"
            />
            <SliderField
              id="claim-simulator-weight"
              label="Your Score Weight"
              help="Your insurance score, including boosters, as a share of all claimants' scores in the same incident."
              value={weight}
              onChange={(value) => setWeight(plainNumber(value) > 100 ? '100' : value)}
              max={100}
              step={0.1}
              suffix="%"
            />
          </div>

          <div className="claim-simulator-results" aria-live="polite">
            <div className="claim-simulator-headline">
              <span>Estimated Reimbursement</span>
              <strong>{formatUsd(result.payoutUsd)}</strong>
            </div>

            <dl className="claim-simulator-breakdown">
              <div><dt>Cover Pool Budget</dt><dd>{formatUsd(result.claimantBudgetUsd)}</dd></div>
              <div><dt>A. Score Share ({weightPercent.toLocaleString('en-US', { maximumFractionDigits: 2 })}%)</dt><dd>{formatUsd(result.entitlementUsd)}</dd></div>
              <div><dt>B. Loss Cap ({coverageBps / 100}%)</dt><dd>{formatUsd(result.capUsd)}</dd></div>
              <div className="claim-simulator-breakdown-total"><dt>Payout = min(A, B)</dt><dd>{formatUsd(result.payoutUsd)}</dd></div>
            </dl>

            <div className="claim-simulator-tokens">
              <span>Paid From Cover Pools</span>
              {result.payouts.length ? (
                <ul>
                  {result.payouts.map((payout) => (
                    <li key={payout.id}>
                      <span>{formatAmount(payout.amount, payout.assetDecimals)} {payout.symbol}</span>
                      <span>{formatUsd(payout.usd)}</span>
                    </li>
                  ))}
                </ul>
              ) : <small>No cover pool data yet.</small>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
