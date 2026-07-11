'use client';

import { useEffect, useState } from 'react';

/** Чи ввімкнено системне «зменшити рух». */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/** Довільний media-query як булеве значення (SSR-safe). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = () => setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Пристрій із «точним» вказівником (миша/трекпад) і достатньою шириною —
 * тобто десктоп, де доречні курсорні ефекти та важче 3D.
 */
export function useIsDesktop(): boolean {
  const fine = useMediaQuery('(pointer: fine)');
  const wide = useMediaQuery('(min-width: 1024px)');
  return fine && wide;
}
