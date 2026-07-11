'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MenuItem } from '@/types';
import { CloseIcon, HeartIcon, HeartFilledIcon } from '@/components/icons';
import { BadgePills } from '@/components/sections/BadgePills';
import { usePrefersReducedMotion } from '@/lib/hooks';
import {
  addLike,
  removeLike,
  hasLiked,
  getLikeCounts,
  getItemReviews,
  addItemReview,
  type ItemReview,
} from '@/lib/reactions';

function ItemSocial({ item }: { item: MenuItem }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState<ItemReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLiked(hasLiked(item.id));
    setShowForm(false);
    getItemReviews(item.id).then((r) => {
      if (active) setReviews(r);
    });
    getLikeCounts().then((map) => {
      if (active) setLikes(map[item.id] ?? 0);
    });
    return () => {
      active = false;
    };
  }, [item.id]);

  const toggleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikes(await removeLike(item.id));
    } else {
      setLiked(true);
      setLikes(await addLike(item.id));
      setShowForm(true); // після лайка пропонуємо залишити відгук
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    const review = await addItemReview(item.id, name.trim(), text.trim());
    setReviews((r) => [review, ...r]);
    setName('');
    setText('');
    setSending(false);
    setShowForm(false);
  };

  return (
    <div className="mt-6 border-t border-espresso/10 pt-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            liked
              ? 'bg-terracotta/15 text-terracotta'
              : 'bg-sand/70 text-mocha hover:bg-sand'
          }`}
          aria-pressed={liked}
        >
          {liked ? (
            <HeartFilledIcon className="h-4 w-4 text-terracotta" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
          Подобається
          <span className="tabular-nums">{likes}</span>
        </button>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-mocha underline-offset-4 hover:text-espresso hover:underline"
          >
            Залишити відгук
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={60}
                placeholder="Ваше ім’я"
                className="w-full rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/25"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                maxLength={400}
                rows={3}
                placeholder={`Ваш відгук про «${item.name}»`}
                className="w-full resize-none rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/25"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={sending} className="btn-accent !py-2 !text-sm">
                  {sending ? 'Надсилаємо…' : 'Опублікувати'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full px-4 py-2 text-sm text-mocha hover:bg-espresso/5"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {reviews.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-mocha/70">
            Відгуки про позицію ({reviews.length})
          </p>
          {reviews.slice(0, 6).map((r, i) => (
            <div key={i} className="rounded-2xl bg-sand/50 p-3.5">
              <p className="text-sm font-semibold text-espresso">{r.name}</p>
              <p className="mt-1 text-sm text-mocha">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (item) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.name}
        >
          <div className="absolute inset-0 bg-graphite/50 backdrop-blur-sm" />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-milk shadow-soft sm:rounded-3xl"
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-card transition hover:bg-cream"
                aria-label="Закрити"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              <div className="absolute left-4 top-4">
                <BadgePills badges={item.badges} />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-3xl font-semibold text-espresso">
                  {item.name}
                </h3>
                <span className="whitespace-nowrap font-display text-2xl font-semibold text-terracotta">
                  {item.price} ₴
                </span>
              </div>
              <p className="mt-4 text-lg leading-relaxed text-mocha">{item.description}</p>

              <ItemSocial item={item} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
