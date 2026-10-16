export function mergeSnapshot(current, next) {
  const sameBalances = current.scoreBalances?.usd8 === next.scoreBalances?.usd8
    && current.scoreBalances?.savings === next.scoreBalances?.savings;
  return { ...next,
    pools: next.pools.map((pool) => {
      const old = current.pools?.find((entry) => entry.id === pool.id);
      return { ...pool, apy: pool.apy ?? old?.apy ?? null, apyWindowSeconds: pool.apyWindowSeconds ?? old?.apyWindowSeconds ?? null,
        apy7d: pool.apy7d ?? old?.apy7d ?? null, apy7dWindowSeconds: pool.apy7dWindowSeconds ?? old?.apy7dWindowSeconds ?? null };
    }),
    ...(sameBalances && current.scoreBalanceChangeTimestampMilliseconds ? {
      scoreBalanceChangeTimestampMilliseconds: current.scoreBalanceChangeTimestampMilliseconds,
    } : {}),
  };
}
