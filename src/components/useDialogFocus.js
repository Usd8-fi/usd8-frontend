import { useEffect, useRef } from 'react';

export function useDialogFocus(onClose) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const focusable = () => [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    (focusable()[0] || dialog).focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0] || dialog;
      const last = elements.at(-1) || dialog;
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const retainFocus = event => { if (!dialog.contains(event.target)) (focusable()[0] || dialog).focus(); };
    document.addEventListener('keydown', keydown);
    document.addEventListener('focusin', retainFocus);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('focusin', retainFocus);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return ref;
}
