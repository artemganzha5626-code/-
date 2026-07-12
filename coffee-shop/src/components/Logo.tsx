import type { SVGProps } from 'react';

/**
 * Емблема КАВОВА — літера «О» словознака: скруглений прямокутник,
 * усередині сонце (ліворуч угорі), пара та чашка з блюдцем.
 * Малюється поточним кольором тексту (currentColor), тож однаково
 * читається на темному герої та світлій шапці.
 */
export function CupEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 44 58"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2.2" y="2.2" width="39.6" height="53.6" rx="11" />
      {/* сонце — ліворуч угорі */}
      <path d="M8.5 17.5a4.6 4.6 0 0 1 9.2 0" />
      <path d="M8.5 17.5h9.2" opacity="0.9" />
      <path d="M13.1 9.4V6.6" opacity="0.85" />
      <path d="M8.2 11.1 6.4 9.3" opacity="0.85" />
      <path d="M18 11.1 19.8 9.3" opacity="0.85" />
      <path d="M6.5 17.5H4" opacity="0.85" />
      <path d="M22.2 17.5h-2.5" opacity="0.85" />
      {/* пара */}
      <path d="M21.6 30.5c-3-2.8 3-4.6 0-7.4s3-4.6 0-7.4" opacity="0.95" />
      <path d="M27 30.5c-2.2-2.1 2.2-3.5 0-5.6s2.2-3.5 0-5.6" opacity="0.75" />
      {/* чашка */}
      <path d="M14 33h16v2.2a8 8 0 0 1-16 0z" />
      <path d="M30 34.2h2.4a2.8 2.8 0 0 1 0 5.6H30" />
      {/* блюдце */}
      <path d="M11.5 45q10.5 3.6 21 0" />
    </svg>
  );
}

/**
 * Повний логотип-словознак КАВОВА: КАВ • [емблема-О] • ВА.
 * Тонкий геометричний гротеск із широким трекінгом — як в оригіналі.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex select-none items-center font-logo font-light uppercase leading-none tracking-[0.06em] ${className}`}
      aria-label="КАВОВА"
    >
      <span>КАВ</span>
      <CupEmblem className="mx-[0.03em] h-[0.92em] w-[0.7em]" aria-hidden />
      <span>ВА</span>
    </span>
  );
}
