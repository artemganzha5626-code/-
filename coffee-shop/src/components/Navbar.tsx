'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { MenuIcon, CloseIcon } from '@/components/icons';
import { AccountButton } from '@/components/auth/AccountButton';
import { usePrefersReducedMotion } from '@/lib/hooks';

// Порядок — за хронологією секцій на сторінці.
const links = [
  { href: '#top', label: 'Головна' },
  { href: '#about', label: 'Про нас' },
  { href: '#menu', label: 'Меню' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#reviews', label: 'Відгуки' },
  { href: '#contacts', label: 'Контакти' },
];

export function Navbar({ brand }: { brand: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Світла тема шапки, поки ми над темним героєм (не проскролено й меню закрите).
  const light = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-[0_1px_0_rgba(59,46,37,0.06)]'
          : 'bg-gradient-to-b from-graphite/55 to-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <a
          href="#top"
          className={`transition-colors ${light ? 'text-cream' : 'text-espresso'}`}
          aria-label={`${brand} — на початок`}
        >
          <Logo className="text-xl md:text-2xl" />
        </a>

        {/* Десктоп-навігація */}
        <div className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-7">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full ${
                    light
                      ? 'text-cream/85 hover:text-cream after:bg-honey'
                      : 'text-espresso/80 hover:text-espresso after:bg-terracotta'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <AccountButton light={light} />
        </div>

        {/* Бургер */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden ${
            light ? 'text-cream ring-1 ring-cream/30' : 'text-espresso ring-1 ring-espresso/15'
          }`}
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={open}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Мобільне меню */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: -8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass border-t border-espresso/10 md:hidden"
          >
            <ul className="container-x flex flex-col py-4">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-2 py-3 text-lg font-medium text-espresso/90 hover:bg-espresso/5"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="px-2 pt-3">
                <AccountButton />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
