'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/admin/ui';
import { StarIcon } from '@/components/icons';

type R = {
  id: string;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
};

export function ReviewsPanel() {
  const [reviews, setReviews] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return setLoading(false);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setReviews((data as R[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setApproved = async (id: string, approved: boolean) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from('reviews').update({ approved }).eq('id', id);
    load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    if (!confirm('Видалити відгук?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    load();
  };

  if (loading) return <p className="text-mocha">Завантаження…</p>;

  const shown = reviews.filter((r) =>
    filter === 'all' ? true : filter === 'approved' ? r.approved : !r.approved,
  );

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'pending', label: `На модерації (${reviews.filter((r) => !r.approved).length})` },
    { key: 'approved', label: 'Опубліковані' },
    { key: 'all', label: 'Усі' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === t.key ? 'bg-espresso text-cream' : 'bg-milk text-mocha ring-1 ring-espresso/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-mocha">Немає відгуків у цій вкладці.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <Card key={r.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold text-espresso">{r.name}</span>
                  <span className="flex text-terracotta">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? '' : 'text-latte'}`} />
                    ))}
                  </span>
                  {!r.approved && (
                    <span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-xs text-terracotta">
                      на модерації
                    </span>
                  )}
                </div>
                <p className="mt-2 text-mocha">{r.text}</p>
              </div>
              <div className="flex flex-none gap-2">
                {r.approved ? (
                  <button
                    onClick={() => setApproved(r.id, false)}
                    className="rounded-full px-3 py-2 text-sm text-mocha ring-1 ring-espresso/15 hover:bg-espresso/5"
                  >
                    Приховати
                  </button>
                ) : (
                  <button onClick={() => setApproved(r.id, true)} className="btn-primary !py-2 !text-sm">
                    Схвалити
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-full px-3 py-2 text-sm text-terracotta hover:bg-terracotta/10"
                >
                  Видалити
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
