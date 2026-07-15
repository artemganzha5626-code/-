'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryImage } from '@/types';
import { Reveal } from '@/components/Reveal';
import { HoverText } from '@/components/HoverText';
import { CloseIcon, ArrowIcon } from '@/components/icons';
import { spotlightMove } from '@/lib/spotlight';

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  // Групуємо фото в стосики по 3 (останній може мати менше).
  const stacks: { img: GalleryImage; index: number }[][] = [];
  sorted.forEach((img, i) => {
    if (i % 3 === 0) stacks.push([]);
    stacks[stacks.length - 1].push({ img, index: i });
  });

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + sorted.length) % sorted.length)),
    [sorted.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % sorted.length)),
    [sorted.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, close, prev, next]);

  if (!sorted.length) return null;

  return (
    <section id="gallery" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="section-label">Галерея</p>
          <h2 className="text-3xl font-semibold text-espresso sm:text-4xl lg:text-5xl">
            <HoverText text="Атмосфера в деталях" />
          </h2>
          <p className="mt-4 text-base text-mocha sm:text-lg">
            Живі кадри страв, кави та простору. Натисніть, щоб роздивитися ближче.
          </p>
        </Reveal>

        {/* Віяла-стопки карток (display cards): картки в стосику, при наведенні
            обрана випрямляється і виходить на передній план. */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {stacks.map((stack, si) => (
            <Reveal key={si} delay={si * 0.08} className="relative">
              <div className="relative aspect-square">
                {stack.map(({ img, index: gi }, j) => {
                  const layout = [
                    { left: '0%', top: '12%', rotate: '-7deg' },
                    { left: '16%', top: '6%', rotate: '-1deg' },
                    { left: '32%', top: '0%', rotate: '6deg' },
                  ][j]!;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setIndex(gi)}
                      onMouseMove={spotlightMove}
                      style={{
                        left: layout.left,
                        top: layout.top,
                        zIndex: j + 1,
                        ['--rot' as string]: layout.rotate,
                      }}
                      className="spotlight group absolute aspect-[3/4] w-[62%] overflow-hidden rounded-2xl shadow-card ring-1 ring-espresso/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:rotate(var(--rot))] hover:!z-40 hover:shadow-[0_24px_60px_-16px_rgba(243,217,166,0.85)] hover:ring-2 hover:ring-honey/70 hover:[transform:rotate(0deg)_translateY(-12px)_scale(1.06)] focus-visible:!z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:[transform:rotate(0deg)_translateY(-12px)_scale(1.06)]"
                      aria-label={`Відкрити зображення: ${img.alt}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 62vw, (max-width: 1024px) 31vw, 21vw"
                        className="object-cover brightness-[0.97] transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
                      />
                      <span className="spotlight-glow" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Лайтбокс */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Перегляд зображення"
          >
            <div className="absolute inset-0 bg-graphite/85 backdrop-blur-sm" />

            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-card"
              aria-label="Закрити"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 z-20 flex h-11 w-11 rotate-180 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-card sm:left-6"
              aria-label="Попереднє"
            >
              <ArrowIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-card sm:right-6"
              aria-label="Наступне"
            >
              <ArrowIcon className="h-5 w-5" />
            </button>

            <motion.div
              key={sorted[index].id}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 max-h-[85vh] w-full max-w-4xl"
            >
              <Image
                src={sorted[index].url.replace(/w=\d+/, 'w=1400')}
                alt={sorted[index].alt}
                width={1400}
                height={1000}
                className="mx-auto h-auto max-h-[85vh] w-auto rounded-2xl object-contain shadow-soft"
              />
              <p className="mt-3 text-center text-sm text-cream/80">{sorted[index].alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
