export function mergeSnapshot(current, next) {
  const sameBalances = current.scoreBalances?.usd8 === next.scoreBalances?.usd8
    && current.scoreBalances?.savings === next.scoreBalances?.savings;
  return { ...next,
    pools: next.pools.map(pool => ({ ...pool, apy: pool.apy ?? current.pools?.find(old => old.id === pool.id)?.apy ?? null })),
    ...(sameBalances && current.scoreBalanceChangeTimestampMilliseconds ? {
      scoreBalanceChangeTimestampMilliseconds: current.scoreBalanceChangeTimestampMilliseconds,
    } : {}),
  };
}
