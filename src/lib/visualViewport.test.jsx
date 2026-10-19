import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { layoutViewportHeight, useStickToVisualBottom, visualBottomOffset } from './visualViewport.js';

describe('visualBottomOffset', () => {
  it('is zero when the visible area matches the layout viewport', () => {
    expect(visualBottomOffset({ offsetTop: 0, height: 900, scale: 1 }, 900)).toBe(0);
  });

  it('moves the bar down by the space a collapsed toolbar uncovers', () => {
    // iPad Firefox: the toolbar collapsed, the visible area grew 74px but the layout viewport did not.
    expect(visualBottomOffset({ offsetTop: 0, height: 974, scale: 1 }, 900)).toBe(74);
  });

  it('moves the bar up when the visible area ends above the layout bottom', () => {
    expect(visualBottomOffset({ offsetTop: 10, height: 600, scale: 1 }, 900)).toBe(-290);
  });

  it('leaves pinch-zoom and missing data alone', () => {
    expect(visualBottomOffset({ offsetTop: 200, height: 450, scale: 2 }, 900)).toBe(0);
    expect(visualBottomOffset(null, 900)).toBe(0);
    expect(visualBottomOffset({ offsetTop: 0, height: 900, scale: 1 }, 0)).toBe(0);
  });
});

describe('layoutViewportHeight', () => {
  it('ignores a classic horizontal scrollbar so it does not lift the bar', () => {
    // macOS "always show scroll bars": innerHeight 900 includes a 15px horizontal
    // scrollbar; the visual viewport and the root's client height are 885.
    const layoutHeight = layoutViewportHeight({ innerHeight: 900, clientHeight: 885, classicScrollbars: true });
    expect(layoutHeight).toBe(885);
    expect(visualBottomOffset({ offsetTop: 0, height: 885, scale: 1 }, layoutHeight)).toBe(0);
    // The old comparison against innerHeight lifted the bar by the scrollbar.
    expect(visualBottomOffset({ offsetTop: 0, height: 885, scale: 1 }, 900)).toBe(-15);
  });

  it('keeps innerHeight on overlay-scrollbar devices so toolbar collapse still works', () => {
    expect(layoutViewportHeight({ innerHeight: 900, clientHeight: 826, classicScrollbars: false })).toBe(900);
  });

  it('falls back to innerHeight when the client height is unavailable', () => {
    expect(layoutViewportHeight({ innerHeight: 900, clientHeight: 0, classicScrollbars: true })).toBe(900);
  });
});

function Bar({ active = true }) {
  const ref = useRef(null);
  useStickToVisualBottom(ref, active);
  return active ? <aside ref={ref} data-testid="bar" /> : null;
}

describe('useStickToVisualBottom', () => {
  const original = window.visualViewport;
  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: original });
    vi.restoreAllMocks();
  });

  it('publishes the offset on the element and follows viewport changes', () => {
    const listeners = {};
    const viewport = {
      offsetTop: 0, height: window.innerHeight, scale: 1,
      addEventListener: (type, fn) => { listeners[type] = fn; },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { fn(); return 1; });
    const { getByTestId, unmount } = render(<Bar />);
    const bar = getByTestId('bar');
    expect(bar.style.getPropertyValue('--visual-bottom-offset')).toBe('0px');
    viewport.height = window.innerHeight + 74;
    act(() => listeners.resize());
    expect(bar.style.getPropertyValue('--visual-bottom-offset')).toBe('74px');
    unmount();
    expect(viewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('does nothing without visualViewport', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    const { getByTestId } = render(<Bar />);
    expect(getByTestId('bar').style.getPropertyValue('--visual-bottom-offset')).toBe('');
  });
});
