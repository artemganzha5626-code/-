'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CupIcon, MenuIcon, CloseIcon } from '@/components/icons';
import { usePrefersReducedMotion } from '@/lib/hooks';

const links = [
  { href: '#top', label: 'Головна' },
  { href: '#menu', label: 'Меню' },
  { href: '#about', label: 'Про нас' },
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

  // Блокуємо прокрутку тіла, поки відкрите мобільне меню.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-[0_1px_0_rgba(59,46,37,0.06)]' : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <a
          href="#top"
          className="flex items-center gap-2 text-espresso"
          aria-label={`${brand} — на початок`}
        >
          <CupIcon className="h-6 w-6 text-terracotta" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            {brand}
          </span>
        </a>

        {/* Десктоп-навігація */}
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative text-sm font-medium text-espresso/80 transition-colors hover:text-espresso
                           after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-terracotta
                           after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#menu" className="btn-accent hidden md:inline-flex">
          Дивитись меню
        </a>

        {/* Бургер */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-espresso ring-1 ring-espresso/15 md:hidden"
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
              <li className="pt-2">
                <a href="#menu" onClick={() => setOpen(false)} className="btn-accent w-full">
                  Дивитись меню
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
