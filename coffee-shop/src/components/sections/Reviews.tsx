'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Review } from '@/types';
import { Reveal } from '@/components/Reveal';
import { StarIcon, CloseIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5 text-terracotta" aria-label={`Оцінка ${value} з 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < value ? 'text-terracotta' : 'text-latte'}`}
        />
      ))}
    </div>
  );
}

function ReviewForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setStatus('sending');
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from('reviews')
          .insert({ name: name.trim(), rating, text: text.trim(), approved: false });
        if (error) throw error;
      } else {
        // Демо-режим без Supabase — імітуємо надсилання.
        await new Promise((r) => setTimeout(r, 700));
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
          <StarIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-espresso">
          Дякуємо!
        </h3>
        <p className="mt-2 text-mocha">Ваш відгук відправлено на модерацію.</p>
        <button type="button" onClick={onClose} className="btn-primary mt-6">
          Закрити
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <h3 className="font-display text-2xl font-semibold text-espresso">Залишити відгук</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-espresso hover:bg-espresso/5"
          aria-label="Закрити"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <label className="mt-6 block text-sm font-medium text-espresso">
        Ваше ім’я
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          placeholder="Напр., Олена"
          className="mt-2 w-full rounded-xl border border-espresso/15 bg-cream px-4 py-3 text-espresso outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
        />
      </label>

      <div className="mt-5">
        <span className="text-sm font-medium text-espresso">Оцінка</span>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                onMouseEnter={() => setHover(val)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${val} з 5`}
                className="p-1"
              >
                <StarIcon
                  className={`h-8 w-8 transition-colors ${
                    val <= (hover || rating) ? 'text-terracotta' : 'text-latte'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-espresso">
        Відгук
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={600}
          rows={4}
          placeholder="Розкажіть про свій досвід…"
          className="mt-2 w-full resize-none rounded-xl border border-espresso/15 bg-cream px-4 py-3 text-espresso outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
        />
      </label>

      {status === 'error' && (
        <p className="mt-3 text-sm text-terracotta">
          Не вдалося надіслати. Спробуйте ще раз трохи згодом.
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-accent mt-6 w-full">
        {status === 'sending' ? 'Надсилаємо…' : 'Надіслати відгук'}
      </button>
    </form>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const [open, setOpen] = useState(false);
  const approved = reviews.filter((r) => r.approved);

  return (
    <section id="reviews" className="scroll-mt-20 bg-espresso py-20 text-cream sm:py-28">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal className="max-w-2xl">
            <p className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-soft">
              Відгуки
            </p>
            <h2 className="text-4xl font-semibold sm:text-5xl">Що кажуть гості</h2>
            <p className="mt-4 text-lg text-cream/70">
              Ми цінуємо кожен відгук — він допомагає нам ставати кращими.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <button type="button" onClick={() => setOpen(true)} className="btn-accent">
              Залишити відгук
            </button>
          </Reveal>
        </div>

        {approved.length === 0 ? (
          <Reveal className="mt-12 text-cream/70">
            Відгуків поки немає — станьте першим!
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {approved.slice(0, 8).map((r, i) => (
              <Reveal
                key={r.id}
                delay={(i % 4) * 0.08}
                className="flex h-full flex-col rounded-3xl bg-cream/5 p-6 ring-1 ring-cream/10 backdrop-blur"
              >
                <Stars value={r.rating} />
                <p className="mt-4 flex-1 leading-relaxed text-cream/90">“{r.text}”</p>
                <p className="mt-5 font-display text-lg font-semibold">{r.name}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Модалка форми */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Форма відгуку"
          >
            <div className="absolute inset-0 bg-graphite/60 backdrop-blur-sm" />
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl bg-milk text-left shadow-soft sm:rounded-3xl"
            >
              <ReviewForm onClose={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
