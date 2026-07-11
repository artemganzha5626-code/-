'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryImage } from '@/types';
import { Reveal } from '@/components/Reveal';
import { CloseIcon, ArrowIcon } from '@/components/icons';

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

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
          <h2 className="text-4xl font-semibold text-espresso sm:text-5xl">
            Атмосфера в деталях
          </h2>
          <p className="mt-4 text-lg text-mocha">
            Живі кадри страв, кави та простору. Натисніть, щоб роздивитися ближче.
          </p>
        </Reveal>

        <div className="mt-10 columns-2 gap-4 [column-fill:_balance] sm:columns-3 lg:columns-4">
          {sorted.map((img, i) => (
            <Reveal key={img.id} delay={(i % 4) * 0.05} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block w-full overflow-hidden rounded-2xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                aria-label={`Відкрити зображення: ${img.alt}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={600}
                  height={i % 3 === 0 ? 800 : 600}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-espresso/0 transition-colors duration-300 group-hover:bg-espresso/10" />
              </button>
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
