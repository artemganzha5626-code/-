'use client';

import Image from 'next/image';
import type { SiteSettings } from '@/types';
import { Reveal } from '@/components/Reveal';
import { BeanIcon, CroissantIcon, HeartIcon } from '@/components/icons';

const perks = [
  {
    icon: BeanIcon,
    title: 'Добірне зерно',
    text: 'Свіжа обжарка щотижня та сезонні лоти. Кожну чашку готуємо на професійному обладнанні.',
  },
  {
    icon: CroissantIcon,
    title: 'Свіжа випічка',
    text: 'Круасани й десерти випікаємо щоранку у власній пекарні — з якісного масла та шоколаду.',
  },
  {
    icon: HeartIcon,
    title: 'Затишна атмосфера',
    text: 'Тепле світло, мʼяка музика й простір, де приємно працювати, читати чи просто побути.',
  },
];

export function About({ settings }: { settings: SiteSettings }) {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Фото інтер’єру */}
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=70"
                alt="Простір кав’ярні BENCH"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-espresso px-6 py-5 text-cream shadow-soft sm:block">
              <p className="font-display text-3xl font-semibold leading-none">7 років</p>
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
                Маленьке місце з великою любовʼю до кави
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-mocha">
                {settings.description}
              </p>
              <p className="mt-4 leading-relaxed text-mocha/90">
                Ми віримо, що гарний день починається з чесної чашки кави. Тому обираємо
                зерно в невеликих обжарників, працюємо на прозорих рецептурах і памʼятаємо
                улюблені замовлення наших гостей.
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
