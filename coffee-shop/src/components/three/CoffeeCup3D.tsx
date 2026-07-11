'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion, useIsDesktop } from '@/lib/hooks';

// 3D-сцена вантажиться лише на клієнті й лише за потреби (code-splitting).
const CoffeeCupScene = dynamic(() => import('./CoffeeCupScene'), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

function SceneSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-pulse rounded-full bg-latte/50" />
    </div>
  );
}

const FALLBACK =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=70';

/**
 * Показує легку 3D-чашку на десктопі, коли блок у полі зору й не ввімкнено
 * «зменшити рух». На мобільних / слабких пристроях або поза екраном —
 * якісне статичне зображення.
 */
export function CoffeeCup3D() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  const use3D = isDesktop && !reduced;

  useEffect(() => {
    if (!use3D) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [use3D]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {use3D && inView ? (
        <CoffeeCupScene />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative aspect-square w-[78%] max-w-sm overflow-hidden rounded-full shadow-soft ring-1 ring-espresso/10">
            <Image
              src={FALLBACK}
              alt="Чашка кави BENCH"
              fill
              sizes="(max-width: 768px) 70vw, 380px"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
