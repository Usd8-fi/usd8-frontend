import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '../lib/dataCache.js';

const mocks = vi.hoisted(() => ({ fetchActivity: vi.fn() }));
vi.mock('../lib/activityFeed.js', async importOriginal => ({ ...(await importOriginal()), fetchActivity: mocks.fetchActivity }));
import ActivityTicker from './ActivityTicker.jsx';

const item = (n, extra = {}) => ({
  id: `${n}:mint`, hash: `0x${String(n).padStart(64, '0')}`, block: 11922388, at: Date.now() - 5 * 60_000,
  actor: '0x8ca7…83a7', action: 'minted', amount: '20 USD8', target: null, ...extra,
});
afterEach(() => { queryClient.clear(); mocks.fetchActivity.mockReset(); });

describe('ActivityTicker', () => {
  it('stays hidden until real activity arrives', async () => {
    mocks.fetchActivity.mockResolvedValue([]);
    const { container } = render(<ActivityTicker />);
    await waitFor(() => expect(mocks.fetchActivity).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('stays hidden when the index fails', async () => {
    mocks.fetchActivity.mockRejectedValue(new Error('down'));
    const { container } = render(<ActivityTicker />);
    await waitFor(() => expect(mocks.fetchActivity).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('scrolls the latest actions with links to their transactions', async () => {
    mocks.fetchActivity.mockResolvedValue([item(1), item(2, { actor: null, action: 'incident settled', amount: null, block: null, id: '2:x' })]);
    render(<ActivityTicker />);
    const region = await screen.findByRole('complementary', { name: 'Recent protocol activity' });
    expect(region).toHaveTextContent('0x8ca7…83a7 minted 20 USD8 · block 11922388');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // the looping copy is hidden from assistive tech
    expect(links[0]).toHaveAttribute('href', expect.stringMatching(/\/tx\/0x0{63}1$/));
    expect(region.querySelectorAll('.activity-ticker-copy li')).toHaveLength(2);
  });
});
