'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Лайки та відгуки під окремими позиціями меню.
 * Із підключеним Supabase — спільні для всіх відвідувачів.
 * Без Supabase — локально (localStorage) як демо на цьому пристрої.
 */

const LIKES_KEY = 'kavova_likes';
const LIKED_KEY = 'kavova_liked';
const REVIEWS_KEY = 'kavova_item_reviews';

export interface ItemReview {
  name: string;
  text: string;
  created_at: string;
}

function readLocal<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Чи вже лайкнув цей пристрій (щоб не накручувати й показувати стан). */
export function hasLiked(itemId: string): boolean {
  return Boolean(readLocal<boolean>(LIKED_KEY)[itemId]);
}

function markLiked(itemId: string) {
  const liked = readLocal<boolean>(LIKED_KEY);
  liked[itemId] = true;
  writeLocal(LIKED_KEY, liked);
}

/** Кількість лайків для набору позицій (один запит). */
export async function getLikeCounts(): Promise<Record<string, number>> {
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase.from('menu_reactions').select('item_id');
    const map: Record<string, number> = {};
    (data ?? []).forEach((r: { item_id: string }) => {
      map[r.item_id] = (map[r.item_id] ?? 0) + 1;
    });
    return map;
  }
  return readLocal<number>(LIKES_KEY);
}

/** Поставити лайк. Повертає нову кількість. */
export async function addLike(itemId: string): Promise<number> {
  markLiked(itemId);
  const supabase = createClient();
  if (supabase) {
    await supabase.from('menu_reactions').insert({ item_id: itemId });
    const { count } = await supabase
      .from('menu_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId);
    return count ?? 0;
  }
  const local = readLocal<number>(LIKES_KEY);
  local[itemId] = (local[itemId] ?? 0) + 1;
  writeLocal(LIKES_KEY, local);
  return local[itemId];
}

/** Прибрати лайк (повторний тап). Повертає нову кількість. */
export async function removeLike(itemId: string): Promise<number> {
  const liked = readLocal<boolean>(LIKED_KEY);
  delete liked[itemId];
  writeLocal(LIKED_KEY, liked);

  const supabase = createClient();
  if (supabase) {
    // Прибираємо один запис лайка цієї позиції.
    const { data } = await supabase
      .from('menu_reactions')
      .select('id')
      .eq('item_id', itemId)
      .limit(1);
    if (data?.[0]) await supabase.from('menu_reactions').delete().eq('id', data[0].id);
    const { count } = await supabase
      .from('menu_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId);
    return count ?? 0;
  }
  const local = readLocal<number>(LIKES_KEY);
  local[itemId] = Math.max(0, (local[itemId] ?? 1) - 1);
  writeLocal(LIKES_KEY, local);
  return local[itemId];
}

/** Відгуки про конкретну позицію. */
export async function getItemReviews(itemId: string): Promise<ItemReview[]> {
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase
      .from('menu_item_reviews')
      .select('name,text,created_at')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });
    return (data as ItemReview[]) ?? [];
  }
  const all = readLocal<ItemReview[]>(REVIEWS_KEY);
  return all[itemId] ?? [];
}

/** Додати відгук про позицію. */
export async function addItemReview(
  itemId: string,
  name: string,
  text: string,
): Promise<ItemReview> {
  const review: ItemReview = { name, text, created_at: new Date().toISOString() };
  const supabase = createClient();
  if (supabase) {
    await supabase.from('menu_item_reviews').insert({ item_id: itemId, name, text });
    return review;
  }
  const all = readLocal<ItemReview[]>(REVIEWS_KEY);
  all[itemId] = [review, ...(all[itemId] ?? [])];
  writeLocal(REVIEWS_KEY, all);
  return review;
}
