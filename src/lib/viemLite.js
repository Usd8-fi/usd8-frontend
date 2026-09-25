// Read-path viem imports for the public (no-wallet) page, by module file.
//
// Importing anything from the `viem` barrel makes the bundler attribute the
// barrel's whole re-export graph — signatures, secp256k1, CCIP, ENS, wallet
// actions — to the public entry, which then preloads ~40 KB gzip of code only
// the wallet runtime uses. Each name below comes from its own module so only the
// read path ships. `viem-esm` is a Vite alias for viem's ESM build; a viem
// upgrade that moves a file fails the build and tests loudly rather than
// silently re-growing the bundle.
export { zeroAddress } from 'viem-esm/constants/address.js';
export { formatUnits } from 'viem-esm/utils/unit/formatUnits.js';
export { parseUnits } from 'viem-esm/utils/unit/parseUnits.js';
export { http } from 'viem-esm/clients/transports/http.js';
export { createClient } from 'viem-esm/clients/createClient.js';
export { getBlock } from 'viem-esm/actions/public/getBlock.js';
export { getBlockNumber } from 'viem-esm/actions/public/getBlockNumber.js';
export { getLogs } from 'viem-esm/actions/public/getLogs.js';
export { multicall } from 'viem-esm/actions/public/multicall.js';
export { readContract } from 'viem-esm/actions/public/readContract.js';
export { mainnet } from 'viem-esm/chains/definitions/mainnet.js';
export { sepolia } from 'viem-esm/chains/definitions/sepolia.js';
