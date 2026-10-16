import { describe, expect, it } from 'vitest';
import { getNetwork, getProtocolNetwork } from './networkConfig.js';

describe('network configuration', () => {
  it('maps the wallet chain ID to the Sepolia protocol deployment', () => {
    const network = getProtocolNetwork(11155111);

    expect(network).toMatchObject({ id: 11155111, name: 'Sepolia', protocolAvailable: true });
    expect(network.rpcUrl).toBe('https://rpc.sepolia.ethpandaops.io');
    expect(network.contracts.coverPools.map((pool) => pool.id)).toEqual(['wsteth']);
    expect(network.contracts.coverPools[0]).toEqual({
      id: 'wsteth',
      name: 'wstEth Cover Pool',
      address: '0x4bf47e25e8b42579c5cbaf84edaefb1a0f30c1b8',
      asset: '0x0539fcd774c5351da3c1d8efd64d4511f46662df',
      assetSymbol: 'wstETH',
      shareSymbol: 'USD8-cp-wstETH',
      usdOracle: '0x6ae3bb0897f0b15e175ba96ba0aaa55ccb719a05',
      deployBlock: 11915276,
    });
    expect(network.payoutAssets).toMatchObject({
      '0x0539fcd774c5351da3c1d8efd64d4511f46662df': { symbol: 'wstETH', decimals: 18 },
      '0x2fe01f5e235eeab9045066f873f531de20f31947': { symbol: 'USD8', decimals: 18 },
    });
    expect(network.contracts).toMatchObject({
      registry: '0x9bff24a44bb20f8d1f1de86eca56295c5bb46430',
      usdc: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
      treasury: '0x0eae2d44dfeb2154f60cd702dc2c9c5abb090f05',
      savingsVault: null,
      defiInsurance: '0xac1a522d0fdc1c39d455d1688ad54615de5b48b9',
      insuredTokens: {
        usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
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
