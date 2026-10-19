// Settlement payout display and topology checks for incident finalization.
import { groupDecimalString } from './units.js';

function formattedPayoutAmount(amount, decimals) {
  const displayedDecimals = Math.min(decimals, 4);
  const discardedScale = 10n ** BigInt(decimals - displayedDecimals);
  const rounded = discardedScale === 1n
    ? amount
    : (amount + discardedScale / 2n) / discardedScale;
  const displayedScale = 10n ** BigInt(displayedDecimals);
  const whole = rounded / displayedScale;
  const fraction = String(rounded % displayedScale)
    .padStart(displayedDecimals, '0')
    .replace(/0+$/, '');
  return fraction ? `${groupDecimalString(whole)}.${fraction}` : groupDecimalString(whole);
}

export function settlementPayoutDetails(amounts, poolOrder, payoutAssets = {}) {
  return amounts.map((amount, index) => {
    const asset = poolOrder[index];
    const metadata = payoutAssets[asset?.toLowerCase()];
    return {
      amount: metadata
        ? formattedPayoutAmount(amount, metadata.decimals)
        : groupDecimalString(amount),
      symbol: metadata?.symbol || `base units of ${asset || 'unknown asset'}`,
      usd: '',
    };
  });
}

export function normalizedAddressOrder(addresses) {
  return Array.isArray(addresses) ? addresses.map((address) => String(address).toLowerCase()) : [];
}

export function matchesSettlementTopology(settlement, incident) {
  const settlementPools = normalizedAddressOrder(settlement?.poolAddrs);
  const settlementAssets = normalizedAddressOrder(settlement?.poolOrder);
  const incidentPools = normalizedAddressOrder(incident?.poolAddrs);
  const incidentAssets = normalizedAddressOrder(incident?.poolOrder);
  return incidentPools.length > 0
    && incidentAssets.length === incidentPools.length
    && settlementPools.length === incidentPools.length
    && settlementAssets.length === incidentAssets.length
    && settlementPools.every((address, index) => address === incidentPools[index])
    && settlementAssets.every((address, index) => address === incidentAssets[index]);
}
