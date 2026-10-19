import { describe, expect, it } from 'vitest';
import { errorReportingEnabled, isUserRejection, reportError, scrubEvent, shortenHexIdentifiers } from './errorReporting.js';

const ADDRESS = '0xB446b0c85cc4ef5f5Ebf495C4FDD38eCc5284176';
const HASH = `0x${'ab'.repeat(32)}`;

describe('error reporting', () => {
  it('is off outside production builds with a DSN', () => {
    expect(errorReportingEnabled).toBe(false);
    expect(() => reportError(new Error('x'), 'test')).not.toThrow();
  });

  it('shortens wallet addresses and transaction hashes', () => {
    expect(shortenHexIdentifiers(`from ${ADDRESS} tx ${HASH}`)).toBe('from 0xB446…4176 tx 0xabababab…');
    expect(shortenHexIdentifiers('0x1234')).toBe('0x1234');
  });

  it('strips user, IP, headers, cookies and query strings and shortens addresses everywhere', () => {
    const event = scrubEvent({
      user: { ip_address: '1.2.3.4', id: ADDRESS },
      request: { url: `https://usd8.fi/?ref=${ADDRESS}#x`, headers: { cookie: 'a=b' }, cookies: { a: 'b' } },
      exception: { values: [{ type: 'Error', value: `execution reverted for ${ADDRESS}` }] },
      breadcrumbs: [{ category: 'fetch', data: { url: `https://api.example/score/1/${ADDRESS}?refresh=1` } }],
      extra: { nested: { deeper: [ADDRESS] } },
    });
    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({ url: 'https://usd8.fi/' });
    expect(event.exception.values[0].value).toBe('execution reverted for 0xB446…4176');
    expect(event.breadcrumbs[0].data.url).toBe('https://api.example/score/1/0xB446…4176');
    expect(event.extra.nested.deeper[0]).toBe('0xB446…4176');
    expect(JSON.stringify(event)).not.toContain(ADDRESS);
  });

  it('treats wallet rejections as user choices, not errors', () => {
    expect(isUserRejection({ name: 'UserRejectedRequestError' })).toBe(true);
    expect(isUserRejection({ code: 4001 })).toBe(true);
    expect(isUserRejection(new Error('wrapped', { cause: { code: 4001 } }))).toBe(true);
    expect(isUserRejection({ shortMessage: 'User rejected the request.' })).toBe(true);
    expect(isUserRejection(new Error('execution reverted: InsufficientScore'))).toBe(false);
  });
});
