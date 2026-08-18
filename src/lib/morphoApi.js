export const MORPHO_API_URL = 'https://api.morpho.org/graphql';
export const MORPHO_VAULT_ADDRESS = (
  import.meta.env.VITE_MORPHO_VAULT_ADDRESS
  || '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB'
);
export const MORPHO_VAULT_URL = `https://app.morpho.org/ethereum/vault/${MORPHO_VAULT_ADDRESS}`;

const MORPHO_CHAIN_ID = 1;
const VAULT_QUERY = `
  query VaultByAddress($address: String!, $chainId: Int!) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      name
      asset { symbol decimals }
      state { netApy totalAssets }
    }
  }
`;

function formatCompactBalance(totalAssets, decimals) {
  const balance = Number(totalAssets) / (10 ** Number(decimals));
  if (!Number.isFinite(balance)) throw new Error('Morpho API returned an invalid vault balance');

  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  }
  if (balance >= 1_000) {
    return `${(balance / 1_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}K`;
  }
  return balance.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function formatApy(netApy) {
  const apy = Number(netApy) * 100;
  if (!Number.isFinite(apy)) throw new Error('Morpho API returned an invalid net APY');
  return `${apy.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export async function fetchMorphoVault({ signal } = {}) {
  const response = await fetch(MORPHO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: VAULT_QUERY,
      variables: { address: MORPHO_VAULT_ADDRESS, chainId: MORPHO_CHAIN_ID },
    }),
    signal,
  });

  if (!response.ok) throw new Error(`Morpho API request failed (${response.status})`);

  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message || 'Morpho API query failed');

  const vault = payload.data?.vaultByAddress;
  if (!vault) throw new Error('Morpho API did not return the configured vault');
  if (vault.address?.toLowerCase() !== MORPHO_VAULT_ADDRESS.toLowerCase()) {
    throw new Error('Morpho API returned a different vault');
  }

  return {
    address: vault.address,
    name: vault.name,
    balance: `$${formatCompactBalance(vault.state?.totalAssets, vault.asset?.decimals)}`,
    apy: formatApy(vault.state?.netApy),
  };
}
