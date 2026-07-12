'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MenuCategory, MenuItem } from '@/types';
import { Reveal } from '@/components/Reveal';
import { HoverText } from '@/components/HoverText';
import { PeekMascot } from '@/components/PeekMascot';
import { MenuModal } from '@/components/sections/MenuModal';
import { MenuVisual } from '@/components/sections/MenuVisual';
import { BadgePills } from '@/components/sections/BadgePills';
import { HeartIcon, ArrowIcon } from '@/components/icons';
import { getLikeCounts } from '@/lib/reactions';
import { spotlightMove } from '@/lib/spotlight';
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
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [announce, setAnnounce] = useState<string | null>(null);
  const announceTimer = useRef<number | undefined>(undefined);
  const reduced = usePrefersReducedMotion();

  const topRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const wasHiddenRef = useRef(false);
  const coolingRef = useRef(false);

  const orderedSlugs = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => c.slug),
    [categories],
  );

  useEffect(() => {
    getLikeCounts().then(setLikeCounts);
  }, []);

  // Автоперехід до наступного розділу, коли догорнули до кінця поточного.
  // Працює лише коли обрано конкретну категорію (не «Все»). Спрацьовує тільки
  // якщо кінець розділу з’явився після гортання (а не одразу видимий), тож
  // короткі розділи не «перескакують» самі.
  useEffect(() => {
    if (active === 'all') return;
    const el = sentinelRef.current;
    if (!el || orderedSlugs.length < 2) return;

    wasHiddenRef.current = false;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) {
          wasHiddenRef.current = true;
          return;
        }
        // З’явився, але користувач ще не гортав повз нього — не чіпаємо.
        if (!wasHiddenRef.current || coolingRef.current) return;

        coolingRef.current = true;
        const idx = orderedSlugs.indexOf(active);
        const nextSlug = orderedSlugs[(idx + 1) % orderedSlugs.length];
        setActive(nextSlug);
        setShowAll(false);

        // Показуємо помітний «анонс» нового розділу.
        const nextName = categories.find((c) => c.slug === nextSlug)?.name ?? '';
        setAnnounce(nextName);
        window.clearTimeout(announceTimer.current);
        announceTimer.current = window.setTimeout(() => setAnnounce(null), 2000);

        // Плавно повертаємось на початок нового розділу.
        requestAnimationFrame(() => {
          const top = topRef.current;
          if (top) {
            const y = top.getBoundingClientRect().top + window.scrollY - 88;
            window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
          }
        });
        window.setTimeout(() => {
          coolingRef.current = false;
        }, 1100);
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [active, orderedSlugs, categories, reduced]);

  useEffect(() => () => window.clearTimeout(announceTimer.current), []);

  const closeModal = () => {
    setSelected(null);
    getLikeCounts().then(setLikeCounts); // оновити лічильники після можливого лайка
  };

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
            <HoverText text="Те, що варто скуштувати" />
          </h2>
          <p className="mt-4 text-lg text-mocha">
            Кава, чай, сніданки, десерти та свіжа випічка. Оберіть категорію або
            перегляньте все меню.
          </p>
        </Reveal>

        {/* Фільтри */}
        <div ref={topRef} className="no-scrollbar mt-8 flex scroll-mt-24 gap-2 overflow-x-auto pb-1">
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
          <motion.div
            key={active}
            initial={reduced ? undefined : { opacity: 0, y: 28 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
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
                  <div
                    className="spotlight relative aspect-[4/3] overflow-hidden"
                    onMouseMove={spotlightMove}
                  >
                    <MenuVisual
                      item={item}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute left-3 top-3 z-[4]">
                      <BadgePills badges={item.badges} />
                    </div>
                    <span className="spotlight-glow" aria-hidden />
                    <PeekMascot
                      variant={
                        item.categorySlug === 'bakery' || item.categorySlug === 'food'
                          ? 'croissant'
                          : 'cup'
                      }
                      side={i % 2 === 0 ? 'right' : 'left'}
                    />
                  </div>
                  <div className="p-5">
                    {item.group && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-terracotta/80">
                        {item.group}
                      </p>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-semibold text-espresso">
                        {item.name}
                      </h3>
                      <span className="whitespace-nowrap font-display text-lg font-semibold text-terracotta">
                        {item.price} ₴
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mocha">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-mocha/70">
                      <HeartIcon className="h-4 w-4 text-terracotta" />
                      <span className="text-xs tabular-nums">{likeCounts[item.id] ?? 0}</span>
                    </div>
                  </div>
                </button>
              </motion.article>
            ))}
          </motion.div>
        )}

        {hasMore && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setShowAll(true)} className="btn-ghost">
              Дивитись все меню
            </button>
          </div>
        )}

        {/* Автоперехід між розділами: коли догортали до кінця — відкриється наступний */}
        {active !== 'all' && visible.length > 0 && orderedSlugs.length > 1 && (
          <div className="mt-12 flex flex-col items-center gap-2 text-mocha/70">
            <p className="text-sm">Гортайте далі — наступний розділ відкриється сам</p>
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-terracotta"
            >
              <ArrowIcon className="h-5 w-5 rotate-90" />
            </motion.span>
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          </div>
        )}
      </div>

      <MenuModal item={selected} onClose={closeModal} />

      {/* Помітний анонс автопереходу між розділами */}
      <AnimatePresence>
        {announce && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-10 z-[65] flex justify-center px-4"
            aria-live="polite"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full bg-espresso/95 px-6 py-3 text-cream shadow-soft ring-1 ring-honey/30 backdrop-blur">
              <ArrowIcon className="h-4 w-4 rotate-90 text-honey" />
              <span className="text-xs uppercase tracking-[0.2em] text-cream/60">Розділ</span>
              <span className="font-display text-lg font-semibold text-honey">{announce}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
