import { useEffect } from 'react';

/// How far the visible area's bottom edge sits below (positive) or above
/// (negative) the layout viewport's bottom edge, in CSS pixels.
///
/// A `position: fixed; bottom: 0` bar is anchored to the layout viewport. Some
/// mobile browsers (Firefox and Chrome on iPad/iPhone) collapse their toolbar
/// while scrolling without resizing the layout viewport, so the visible area
/// grows below the bar and the page shows through a gap underneath it.
/// Pinch-zoom is left alone: the bar then stays where the browser puts it.
export function visualBottomOffset(viewport, layoutHeight) {
  if (!viewport || !Number.isFinite(layoutHeight) || layoutHeight <= 0) return 0;
  if (Math.abs((viewport.scale ?? 1) - 1) > 0.01) return 0;
  const offset = Math.round(viewport.offsetTop + viewport.height - layoutHeight);
  return Number.isFinite(offset) ? offset : 0;
}

/// Height of the layout viewport the fixed bar is anchored to, in CSS pixels.
///
/// With classic (always-visible) scrollbars, as on Windows or macOS set to
/// "always show scroll bars", `innerHeight` includes a horizontal scrollbar that
/// the visual viewport excludes; comparing the two would lift the bar by the
/// scrollbar's height. There the root element's client height is the right
/// measure. Overlay-scrollbar platforms (phones, tablets) keep `innerHeight`,
/// which is what tracks their collapsing toolbars.
export function layoutViewportHeight({ innerHeight, clientHeight, classicScrollbars }) {
  return classicScrollbars && clientHeight > 0 ? clientHeight : innerHeight;
}

let classicScrollbarsCache = null;

/// Whether this browser draws scrollbars that take up layout space.
function hasClassicScrollbars() {
  if (classicScrollbarsCache !== null) return classicScrollbarsCache;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden';
  document.body.appendChild(probe);
  classicScrollbarsCache = probe.offsetWidth - probe.clientWidth > 0;
  probe.remove();
  return classicScrollbarsCache;
}

/// Keeps a bottom-fixed element on the visible bottom edge by publishing the
/// offset as the CSS variable `--visual-bottom-offset` on that element.
/// `active` re-attaches once the element is actually rendered.
export function useStickToVisualBottom(ref, active = true) {
  useEffect(() => {
    const viewport = window.visualViewport;
    const element = ref.current;
    if (!active || !viewport || !element) return undefined;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const layoutHeight = layoutViewportHeight({
        innerHeight: window.innerHeight,
        clientHeight: document.documentElement.clientHeight,
        classicScrollbars: hasClassicScrollbars(),
      });
      element.style.setProperty('--visual-bottom-offset', `${visualBottomOffset(viewport, layoutHeight)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };
    apply();
    viewport.addEventListener('resize', schedule);
    viewport.addEventListener('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, active]);
}
