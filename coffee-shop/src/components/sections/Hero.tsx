'use client';

import { motion } from 'framer-motion';
import type { SiteSettings } from '@/types';
import { CoffeeBeansSpotlight } from '@/components/three/CoffeeBeansSpotlight';
import { ArrowIcon, RouteIcon } from '@/components/icons';
import { usePrefersReducedMotion } from '@/lib/hooks';

export function Hero({ settings }: { settings: SiteSettings }) {
  const reduced = usePrefersReducedMotion();

  // Контейнер зі сходинковою появою дочірніх елементів.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 26 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  const titleWords = settings.heroTitle.split(' ');

  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden bg-graphite text-cream"
    >
      {/* Тепла основа + прожекторне світло + кавові зерна */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 20% 15%, #47372b 0%, #2e2823 55%, #211d19 100%)',
        }}
      />
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber/20 blur-[120px]" />
      <CoffeeBeansSpotlight />

      {/* Контент */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-x relative z-10 flex min-h-[100svh] flex-col items-start justify-center pb-20 pt-28"
      >
        <motion.p
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-honey backdrop-blur"
        >
          {settings.name} · {settings.tagline}
        </motion.p>

        <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
          {titleWords.map((word, i) => (
            <motion.span key={i} variants={item} className="mr-[0.28em] inline-block">
              <span className="text-gradient-warm">{word}</span>
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-xl text-lg leading-relaxed text-cream/75"
        >
          {settings.heroSubtitle}
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
          <a href="#menu" className="btn-accent">
            Дивитись меню
            <ArrowIcon className="h-4 w-4" />
          </a>
          <a
            href={settings.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn inline-flex border border-cream/25 text-cream hover:border-cream/50 hover:bg-cream/10"
          >
            <RouteIcon className="h-4 w-4" />
            Прокласти маршрут
          </a>
        </motion.div>

        <motion.p variants={item} className="mt-10 text-sm text-cream/55">
          {settings.hours}
        </motion.p>
      </motion.div>

      {/* М’який перехід у наступну секцію */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-b from-transparent to-cream" />
    </section>
  );
}
