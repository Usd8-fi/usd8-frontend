import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SiteNotice from './SiteNotice.jsx';

describe('private beta notice', () => {
  it('announces the beta terms and links the Telegram group', () => {
    render(<SiteNotice />);
    const notice = screen.getByRole('complementary', { name: 'Private beta notice' });
    expect(notice).toHaveTextContent('Welcome to the USD8 Private Beta.');
    expect(notice).toHaveTextContent('300% boosted insurance score rate on USD8 holdings');
    expect(notice).toHaveTextContent('and will receive 3 boosters at the end.');
    expect(notice).toHaveTextContent('Feedback or problems? Please post in our Telegram group.');
    expect(screen.getByRole('link', { name: 'Telegram group' })).toHaveAttribute('href', 'https://t.me/+e84i2oYk1ao1MTk1');
    // Only the group: no personal contact in the public notice.
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(notice).not.toHaveTextContent('@');
    for (const link of screen.getAllByRole('link')) expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
