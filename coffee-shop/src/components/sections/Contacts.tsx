'use client';

import type { SiteSettings } from '@/types';
import { Reveal } from '@/components/Reveal';
import {
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  InstagramIcon,
  RouteIcon,
} from '@/components/icons';

export function Contacts({ settings }: { settings: SiteSettings }) {
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;

  const rows = [
    { icon: MapPinIcon, label: 'Адреса', value: settings.address },
    { icon: PhoneIcon, label: 'Телефон', value: settings.phone },
    { icon: ClockIcon, label: 'Графік роботи', value: settings.hours },
  ];

  return (
    <section id="contacts" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="section-label">Контакти</p>
          <h2 className="text-4xl font-semibold text-espresso sm:text-5xl">
            Завітайте на каву
          </h2>
          <p className="mt-4 text-lg text-mocha">
            Ми поруч і завжди раді гостям. Телефонуйте, пишіть або прокладіть маршрут — до
            зустрічі!
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Інфо + кнопки */}
          <div>
            <Reveal className="card p-6 sm:p-8">
              <ul className="space-y-6">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-4">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-terracotta/12 text-terracotta">
                      <r.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-mocha/70">
                        {r.label}
                      </p>
                      <p className="mt-1 text-lg text-espresso">{r.value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={telHref} className="btn-primary flex-1 sm:flex-none">
                  <PhoneIcon className="h-4 w-4" />
                  Подзвонити
                </a>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex-1 sm:flex-none"
                >
                  <InstagramIcon className="h-4 w-4" />
                  Instagram
                </a>
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent flex-1 sm:flex-none"
                >
                  <RouteIcon className="h-4 w-4" />
                  Маршрут
                </a>
              </div>
            </Reveal>
          </div>

          {/* Карта (ліниве завантаження) */}
          <Reveal delay={0.1} className="overflow-hidden rounded-3xl shadow-card ring-1 ring-espresso/5">
            <iframe
              src={settings.mapEmbed}
              title="Карта — розташування BENCH"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full border-0"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
