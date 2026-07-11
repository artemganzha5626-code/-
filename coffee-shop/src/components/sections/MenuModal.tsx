'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MenuItem } from '@/types';
import { CloseIcon } from '@/components/icons';
import { BadgePills } from '@/components/sections/BadgePills';
import { usePrefersReducedMotion } from '@/lib/hooks';

export function MenuModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (item) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.name}
        >
          <div className="absolute inset-0 bg-graphite/50 backdrop-blur-sm" />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-3xl bg-milk shadow-soft sm:rounded-3xl"
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-card transition hover:bg-cream"
                aria-label="Закрити"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              <div className="absolute left-4 top-4">
                <BadgePills badges={item.badges} />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-3xl font-semibold text-espresso">
                  {item.name}
                </h3>
                <span className="whitespace-nowrap font-display text-2xl font-semibold text-terracotta">
                  {item.price} ₴
                </span>
              </div>
              <p className="mt-4 text-lg leading-relaxed text-mocha">{item.description}</p>
              <a href="#contacts" onClick={onClose} className="btn-primary mt-8 w-full sm:w-auto">
                Замовити в кав’ярні
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
