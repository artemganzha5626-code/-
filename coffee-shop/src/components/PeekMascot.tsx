import type { SVGProps } from 'react';

/**
 * Мультяшні маскоти, що «визирають» збоку картки при наведенні.
 * Ховаються за край (translate + rotate) і висуваються на group-hover.
 * Декоративні (aria-hidden), на тач-пристроях просто не з’являться.
 */

function CupMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 72" fill="none" {...props}>
      {/* пара */}
      <path
        d="M24 10c-1.8 2 1.8 3.4 0 5.4M32 6c-2 2.3 2 3.8 0 6.1M40 10c-1.8 2 1.8 3.4 0 5.4"
        stroke="#8A5632"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* кришка */}
      <rect x="12" y="18" width="40" height="8" rx="4" fill="#8A5632" />
      {/* стаканчик */}
      <path d="M15 26h34l-4 40a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4l-4-40Z" fill="#F3D9A6" />
      <path d="M17.5 40h29l-1 10h-27l-1-10Z" fill="#DDA45B" opacity="0.55" />
      {/* обличчя */}
      <circle cx="26" cy="42" r="2.6" fill="#3B2E25" />
      <circle cx="38" cy="42" r="2.6" fill="#3B2E25" />
      <circle cx="26.9" cy="41.2" r="0.9" fill="#FBF8F3" />
      <circle cx="38.9" cy="41.2" r="0.9" fill="#FBF8F3" />
      <path
        d="M27 50c2.6 2.8 7.4 2.8 10 0"
        stroke="#3B2E25"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* рум’янець */}
      <ellipse cx="20.5" cy="47" rx="2.6" ry="1.7" fill="#E0A55E" opacity="0.8" />
      <ellipse cx="43.5" cy="47" rx="2.6" ry="1.7" fill="#E0A55E" opacity="0.8" />
    </svg>
  );
}

function CroissantMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 64" fill="none" {...props}>
      {/* ріжки */}
      <path
        d="M8 34c-3-8 2-16 9-17 3 9 1 17-3 22l-6-5Z"
        fill="#DDA45B"
        stroke="#8A5632"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M72 34c3-8-2-16-9-17-3 9-1 17 3 22l6-5Z"
        fill="#DDA45B"
        stroke="#8A5632"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* тіло */}
      <path
        d="M14 39c0-13 11-22 26-22s26 9 26 22c0 10-9 18-26 18S14 49 14 39Z"
        fill="#EDCB8B"
        stroke="#8A5632"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* сегменти */}
      <path d="M30 18.5C26 26 26 40 30 55M50 18.5C54 26 54 40 50 55" stroke="#8A5632" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      {/* обличчя */}
      <circle cx="35" cy="36" r="2.6" fill="#3B2E25" />
      <circle cx="45" cy="36" r="2.6" fill="#3B2E25" />
      <circle cx="35.9" cy="35.2" r="0.9" fill="#FBF8F3" />
      <circle cx="45.9" cy="35.2" r="0.9" fill="#FBF8F3" />
      <path
        d="M35 43c2.2 2.5 7.8 2.5 10 0"
        stroke="#3B2E25"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="29" cy="41.5" rx="2.4" ry="1.6" fill="#E0A55E" opacity="0.9" />
      <ellipse cx="51" cy="41.5" rx="2.4" ry="1.6" fill="#E0A55E" opacity="0.9" />
    </svg>
  );
}

/**
 * Обгортка: кладіть усередину елемента з класом `group` та `overflow-hidden`
 * (або поруч, якщо треба визирати назовні). Маскот під’їжджає збоку.
 * variant: 'cup' — стаканчик кави, 'croissant' — круасан.
 * side: з якого краю визирає.
 */
export function PeekMascot({
  variant = 'cup',
  side = 'right',
  className = '',
}: {
  variant?: 'cup' | 'croissant';
  side?: 'left' | 'right';
  className?: string;
}) {
  const Mascot = variant === 'cup' ? CupMascot : CroissantMascot;
  const pos =
    side === 'right'
      ? 'right-1 translate-x-[115%] rotate-[18deg] group-hover:rotate-[-4deg]'
      : 'left-1 -translate-x-[115%] -rotate-[18deg] group-hover:rotate-[4deg]';
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute bottom-1 z-[5] block w-14 drop-shadow-[0_6px_12px_rgba(59,46,37,0.35)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-0 motion-reduce:hidden sm:w-16 ${pos} ${className}`}
    >
      <Mascot className="h-auto w-full" />
    </span>
  );
}
