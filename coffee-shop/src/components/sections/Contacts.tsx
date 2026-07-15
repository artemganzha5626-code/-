'use client';

import type { SiteSettings } from '@/types';
import { Reveal } from '@/components/Reveal';
import { HoverText } from '@/components/HoverText';
import {
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  InstagramIcon,
  RouteIcon,
} from '@/components/icons';

export function Contacts({ settings }: { settings: SiteSettings }) {
  const hasPhone = Boolean(settings.phone && settings.phone.trim());
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;

  const rows = [
    { icon: MapPinIcon, label: 'Адреса', value: settings.address },
    ...(hasPhone ? [{ icon: PhoneIcon, label: 'Телефон', value: settings.phone }] : []),
    { icon: ClockIcon, label: 'Графік роботи', value: settings.hours },
  ];

  return (
    <section id="contacts" className="scroll-mt-20 py-14 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="section-label">Контакти</p>
          <h2 className="text-3xl font-semibold text-espresso sm:text-4xl lg:text-5xl">
            <HoverText text="Завітайте на каву" />
          </h2>
          <p className="mt-3 text-base text-mocha sm:mt-4 sm:text-lg">
            Ми поруч і завжди раді гостям. Пишіть в Instagram або прокладіть маршрут — до
            зустрічі!
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-8 lg:grid-cols-2">
          {/* Інфо + кнопки */}
          <div>
            <Reveal className="card p-4 sm:p-8">
              <ul className="space-y-4 sm:space-y-6">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-3 sm:gap-4">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-terracotta/12 text-terracotta sm:h-11 sm:w-11">
                      <r.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-mocha/70 sm:text-xs">
                        {r.label}
                      </p>
                      <p className="mt-0.5 text-base text-espresso sm:mt-1 sm:text-lg">{r.value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                {hasPhone && (
                  <a href={telHref} className="btn-primary flex-1 sm:flex-none">
                    <PhoneIcon className="h-4 w-4" />
                    Подзвонити
                  </a>
                )}
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 sm:flex-none"
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
          <Reveal delay={0.1} className="overflow-hidden rounded-2xl shadow-card ring-1 ring-espresso/5 sm:rounded-3xl">
            <iframe
              src={settings.mapEmbed}
              title="Карта — розташування КАВОВА"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[240px] w-full border-0 sm:min-h-[320px]"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
