import { describe, expect, it } from 'vitest';
import { HttpRequestError, TimeoutError } from 'viem';
import { RPC_READ_ERROR, readErrorMessage, resourceErrorMessage } from './readErrorMessage.js';

describe('read error messages', () => {
  it('recognizes timeout and HTTP provider failures without exposing URLs or payloads', () => {
    for (const error of [new TimeoutError({ url: 'https://rpc.example/secret' }), new HttpRequestError({ url: 'https://rpc.example/secret', status: 503 })]) {
      expect(readErrorMessage({ name: 'ContractFunctionExecutionError', cause: error })).toBe(RPC_READ_ERROR);
    }
  });
  it('preserves contract and validation errors rather than blaming the RPC connection', () => {
    expect(readErrorMessage({ name: 'ContractFunctionRevertedError', shortMessage: 'Contract reverted.' })).toBe('Contract reverted.');
    expect(readErrorMessage(new Error('Block number unavailable.'))).toBe('Block number unavailable.');
    expect(readErrorMessage(new DOMException('Request aborted', 'AbortError'))).toBe('Request aborted');
  });
  it('bounds cause traversal even for a cyclic error', () => {
    const error = new Error('Read failed'); error.cause = error;
    expect(readErrorMessage(error)).toBe('Read failed');
  });
  it('prioritizes RPC notices for partial failures and retains generic notices for other failures', () => {
    expect(resourceErrorMessage({ pool: RPC_READ_ERROR }, 'Some data is unavailable.')).toBe(RPC_READ_ERROR);
    expect(resourceErrorMessage({ pool: 'Contract reverted.' }, 'Some data is unavailable.')).toBe('Some data is unavailable.');
    expect(resourceErrorMessage({}, 'Some data is unavailable.')).toBe('');
  });
});
