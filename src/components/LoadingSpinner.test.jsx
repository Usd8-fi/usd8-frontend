import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricValue } from './LoadingSpinner.jsx';

// Browser translation (Chrome / Google Translate) replaces text nodes with its own
// <font> elements. A bare text node rendered next to a spinner then makes React's
// next update call removeChild on a node that is gone (Sentry USD8-FRONTEND-3).
function translateTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (node.parentElement?.closest('[translate="no"]')) continue;
    const font = document.createElement('font');
    font.textContent = node.textContent;
    node.replaceWith(font);
  }
}

describe('MetricValue under browser translation', () => {
  it('marks values translate="no" so a translated page can switch to the spinner and back', () => {
    const { container, rerender } = render(<strong><MetricValue value="12.5" label="Loading" /></strong>);
    expect(screen.getByText('12.5')).toHaveAttribute('translate', 'no');
    translateTextNodes(container);
    expect(() => rerender(<strong><MetricValue loading value={null} label="Loading" /></strong>)).not.toThrow();
    expect(() => rerender(<strong><MetricValue value="13.0" label="Loading" /></strong>)).not.toThrow();
    expect(container.textContent).toBe('13.0');
  });
});
