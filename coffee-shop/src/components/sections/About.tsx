'use client';

import Image from 'next/image';
import type { SiteSettings } from '@/types';
import { Reveal } from '@/components/Reveal';
import { HoverText } from '@/components/HoverText';
import { PeekMascot } from '@/components/PeekMascot';
import { ClockIcon, BeanIcon, HeartIcon } from '@/components/icons';

// Факти лише з даних кав’ярні — нічого не вигадуємо.
const perks = [
  {
    icon: ClockIcon,
    title: 'Без вихідних',
    text: 'Щодня з 8:00 до 21:00 на лівому березі Дніпра, проспект Слобожанський, 67К.',
  },
  {
    icon: BeanIcon,
    title: 'Простір для експериментів',
    text: 'Класична кавова карта й фільтр, айс-напої та матча, сезонні спешли, випічка й KABOBA BAR.',
  },
  {
    icon: HeartIcon,
    title: '−10% за екозвичку',
    text: 'Гостям із власним горнятком чи термосом даруємо знижку на гарячий напій.',
  },
];

export function About({ settings }: { settings: SiteSettings }) {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Фото інтер’єру */}
          <Reveal className="relative">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=70"
                alt="Простір кав’ярні КАВОВА"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 bg-honey/0 transition-colors duration-500 group-hover:bg-honey/15" />
              <PeekMascot variant="croissant" side="left" className="bottom-4" />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-espresso px-6 py-5 text-cream shadow-soft sm:block">
              <p className="font-display text-3xl font-semibold leading-none">з 2023</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-cream/70">
                варимо каву поруч
              </p>
            </div>
          </Reveal>

          {/* Текст */}
          <div>
            <Reveal>
              <p className="section-label">Про кав’ярню</p>
              <h2 className="text-4xl font-semibold text-espresso sm:text-5xl">
                <HoverText text="Кава для сусідів, друзів і всіх, хто заходить" />
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-mocha">
                КАВОВА — це кав’ярня на лівому березі Дніпра, на проспекті Слобожанський, 67К.
                Ми відчинили двері 11 лютого 2023 року і відтоді щодня, без вихідних, з 8:00 до
                21:00 варимо каву для тих, хто заходить погрітися чи просто побути в затишку.
              </p>
              <p className="mt-4 leading-relaxed text-mocha/90">
                Наше меню — простір для експериментів: класична кавова карта та фільтр-кава,
                освіжаючі айс-напої та матча, сезонні спешли (гарбузовий лате восени, глінтвейн
                узимку), домашня випічка й десерти в стаканчику, легкі сендвічі та салати, а у
                KABOBA BAR — коктейлі й келих вина для настрою вихідного дня.
              </p>
              <p className="mt-4 leading-relaxed text-mocha/90">
                Ми любимо деталі: прикрашаємо кав’ярню до свят — тепла зимова казка щогрудня,
                різдвяний настрій, весняний вайб навесні. А гостям із власним горнятком чи
                термосом даруємо −10% на гарячий напій за екозвичку.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {perks.map((perk, i) => (
                <Reveal key={perk.title} delay={0.12 * i} className="card p-5">
                  <perk.icon className="h-8 w-8 text-terracotta" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-espresso">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mocha">{perk.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
