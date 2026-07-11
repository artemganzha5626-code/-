'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { SiteSettings } from '@/types';
import { CoffeeCup3D } from '@/components/three/CoffeeCup3D';
import { ArrowIcon, RouteIcon } from '@/components/icons';
import { usePrefersReducedMotion } from '@/lib/hooks';

export function Hero({ settings }: { settings: SiteSettings }) {
  const reduced = usePrefersReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Фонове фото інтер’єру */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={settings.heroImage}
          alt="Інтер’єр кав’ярні BENCH"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/85 via-cream/70 to-cream" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/90 to-transparent" />
      </div>

      <div className="container-x grid min-h-[100svh] grid-cols-1 items-center gap-8 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        {/* Текст */}
        <div className="max-w-xl">
          <motion.p {...fade(0.05)} className="section-label">
            {settings.name} · {settings.tagline}
          </motion.p>

          <motion.h1
            {...fade(0.12)}
            className="text-balance font-display text-5xl font-semibold leading-[1.05] text-espresso sm:text-6xl lg:text-7xl"
          >
            {settings.heroTitle}
          </motion.h1>

          <motion.p
            {...fade(0.2)}
            className="mt-6 max-w-md text-lg leading-relaxed text-mocha"
          >
            {settings.heroSubtitle}
          </motion.p>

          <motion.div {...fade(0.28)} className="mt-9 flex flex-wrap gap-3">
            <a href="#menu" className="btn-primary">
              Дивитись меню
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <RouteIcon className="h-4 w-4" />
              Прокласти маршрут
            </a>
          </motion.div>

          <motion.p {...fade(0.36)} className="mt-8 text-sm text-mocha/80">
            {settings.hours}
          </motion.p>
        </div>

        {/* 3D-чашка */}
        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.9, delay: 0.2 },
              })}
          className="relative mx-auto aspect-square w-full max-w-[520px] lg:max-w-none"
        >
          <div className="absolute inset-0 -z-10 m-auto h-3/4 w-3/4 rounded-full bg-terracotta/10 blur-3xl" />
          <CoffeeCup3D />
        </motion.div>
      </div>

      {/* М’який перехід у наступну секцію */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-cream" />
    </section>
  );
}
