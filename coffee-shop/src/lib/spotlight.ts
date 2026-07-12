import type { MouseEvent } from 'react';

/**
 * Оновлює CSS-змінні --mx/--my на елементі під курсором, щоб «прожектор»
 * (.spotlight-glow) слідував за вказівником. Вішається на onMouseMove
 * елемента з класом .spotlight.
 */
export function spotlightMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}
