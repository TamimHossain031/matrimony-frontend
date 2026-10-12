'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextType {
  getLenis: () => Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: Record<string, unknown>) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  getLenis: () => null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced-motion preferences
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const shouldPreventSmoothScroll = (node: HTMLElement): boolean => {
      if (!node || typeof node.getAttribute !== 'function') return false;

      // 1. Explicit Lenis prevention attributes
      if (
        node.hasAttribute('data-lenis-prevent') ||
        node.hasAttribute('data-lenis-prevent-wheel') ||
        node.hasAttribute('data-lenis-prevent-touch') ||
        node.hasAttribute('data-lenis-prevent-vertical') ||
        node.hasAttribute('data-lenis-prevent-horizontal')
      ) {
        return true;
      }

      // 2. Form controls that scroll internally
      const tagName = node.tagName?.toLowerCase();
      if (tagName === 'select' || tagName === 'textarea' || tagName === 'input') {
        return true;
      }

      // 3. ARIA roles for popovers, select dropdowns, menus, modals
      const role = node.getAttribute('role');
      if (
        role === 'listbox' ||
        role === 'menu' ||
        role === 'dialog' ||
        role === 'combobox' ||
        role === 'option' ||
        role === 'menuitem' ||
        role === 'tooltip'
      ) {
        return true;
      }

      // 4. Material-UI (MUI) components & Select menus
      const className = typeof node.className === 'string' ? node.className : '';
      if (
        className.includes('MuiMenu-paper') ||
        className.includes('MuiMenu-list') ||
        className.includes('MuiPopover-paper') ||
        className.includes('MuiPopover-root') ||
        className.includes('MuiModal-root') ||
        className.includes('MuiDialog-paper') ||
        className.includes('MuiDialogContent-root') ||
        className.includes('MuiList-root') ||
        className.includes('MuiSelect-select') ||
        className.includes('MuiAutocomplete-popper') ||
        className.includes('MuiAutocomplete-listbox')
      ) {
        return true;
      }

      // 5. App-specific scroll containers
      if (
        className.includes('font-style-pill-grid') ||
        className.includes('occasion-pill-scroller') ||
        className.includes('occasion-filter-bar') ||
        className.includes('inspiration-chips') ||
        className.includes('chat-scroll') ||
        className.includes('table-wrap') ||
        className.includes('modal-body')
      ) {
        return true;
      }

      // 6. Generic overflow detection: any scrollable container in the DOM
      if (
        node !== document.body &&
        node !== document.documentElement &&
        (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth)
      ) {
        try {
          const style = window.getComputedStyle(node);
          const hasScrollY =
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            node.scrollHeight > node.clientHeight;
          const hasScrollX =
            (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
            node.scrollWidth > node.clientWidth;
          if (hasScrollY || hasScrollX) {
            return true;
          }
        } catch {
          // Ignore any DOM read errors
        }
      }

      return false;
    };

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      allowNestedScroll: true,
      prevent: shouldPreventSmoothScroll,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: Record<string, unknown>,
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.2,
        ...options,
      });
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getLenis = () => lenisRef.current;

  return (
    <SmoothScrollContext.Provider value={{ getLenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
