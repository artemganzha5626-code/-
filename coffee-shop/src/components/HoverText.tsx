'use client';

import { Fragment } from 'react';

/**
 * Інтерактивний заголовок: кожна літера окремо реагує на курсор —
 * плавно підстрибує й забарвлюється в акцент. Слова не розриваються,
 * пробіли лишаються переносимими. За prefers-reduced-motion рух вимкнено.
 */
export function HoverText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-flex whitespace-nowrap">
            {Array.from(word).map((ch, ci) => (
              <span
                key={ci}
                aria-hidden
                className="inline-block cursor-default transition-transform duration-200 ease-out hover:-translate-y-[0.12em] hover:text-terracotta motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
