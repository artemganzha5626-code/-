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

function CookieMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="26" fill="#C68A4E" stroke="#8A5632" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="26" fill="url(#ck)" opacity="0.25" />
      {/* шматочки шоколаду */}
      <circle cx="20" cy="20" r="3" fill="#3B2416" />
      <circle cx="46" cy="24" r="3.4" fill="#3B2416" />
      <circle cx="48" cy="42" r="2.6" fill="#3B2416" />
      <circle cx="18" cy="44" r="3" fill="#3B2416" />
      <circle cx="33" cy="15" r="2.2" fill="#3B2416" />
      {/* обличчя */}
      <circle cx="26" cy="33" r="2.6" fill="#3B2E25" />
      <circle cx="38" cy="33" r="2.6" fill="#3B2E25" />
      <circle cx="26.9" cy="32.2" r="0.9" fill="#FBF8F3" />
      <circle cx="38.9" cy="32.2" r="0.9" fill="#FBF8F3" />
      <path d="M26 40c2.6 2.8 7.4 2.8 10 0" stroke="#3B2E25" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <ellipse cx="21" cy="38" rx="2.4" ry="1.6" fill="#E0A55E" opacity="0.85" />
      <ellipse cx="43" cy="38" rx="2.4" ry="1.6" fill="#E0A55E" opacity="0.85" />
      <defs>
        <radialGradient id="ck" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#F3D9A6" />
          <stop offset="1" stopColor="#8A5632" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function SandwichMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 72 60" fill="none" {...props}>
      {/* верхня булка */}
      <path d="M8 26c0-11 12-18 28-18s28 7 28 18H8Z" fill="#E7B366" stroke="#8A5632" strokeWidth="2.4" strokeLinejoin="round" />
      {/* кунжут */}
      <path d="M24 18l1.5 2M36 15l1.5 2M48 18l1.5 2" stroke="#FBF8F3" strokeWidth="2" strokeLinecap="round" />
      {/* салат */}
      <path d="M8 26c4 4 8-2 12 2s8-2 12 2 8-2 12 2 8-2 12 2 4 1 6-2v3H8v-9Z" fill="#8FB56A" stroke="#5f8043" strokeWidth="1.6" strokeLinejoin="round" />
      {/* сир */}
      <path d="M10 33h52v4l-6 5H16l-6-5v-4Z" fill="#F3C64B" stroke="#c99a2c" strokeWidth="1.6" strokeLinejoin="round" />
      {/* нижня булка */}
      <path d="M12 44h48c0 6-9 10-24 10s-24-4-24-10Z" fill="#E7B366" stroke="#8A5632" strokeWidth="2.4" strokeLinejoin="round" />
      {/* обличчя (на сирі) */}
      <circle cx="30" cy="37" r="2.3" fill="#3B2E25" />
      <circle cx="42" cy="37" r="2.3" fill="#3B2E25" />
      <path d="M31 41c2 1.8 6 1.8 8 0" stroke="#3B2E25" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function WineMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 72" fill="none" {...props}>
      {/* чаша */}
      <path d="M10 8h28c0 14-6 22-14 22S10 22 10 8Z" fill="#9E4560" stroke="#5f2233" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M12 10h24c-.4 4-1.2 7-2.4 9.5H14.4C13.2 17 12.4 14 12 10Z" fill="#7d3149" opacity="0.6" />
      {/* ніжка + основа */}
      <path d="M24 30v28M14 62h20" stroke="#5f2233" strokeWidth="2.6" strokeLinecap="round" />
      {/* обличчя */}
      <circle cx="20" cy="15" r="2.2" fill="#FBF8F3" />
      <circle cx="28" cy="15" r="2.2" fill="#FBF8F3" />
      <circle cx="20" cy="15" r="1" fill="#3B2E25" />
      <circle cx="28" cy="15" r="1" fill="#3B2E25" />
      <path d="M20 20c1.8 1.8 6.2 1.8 8 0" stroke="#FBF8F3" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CocktailMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 56 72" fill="none" {...props}>
      {/* трубочка + парасолька */}
      <path d="M34 6l-6 26" stroke="#C6813C" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M40 4l-12 4 4 4 8-8Z" fill="#E0A55E" stroke="#8A5632" strokeWidth="1.4" strokeLinejoin="round" />
      {/* чаша */}
      <path d="M6 20h44L30 42v0L6 20Z" fill="#EccB63" stroke="#8A5632" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M12 24h32l-4 4H16l-4-4Z" fill="#e6973f" opacity="0.55" />
      {/* ніжка */}
      <path d="M28 42v22M18 66h20" stroke="#8A5632" strokeWidth="2.6" strokeLinecap="round" />
      {/* обличчя */}
      <circle cx="22" cy="27" r="2.1" fill="#3B2E25" />
      <circle cx="34" cy="27" r="2.1" fill="#3B2E25" />
      <path d="M23 31c2 1.6 6 1.6 8 0" stroke="#3B2E25" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const MASCOTS = {
  cup: CupMascot,
  croissant: CroissantMascot,
  cookie: CookieMascot,
  sandwich: SandwichMascot,
  wine: WineMascot,
  cocktail: CocktailMascot,
} as const;

export type MascotVariant = keyof typeof MASCOTS;

/**
 * Обгортка: кладіть усередину елемента з класом `group` та `overflow-hidden`
 * (або поруч, якщо треба визирати назовні). Маскот під’їжджає збоку.
 * side: з якого краю визирає.
 */
export function PeekMascot({
  variant = 'cup',
  side = 'right',
  className = '',
}: {
  variant?: MascotVariant;
  side?: 'left' | 'right';
  className?: string;
}) {
  const Mascot = MASCOTS[variant] ?? CupMascot;
  const pos =
    side === 'right'
      ? 'right-1 translate-x-[115%] rotate-[18deg] group-hover:rotate-[-4deg]'
      : 'left-1 -translate-x-[115%] -rotate-[18deg] group-hover:rotate-[4deg]';
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute bottom-1 z-[5] hidden w-14 drop-shadow-[0_6px_12px_rgba(59,46,37,0.35)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-0 motion-reduce:hidden sm:block sm:w-16 ${pos} ${className}`}
    >
      <Mascot className="h-auto w-full" />
    </span>
  );
}
