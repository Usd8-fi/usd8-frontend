import { formatUnits, parseUnits } from 'viem';

// Settled exits use their reserved receipt, never the pool's later exchange rate.
export function exitAssetAmount(shares, epoch, estimatedAssets) {
  const [totalShares, totalAssets, remainingShares, remainingAssets] = epoch;
  if (remainingShares === 0n) return estimatedAssets;
  if (shares === remainingShares) return remainingAssets;
  return totalAssets * shares / totalShares;
}

// SingleAssetCoverPool uses ERC-4626 virtual assets and shares (18 asset decimals).
export function poolRedemptionQuote(rawShares, snapshot, shareDecimals = 21) {
  const amount = String(rawShares ?? '').trim();
  if (!snapshot || !Number.isInteger(shareDecimals) || shareDecimals < 18 || shareDecimals > 36
      || !/^(?:\d+\.?\d*|\.\d+)$/.test(amount)
      || (amount.split('.')[1] || '').length > shareDecimals) return null;
  try {
    const shares = parseUnits(amount, shareDecimals);
    const assets = BigInt(snapshot.totalAssets);
    const supply = BigInt(snapshot.totalSupply);
    if (assets < 0n || supply < 0n || shares > supply) return null;
    // The final exit receives all remaining active assets, including rounding dust.
    const value = shares === supply && shares > 0n ? assets
      : shares * (assets + 1n) / (supply + 10n ** BigInt(shareDecimals - 18));
    return formatUnits(value, 18);
  } catch { return null; }
}
