export const poolWriteAbi = [
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }] },
  { type: 'function', name: 'requestRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'completeRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'receiver', type: 'address' }], outputs: [{ name: 'assets', type: 'uint256' }] },
  { type: 'function', name: 'claimReward', stateMutability: 'nonpayable', inputs: [], outputs: [{ name: 'reward', type: 'uint256' }] },
  { type: 'function', name: 'exitRequests', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }, { name: 'exitEpoch', type: 'uint64' }] },
];

export const treasuryWriteAbi = [
  { type: 'function', name: 'mintUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usdcAmount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'redeemUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usd8Amount', type: 'uint256' }, { name: 'minUsdcOut', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'usd8ToUsdcRate', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
];

export const claimWriteAbi = [
  { type: 'error', name: 'FinalizeNotOpen', inputs: [{ name: 'incidentId', type: 'uint256' }] },
  { type: 'error', name: 'InvalidProof', inputs: [{ name: 'claimId', type: 'uint256' }] },
  { type: 'error', name: 'EligibleExceedsEscrow', inputs: [{ name: 'eligibleAmount', type: 'uint256' }, { name: 'escrow', type: 'uint256' }] },
  { type: 'error', name: 'InvalidBoostedScore', inputs: [{ name: 'provided', type: 'uint256' }, { name: 'expected', type: 'uint256' }] },
  { type: 'error', name: 'UnauthorizedClaim', inputs: [{ name: 'claimId', type: 'uint256' }] },
  { type: 'error', name: 'ClaimAlreadyResolved', inputs: [{ name: 'claimId', type: 'uint256' }] },
  { type: 'error', name: 'PayoutCapExceeded', inputs: [{ name: 'poolIndex', type: 'uint256' }, { name: 'requested', type: 'uint256' }, { name: 'cap', type: 'uint256' }] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  { type: 'error', name: 'InvalidReferenceBlock', inputs: [{ name: 'referenceBlock', type: 'uint64' }] },
  { type: 'error', name: 'InsuredTokenNotApproved', inputs: [{ name: 'insuredToken', type: 'address' }] },
  {
    type: 'error', name: 'ClaimWindowClosed',
    inputs: [{ name: 'insuredToken', type: 'address' }, { name: 'claimDeadline', type: 'uint64' }],
  },
  { type: 'error', name: 'DuplicateClaim', inputs: [{ name: 'incidentId', type: 'uint256' }] },
  { type: 'error', name: 'IncidentFinalizing', inputs: [{ name: 'incidentId', type: 'uint256' }] },
  {
    type: 'error', name: 'IncidentTokenMismatch',
    inputs: [
      { name: 'incidentId', type: 'uint256' },
      { name: 'expectedToken', type: 'address' },
      { name: 'suppliedToken', type: 'address' },
    ],
  },
  { type: 'error', name: 'UnexpectedOpenAttestation', inputs: [] },
  { type: 'error', name: 'UnauthorizedOpenSigner', inputs: [{ name: 'recovered', type: 'address' }] },
  { type: 'error', name: 'DefiInsuranceNotRegistered', inputs: [] },
  { type: 'error', name: 'ECDSAInvalidSignatureLength', inputs: [{ name: 'length', type: 'uint256' }] },
  { type: 'error', name: 'SafeERC20FailedOperation', inputs: [{ name: 'token', type: 'address' }] },
  {
    type: 'error', name: 'ERC1155MissingApprovalForAll',
    inputs: [{ name: 'operator', type: 'address' }, { name: 'owner', type: 'address' }],
  },
  { type: 'function', name: 'isInsuredToken', stateMutability: 'view', inputs: [{ name: 'insuredToken', type: 'address' }], outputs: [{ name: 'listed', type: 'bool' }] },
  { type: 'function', name: 'activeIncidentId', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'claimBondAmount', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint128' }] },
  {
    type: 'function',
    name: 'fileClaim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'insuredToken', type: 'address' },
      { name: 'insuredTokenAmount', type: 'uint128' },
      { name: 'scoreToSpend', type: 'uint256' },
      { name: 'boosterAmount', type: 'uint256' },
      { name: 'referenceBlock', type: 'uint64' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'claimId', type: 'uint256' }],
  },
  { type: 'function', name: 'cancelClaim', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  {
    type: 'function', name: 'settleIncident', stateMutability: 'nonpayable',
    inputs: [{ name: 'root', type: 'bytes32' }, { name: 'poolPayouts', type: 'uint256[]' }, { name: 'signature', type: 'bytes' }], outputs: [],
  },
  {
    type: 'function', name: 'finalizeClaim', stateMutability: 'nonpayable',
    inputs: [
      { name: 'claimId', type: 'uint256' }, { name: 'acceptPayout', type: 'bool' },
      { name: 'amounts', type: 'uint256[]' }, { name: 'scoreSpent', type: 'uint256' },
      { name: 'boostedScore', type: 'uint256' }, { name: 'eligibleAmount', type: 'uint256' },
      { name: 'eligibleBoosterAmount', type: 'uint256' },
      { name: 'proof', type: 'bytes32[]' },
    ], outputs: [],
  },
];
