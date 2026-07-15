'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MenuCategory, MenuItem } from '@/types';
import { Reveal } from '@/components/Reveal';
import { HoverText } from '@/components/HoverText';
import { PeekMascot, type MascotVariant } from '@/components/PeekMascot';
import { MenuModal } from '@/components/sections/MenuModal';
import { MenuVisual } from '@/components/sections/MenuVisual';
import { BadgePills } from '@/components/sections/BadgePills';
import { HeartIcon } from '@/components/icons';
import { getLikeCounts } from '@/lib/reactions';
import { spotlightMove } from '@/lib/spotlight';
import { usePrefersReducedMotion } from '@/lib/hooks';

// Маскот за розділом меню.
function mascotFor(slug: string): MascotVariant {
  switch (slug) {
    case 'bakery':
      return 'cookie';
    case 'food':
      return 'sandwich';
    case 'bar':
      return 'cocktail';
    case 'wine':
      return 'wine';
    default:
      return 'cup'; // напої: ice, hot, seasonal, cold
  }
}

export function Menu({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [activeSlug, setActiveSlug] = useState<string>('');
  const reduced = usePrefersReducedMotion();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stripRef = useRef<HTMLDivElement>(null);

  const ordered = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  // Позиції за категоріями (лише доступні, у своєму порядку).
  const byCategory = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const cat of ordered) {
      map[cat.slug] = items
        .filter((i) => i.available && i.categorySlug === cat.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [ordered, items]);

  // Розділи, у яких лишились позиції з фото — саме вони й відображаються.
  const visibleCategories = useMemo(
    () => ordered.filter((c) => (byCategory[c.slug]?.length ?? 0) > 0),
    [ordered, byCategory],
  );

  useEffect(() => {
    getLikeCounts().then(setLikeCounts);
    if (visibleCategories.length) setActiveSlug(visibleCategories[0].slug);
  }, [visibleCategories]);

  const closeModal = () => {
    setSelected(null);
    getLikeCounts().then(setLikeCounts);
  };

  // Scroll-spy: підсвічуємо розділ, що зараз угорі екрана.
  useEffect(() => {
    const els = visibleCategories
      .map((c) => sectionRefs.current[c.slug])
      .filter((el): el is HTMLDivElement => Boolean(el));
    if (!els.length) return;

    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slug = (e.target as HTMLElement).dataset.slug!;
          if (e.isIntersecting) visible.set(slug, e.boundingClientRect.top);
          else visible.delete(slug);
        }
        if (visible.size) {
          // Активний — найвищий із видимих розділів.
          let best = '';
          let bestTop = Infinity;
          visible.forEach((top, slug) => {
            if (top < bestTop) {
              bestTop = top;
              best = slug;
            }
          });
          if (best) setActiveSlug(best);
        }
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: [0, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [visibleCategories]);

  const scrollToSection = (slug: string) => {
    const el = sectionRefs.current[slug];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };

  // Мобільна стрічка розділів «їде» слідом за активним чипом,
  // щоб клієнт завжди бачив, у якому розділі перебуває (без вертикального стрибка).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !activeSlug) return;
    const chip = strip.querySelector<HTMLElement>(`[data-slug="${activeSlug}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2;
    strip.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  }, [activeSlug, reduced]);

  return (
    <section id="menu" className="scroll-mt-20 bg-sand/40 py-14 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="section-label">Меню</p>
          <h2 className="text-3xl font-semibold text-espresso sm:text-4xl lg:text-5xl">
            <HoverText text="Те, що варто скуштувати" />
          </h2>
          <p className="mt-4 text-base text-mocha sm:text-lg">
            Кава, чай, сніданки, десерти та свіжа випічка. Гортайте розділи —
            навігація збоку завжди підкаже, де ви.
          </p>
        </Reveal>

        {/* Мобільна липка стрічка розділів */}
        <div
          ref={stripRef}
          className="no-scrollbar sticky top-16 z-30 -mx-5 mt-6 flex gap-2 overflow-x-auto bg-sand/40 px-5 py-2 backdrop-blur lg:hidden"
        >
          {visibleCategories.map((c) => (
            <button
              key={c.slug}
              type="button"
              data-slug={c.slug}
              onClick={() => scrollToSection(c.slug)}
              aria-current={activeSlug === c.slug}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeSlug === c.slug
                  ? 'bg-espresso text-cream shadow-card'
                  : 'bg-milk text-mocha ring-1 ring-espresso/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 gap-10 lg:flex">
          {/* Бічна навігація (десктоп): липка, підсвічує поточний розділ */}
          <aside className="hidden w-56 flex-none lg:block">
            <nav className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-mocha/60">
                Розділи меню
              </p>
              <ul className="space-y-1 border-l border-espresso/10">
                {visibleCategories.map((c) => {
                  const isActive = activeSlug === c.slug;
                  return (
                    <li key={c.slug} className="relative">
                      <button
                        type="button"
                        onClick={() => scrollToSection(c.slug)}
                        aria-current={isActive}
                        className={`block w-full rounded-r-lg py-2 pl-4 pr-2 text-left text-sm transition-all ${
                          isActive
                            ? 'font-semibold text-espresso'
                            : 'text-mocha/70 hover:text-espresso'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="menu-nav-indicator"
                            className="absolute -left-px top-0 h-full w-[3px] rounded-full bg-terracotta"
                          />
                        )}
                        <span className="flex items-center justify-between gap-2">
                          {c.name}
                          <span className="text-[11px] tabular-nums text-mocha/40">
                            {byCategory[c.slug]?.length ?? 0}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Контент: усі розділи один за одним */}
          <div className="min-w-0 flex-1 space-y-16">
            {visibleCategories.map((cat) => {
              const list = byCategory[cat.slug] ?? [];
              const variant = mascotFor(cat.slug);
              return (
                <div
                  key={cat.slug}
                  data-slug={cat.slug}
                  ref={(el) => {
                    sectionRefs.current[cat.slug] = el;
                  }}
                  className="scroll-mt-28"
                >
                  <div className="mb-6 flex items-baseline gap-3">
                    <h3 className="font-display text-2xl font-semibold text-espresso sm:text-3xl">
                      {cat.name}
                    </h3>
                    <span className="text-sm text-mocha/50">{list.length}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                    {list.map((item, i) => (
                      <article
                        key={item.id}
                        className="group card cursor-pointer overflow-hidden text-left ring-1 ring-espresso/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_-14px_rgba(243,217,166,0.75)] hover:ring-2 hover:ring-honey/70 active:ring-honey"
                        onClick={() => setSelected(item)}
                        onTouchStart={() => {}}
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
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 30vw"
                              iconClassName="h-1/3 w-1/3 max-h-10 max-w-10 sm:max-h-20 sm:max-w-20"
                            />
                            <div className="absolute left-1.5 top-1.5 z-[4] sm:left-3 sm:top-3">
                              <BadgePills badges={item.badges} />
                            </div>
                            <span className="spotlight-glow" aria-hidden />
                            <PeekMascot variant={variant} side={i % 2 === 0 ? 'right' : 'left'} />
                          </div>
                          <div className="p-2.5 sm:p-5">
                            {item.group && (
                              <p className="mb-0.5 truncate text-[9px] font-semibold uppercase tracking-wider text-terracotta/80 sm:mb-1 sm:text-[11px]">
                                {item.group}
                              </p>
                            )}
                            <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                              <h4 className="font-display text-sm font-semibold leading-tight text-espresso sm:text-xl">
                                {item.name}
                              </h4>
                              <span className="whitespace-nowrap font-display text-xs font-semibold text-terracotta sm:text-lg">
                                {item.price} ₴
                              </span>
                            </div>
                            {item.description && (
                              <p className="mt-1 line-clamp-2 hidden text-sm leading-relaxed text-mocha sm:block">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-1 text-mocha/70 sm:mt-3 sm:gap-1.5">
                              <HeartIcon className="h-3 w-3 text-terracotta sm:h-4 sm:w-4" />
                              <span className="text-[10px] tabular-nums sm:text-xs">
                                {likeCounts[item.id] ?? 0}
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MenuModal item={selected} onClose={closeModal} />
    </section>
  );
}
