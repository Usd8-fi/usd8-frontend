import { Actions } from 'viem/tempo';
// Wagmi core 3.5 calls this API. Newer Viem versions removed it; fail CI
// explicitly instead of allowing an undefined import into the wallet build.
if (typeof Actions.zone.getDepositStatus !== 'function') throw new Error('The locked Viem version is incompatible with Wagmi core zone actions.');
console.log('Wallet dependency compatibility passed.');
