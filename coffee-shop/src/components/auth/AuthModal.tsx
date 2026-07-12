'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { CloseIcon } from '@/components/icons';

const benefits = [
  'Простіший і швидший процес оформлення замовлення',
  'Додаткові функції',
  'Доступ до історії замовлень',
];

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'check-email' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Портал монтуємо лише на клієнті (щоб не ламати SSR).
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const supabase = createClient();
    if (!supabase) {
      setStatus('error');
      setMessage('Акаунти працюють після підключення Supabase (див. README).');
      return;
    }
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setStatus('done');
          onClose();
        } else {
          setStatus('check-email');
          setMessage('Перевірте пошту, щоб підтвердити реєстрацію.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus('done');
        onClose();
      }
    } catch (err) {
      setStatus('error');
      const detail = err instanceof Error ? err.message : '';
      setMessage(
        (mode === 'register'
          ? 'Не вдалося зареєструватися.'
          : 'Не вдалося увійти.') + (detail ? ` (${detail})` : ''),
      );
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Вхід або реєстрація"
        >
          <div className="absolute inset-0 bg-graphite/60 backdrop-blur-sm" />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 grid w-full max-w-3xl overflow-hidden rounded-t-3xl bg-milk shadow-soft sm:rounded-3xl md:grid-cols-2"
          >
            {/* Форма */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-full bg-sand/60 p-1 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`rounded-full px-4 py-1.5 transition ${mode === 'login' ? 'bg-espresso text-cream' : 'text-mocha'}`}
                  >
                    Вхід
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`rounded-full px-4 py-1.5 transition ${mode === 'register' ? 'bg-espresso text-cream' : 'text-mocha'}`}
                  >
                    Реєстрація
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-espresso hover:bg-espresso/5 md:hidden"
                  aria-label="Закрити"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <h2 className="mt-6 font-display text-2xl font-semibold text-espresso">
                {mode === 'login' ? 'З поверненням!' : 'Створіть акаунт'}
              </h2>

              <form onSubmit={submit} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-espresso">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-espresso/15 bg-cream px-4 py-3 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
                  />
                </label>
                <label className="block text-sm font-medium text-espresso">
                  Пароль
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="mt-1.5 w-full rounded-xl border border-espresso/15 bg-cream px-4 py-3 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
                  />
                </label>

                {message && (
                  <p className={`text-sm ${status === 'error' ? 'text-terracotta' : 'text-mocha'}`}>
                    {message}
                  </p>
                )}

                <button type="submit" disabled={status === 'loading'} className="btn-accent w-full">
                  {status === 'loading'
                    ? 'Зачекайте…'
                    : mode === 'login'
                      ? 'Увійти'
                      : 'Зареєструватися'}
                </button>
              </form>
            </div>

            {/* Переваги */}
            <div className="relative hidden flex-col justify-center bg-espresso p-8 text-cream md:flex">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-cream/80 hover:bg-cream/10"
                aria-label="Закрити"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-soft">
                Переваги реєстрації
              </p>
              <ul className="mt-5 space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-terracotta text-xs text-cream">
                      ✓
                    </span>
                    <span className="text-cream/90">{b}</span>
                  </li>
                ))}
              </ul>
              {!isSupabaseConfigured && (
                <p className="mt-8 text-xs text-cream/50">
                  Демо-режим: акаунти активуються після підключення Supabase.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
