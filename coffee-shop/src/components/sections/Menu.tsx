'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { MenuCategory, MenuItem } from '@/types';
import { Reveal } from '@/components/Reveal';
import { MenuModal } from '@/components/sections/MenuModal';
import { BadgePills } from '@/components/sections/BadgePills';
import { usePrefersReducedMotion } from '@/lib/hooks';

const PREVIEW_COUNT = 6;

export function Menu({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const [active, setActive] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const reduced = usePrefersReducedMotion();

  const filtered = useMemo(() => {
    const list = items
      .filter((i) => i.available)
      .filter((i) => active === 'all' || i.categorySlug === active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return list;
  }, [items, active]);

  const visible =
    active === 'all' && !showAll ? filtered.slice(0, PREVIEW_COUNT) : filtered;

  const hasMore = active === 'all' && !showAll && filtered.length > PREVIEW_COUNT;

  const tabs = [{ slug: 'all', name: 'Все' }, ...categories];

  return (
    <section id="menu" className="scroll-mt-20 bg-sand/40 py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="section-label">Меню</p>
          <h2 className="text-4xl font-semibold text-espresso sm:text-5xl">
            Те, що варто скуштувати
          </h2>
          <p className="mt-4 text-lg text-mocha">
            Кава, чай, сніданки, десерти та свіжа випічка. Оберіть категорію або
            перегляньте все меню.
          </p>
        </Reveal>

        {/* Фільтри */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const isActive = active === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  setActive(t.slug);
                  setShowAll(false);
                }}
                aria-pressed={isActive}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-espresso text-cream shadow-card'
                    : 'bg-milk text-mocha ring-1 ring-espresso/10 hover:ring-espresso/25'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Сітка */}
        {visible.length === 0 ? (
          <p className="mt-16 text-center text-mocha">
            У цій категорії поки немає позицій.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, i) => (
              <motion.article
                key={item.id}
                layout={!reduced}
                initial={reduced ? undefined : { opacity: 0, y: 20 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                className="group card cursor-pointer overflow-hidden text-left ring-1 ring-espresso/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_-14px_rgba(243,217,166,0.75)] hover:ring-2 hover:ring-honey/70 active:ring-honey"
                onClick={() => setSelected(item)}
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  aria-label={`Детальніше: ${item.name}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <BadgePills badges={item.badges} />
                    </div>
                    <span className="pointer-events-none absolute inset-0 bg-honey/0 transition-colors duration-300 group-hover:bg-honey/20" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-semibold text-espresso">
                        {item.name}
                      </h3>
                      <span className="whitespace-nowrap font-display text-lg font-semibold text-terracotta">
                        {item.price} ₴
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mocha">
                      {item.description}
                    </p>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setShowAll(true)} className="btn-ghost">
              Дивитись все меню
            </button>
          </div>
        )}
      </div>

      <MenuModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
