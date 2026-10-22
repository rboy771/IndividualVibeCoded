import { useEffect, useRef } from 'react';

/**
 * useFocusTrap hook
 * Traps keyboard focus within an active modal dialog container.
 * When Tab reaches the end, loops to the start; when Shift+Tab reaches the start, loops to the end.
 * Automatically focuses the first focusable element or an element matching initialFocusSelector.
 * Restores focus to the triggering element upon unmounting/closing.
 */
export function useFocusTrap(isActive, options = {}) {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save current active element to restore upon close
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () => {
      if (!container) return [];
      return Array.from(container.querySelectorAll(focusableSelectors)).filter(
        (el) => el.offsetParent !== null && !el.hasAttribute('disabled')
      );
    };

    // Auto-focus initial element
    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (options.initialFocusSelector) {
        const initialEl = container.querySelector(options.initialFocusSelector);
        if (initialEl) {
          initialEl.focus();
          return;
        }
      }
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        try {
          previousActiveElement.current.focus();
        } catch {
          // ignore if element no longer exists
        }
      }
    };
  }, [isActive, options.initialFocusSelector]);

  return containerRef;
}
