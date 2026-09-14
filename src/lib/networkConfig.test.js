import { describe, expect, it } from 'vitest';
import { getNetwork, getProtocolNetwork } from './networkConfig.js';

describe('network configuration', () => {
  it('maps the wallet chain ID to the Sepolia protocol deployment', () => {
    const network = getProtocolNetwork(11155111);

    expect(network).toMatchObject({ id: 11155111, name: 'Sepolia', protocolAvailable: true });
    expect(network.rpcUrl).toBe('https://rpc.sepolia.ethpandaops.io');
    expect(network.contracts.coverPools.map((pool) => pool.id)).toEqual(['wsteth', 'usd8']);
    expect(network.contracts.coverPools[1]).toEqual({
      id: 'usd8',
      name: 'USD8 Cover Pool',
      address: '0x6388c3826902f7d7812e632d0b63ea44d9c1e5cf',
      asset: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
      assetSymbol: 'USD8',
      shareSymbol: 'USD8-cp-USD8',
      usdOracle: '0xf4aedc595912ce5951c3a0afdd8a61ebb07a8634',
      tint: 'yellow',
    });
    expect(network.payoutAssets).toEqual({
      '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa': {
        symbol: 'wstETH',
        decimals: 18,
      },
      '0xbbd327336d5135e146312dd16f2491c1e6ce8822': {
        symbol: 'mGHO-CP',
        decimals: 18,
      },
      '0xa5b32853235619b5e9af364a40c0c6386dbd6055': {
        symbol: 'USD8',
        decimals: 18,
      },
    });
    expect(network.contracts).toMatchObject({
      registry: '0xb34d92cd05005df36050370433819597a9bac693',
      usdc: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
      usd8: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
      treasury: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
      savingsVault: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
      defiInsurance: '0x4e346ccd0a46d51ebae6810d653791982968d502',
      insuredTokens: {
        usd8: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
        susd8: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
        'aave-sgho': '0x6e5eb99a5923bea10eb3990ec8da84e70007e668',
        'sky-susds': '0x5279e60d104110db53b9d00a54f323e978be3757',
        'test-msloss': '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
      },
    });
  });

  it('recognizes Ethereum without pretending that USD8 contracts are deployed there', () => {
    expect(getNetwork(1)).toMatchObject({
      id: 1,
      name: 'Ethereum',
      protocolAvailable: false,
      scoreAvailable: false,
      rpcUrl: 'https://eth.drpc.org',
    });
    expect(getProtocolNetwork(1)).toBeNull();
  });
});
