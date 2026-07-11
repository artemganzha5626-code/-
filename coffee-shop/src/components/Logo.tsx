import type { SVGProps } from 'react';

/**
 * Емблема КАВОВА — чашка з парою та промінням у скругленому квадраті.
 * Використовує currentColor, тож підлаштовується під колір тексту навколо.
 */
export function CupEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="42" height="42" rx="12" />
      {/* проміння у верхньому лівому куті */}
      <path d="M12 15.5l-2.5-2M15.5 12l-1.5-2.6M20 10.5l-.4-2.8" opacity="0.85" />
      {/* пара */}
      <path d="M27 12c-1.6 1.7-1.6 3.3 0 5s1.6 3.3 0 5" opacity="0.9" />
      <path d="M31.5 13c-1.3 1.4-1.3 2.8 0 4.2" opacity="0.7" />
      {/* чашка */}
      <path d="M16 26h13v4.2a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5V26Z" />
      <path d="M29 27.2h2.4a2.4 2.4 0 0 1 0 4.8H29" />
      {/* блюдце */}
      <path d="M14.5 38.5h16" />
    </svg>
  );
}

/**
 * Повний логотип-словознак: КАВ • [чашка] • ВА (літера «О» — це емблема).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-sans font-bold uppercase leading-none tracking-[0.06em] ${className}`}
      aria-label="КАВОВА"
    >
      <span>КАВ</span>
      <CupEmblem className="mx-[0.04em] h-[0.92em] w-[0.92em]" aria-hidden />
      <span>ВА</span>
    </span>
  );
}
