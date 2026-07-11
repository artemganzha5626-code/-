import Link from 'next/link';
import type { SiteSettings } from '@/types';
import { Logo } from '@/components/Logo';
import { InstagramIcon, PhoneIcon, MapPinIcon } from '@/components/icons';

const nav = [
  { href: '#menu', label: 'Меню' },
  { href: '#about', label: 'Про нас' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#reviews', label: 'Відгуки' },
  { href: '#contacts', label: 'Контакти' },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;

  return (
    <footer className="bg-graphite text-cream">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-2xl text-cream" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
              {settings.description}
            </p>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-cream/20 transition hover:bg-cream/10"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-cream/50">Навігація</p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-cream/80 transition hover:text-cream">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-cream/50">Контакти</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 flex-none text-terracotta-soft" />
                {settings.address}
              </li>
              <li>
                <a href={telHref} className="flex items-center gap-2.5 transition hover:text-cream">
                  <PhoneIcon className="h-4 w-4 flex-none text-terracotta-soft" />
                  {settings.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-sm text-cream/50 sm:flex-row">
          <p>© {year} {settings.name}. Усі права захищено.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-cream">
              Політика конфіденційності
            </Link>
            <Link href="/admin" className="transition hover:text-cream">
              Адмін-панель
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
