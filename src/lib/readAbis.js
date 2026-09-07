import { erc20Abi } from './abis.js';
export const poolAbi = [
  ...erc20Abi,
  {
    type: 'function',
    name: 'asset',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'totalAssets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositCap',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'convertToAssets',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'earned',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rewardRate',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'periodFinish',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'exitRequests',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }, { name: 'exitEpoch', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'exitEpochs',
    stateMutability: 'view',
    inputs: [{ name: 'exitEpoch', type: 'uint64' }],
    outputs: [
      { name: 'totalShares', type: 'uint256' },
      { name: 'totalAssets', type: 'uint256' },
      { name: 'remainingShares', type: 'uint256' },
      { name: 'remainingAssets', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'assets', type: 'uint256' },
      { indexed: false, name: 'shares', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ExitEpochSettled',
    inputs: [
      { indexed: true, name: 'exitEpoch', type: 'uint64' },
      { indexed: false, name: 'shares', type: 'uint256' },
      { indexed: false, name: 'assets', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimPaid',
    inputs: [
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'RewardNotified',
    inputs: [
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'newRate', type: 'uint128' },
      { indexed: false, name: 'newPeriodFinish', type: 'uint64' },
    ],
  },
];

export const defiInsuranceAbi = [
  { type: 'function', name: 'settlementParams', stateMutability: 'view', inputs: [], outputs: [
    { name: 'twapLookbackBlocks', type: 'uint64' },
    { name: 'minHoldingRequired', type: 'uint64' },
    { name: 'sampleStepBlocks', type: 'uint64' },
  ] },
  { type: 'function', name: 'claimBondAmount', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'MAX_CLAIMANT_COVERAGE_BPS',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getInsuredToken',
    stateMutability: 'view',
    inputs: [{ name: 'insuredToken', type: 'address' }],
    outputs: [{
      name: 'config',
      type: 'tuple',
      components: [
        { name: 'maxCoverageBps', type: 'uint16' },
        { name: 'underlyingPriceOracle', type: 'address' },
        { name: 'underlyingConversionAddress', type: 'address' },
        { name: 'underlyingConversionCallData', type: 'bytes' },
      ],
    }],
  },
  {
    type: 'function',
    name: 'activeIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nextIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'incidents',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [
      { name: 'insuredToken', type: 'address' },
      { name: 'resolvedAt', type: 'uint64' },
      { name: 'referenceBlock', type: 'uint64' },
      { name: 'openBlock', type: 'uint64' },
      { name: 'phaseDeadline', type: 'uint64' },
      { name: 'root', type: 'bytes32' },
      { name: 'unresolvedClaims', type: 'uint256' },
      { name: 'claimSetHash', type: 'bytes32' },
      { name: 'teePcrHash', type: 'bytes32' },
    ],
  },
  {
    type: 'function',
    name: 'incidentPhaseWindow',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [{ name: 'phaseWindow', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'incidentPools',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [{ name: 'pools', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'claimIdByIncidentAndUser',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }, { name: 'account', type: 'address' }],
    outputs: [{ name: 'claimId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claims',
    stateMutability: 'view',
    inputs: [{ name: 'claimId', type: 'uint256' }],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'incidentId', type: 'uint64' },
      { name: 'insuredTokenAmount', type: 'uint128' },
      { name: 'boosterAmount', type: 'uint128' },
      { name: 'bondAmount', type: 'uint128' },
      { name: 'resolved', type: 'bool' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimRegistered',
    inputs: [
      { indexed: true, name: 'claimId', type: 'uint256' },
      { indexed: true, name: 'incidentId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'insuredTokenAmount', type: 'uint128' },
      { indexed: false, name: 'scoreToSpend', type: 'uint256' },
      { indexed: false, name: 'boosterAmount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimCancelled',
    inputs: [
      { indexed: true, name: 'claimId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
    ],
  },
];
export const claimRegisteredEvent = defiInsuranceAbi.find((item) => item.type === 'event' && item.name === 'ClaimRegistered');
export const claimCancelledEvent = defiInsuranceAbi.find((item) => item.type === 'event' && item.name === 'ClaimCancelled');

export const priceOracleAbi = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'latestRoundData',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
  },
];
