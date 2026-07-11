'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Field, TextArea, Card } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';

type Category = { slug: string; name: string; sort_order: number };
type Item = {
  id?: string;
  category_slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badges: string[];
  sort_order: number;
  available: boolean;
  _new?: boolean;
};

export function MenuPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return setLoading(false);
    const [c, i] = await Promise.all([
      supabase.from('menu_categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*').order('sort_order'),
    ]);
    setCategories((c.data as Category[]) ?? []);
    setItems((i.data as Item[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Категорії ─────────────────────────────── */
  const addCategory = () =>
    setCategories((cs) => [...cs, { slug: '', name: '', sort_order: cs.length + 1 }]);

  const saveCategory = async (cat: Category) => {
    const supabase = createClient();
    if (!supabase || !cat.slug || !cat.name) return;
    await supabase.from('menu_categories').upsert(cat);
    load();
  };

  const deleteCategory = async (slug: string) => {
    const supabase = createClient();
    if (!supabase) return;
    if (!confirm('Видалити категорію разом з позиціями?')) return;
    await supabase.from('menu_categories').delete().eq('slug', slug);
    load();
  };

  /* ── Позиції ───────────────────────────────── */
  const addItem = () =>
    setItems((it) => [
      {
        category_slug: categories[0]?.slug ?? '',
        name: '',
        description: '',
        price: 0,
        image: '',
        badges: [],
        sort_order: it.length + 1,
        available: true,
        _new: true,
      },
      ...it,
    ]);

  const saveItem = async (item: Item) => {
    const supabase = createClient();
    if (!supabase || !item.name || !item.category_slug) return;
    const { _new, ...payload } = item;
    if (item.id) {
      await supabase.from('menu_items').update(payload).eq('id', item.id);
    } else {
      await supabase.from('menu_items').insert(payload);
    }
    load();
  };

  const deleteItem = async (item: Item) => {
    const supabase = createClient();
    if (!supabase) return;
    if (item.id) {
      if (!confirm('Видалити позицію?')) return;
      await supabase.from('menu_items').delete().eq('id', item.id);
      load();
    } else {
      setItems((it) => it.filter((x) => x !== item));
    }
  };

  const patchItem = (target: Item, patch: Partial<Item>) =>
    setItems((it) => it.map((x) => (x === target ? { ...x, ...patch } : x)));

  if (loading) return <p className="text-mocha">Завантаження…</p>;

  return (
    <div className="space-y-8">
      {/* Категорії */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-espresso">Категорії</h3>
          <button onClick={addCategory} className="btn-ghost !py-2 !text-sm">
            + Категорія
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat, idx) => (
            <Card key={idx} className="flex items-end gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <Field
                  label="Назва"
                  value={cat.name}
                  onChange={(v) =>
                    setCategories((cs) => cs.map((c, i) => (i === idx ? { ...c, name: v } : c)))
                  }
                />
                <Field
                  label="Slug"
                  value={cat.slug}
                  onChange={(v) =>
                    setCategories((cs) => cs.map((c, i) => (i === idx ? { ...c, slug: v } : c)))
                  }
                />
                <Field
                  label="Порядок"
                  type="number"
                  value={cat.sort_order}
                  onChange={(v) =>
                    setCategories((cs) =>
                      cs.map((c, i) => (i === idx ? { ...c, sort_order: Number(v) } : c)),
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => saveCategory(cat)} className="btn-primary !px-3 !py-2 !text-xs">
                  ✓
                </button>
                <button
                  onClick={() => deleteCategory(cat.slug)}
                  className="rounded-full px-3 py-2 text-xs text-terracotta hover:bg-terracotta/10"
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Позиції */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-espresso">Позиції меню</h3>
          <button onClick={addItem} className="btn-accent !py-2 !text-sm">
            + Позиція
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <Card key={item.id ?? `new-${idx}`} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Назва" value={item.name} onChange={(v) => patchItem(item, { name: v })} />
                <label className="block text-sm font-medium text-espresso">
                  Категорія
                  <select
                    value={item.category_slug}
                    onChange={(e) => patchItem(item, { category_slug: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-espresso/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-terracotta"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <TextArea
                label="Опис"
                value={item.description}
                onChange={(v) => patchItem(item, { description: v })}
                rows={2}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Ціна, ₴"
                  type="number"
                  value={item.price}
                  onChange={(v) => patchItem(item, { price: Number(v) })}
                />
                <Field
                  label="Порядок"
                  type="number"
                  value={item.sort_order}
                  onChange={(v) => patchItem(item, { sort_order: Number(v) })}
                />
                <div className="flex items-end gap-4 pb-1 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.badges?.includes('hit')}
                      onChange={(e) =>
                        patchItem(item, {
                          badges: e.target.checked
                            ? [...(item.badges ?? []), 'hit']
                            : item.badges.filter((b) => b !== 'hit'),
                        })
                      }
                    />
                    Хіт
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.badges?.includes('new')}
                      onChange={(e) =>
                        patchItem(item, {
                          badges: e.target.checked
                            ? [...(item.badges ?? []), 'new']
                            : item.badges.filter((b) => b !== 'new'),
                        })
                      }
                    />
                    Новинка
                  </label>
                </div>
              </div>
              <ImageUploader value={item.image} onChange={(v) => patchItem(item, { image: v })} />
              <div className="flex items-center gap-3">
                <button onClick={() => saveItem(item)} className="btn-primary !py-2 !text-sm">
                  Зберегти
                </button>
                <button
                  onClick={() => deleteItem(item)}
                  className="rounded-full px-4 py-2 text-sm text-terracotta hover:bg-terracotta/10"
                >
                  Видалити
                </button>
                <label className="ml-auto flex items-center gap-2 text-sm text-mocha">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) => patchItem(item, { available: e.target.checked })}
                  />
                  Доступно
                </label>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
