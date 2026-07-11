'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Field, Card } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';

type G = { id?: string; url: string; alt: string; sort_order: number };

export function GalleryPanel() {
  const [images, setImages] = useState<G[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<G>({ url: '', alt: '', sort_order: 1 });

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
    setImages((data as G[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    const supabase = createClient();
    if (!supabase || !draft.url) return;
    await supabase.from('gallery_images').insert(draft);
    setDraft({ url: '', alt: '', sort_order: images.length + 1 });
    load();
  };

  const remove = async (id?: string) => {
    const supabase = createClient();
    if (!supabase || !id) return;
    if (!confirm('Видалити зображення?')) return;
    await supabase.from('gallery_images').delete().eq('id', id);
    load();
  };

  if (loading) return <p className="text-mocha">Завантаження…</p>;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-espresso">Додати зображення</h3>
        <ImageUploader value={draft.url} onChange={(v) => setDraft((d) => ({ ...d, url: v }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Опис (alt)" value={draft.alt} onChange={(v) => setDraft((d) => ({ ...d, alt: v }))} />
          <Field
            label="Порядок"
            type="number"
            value={draft.sort_order}
            onChange={(v) => setDraft((d) => ({ ...d, sort_order: Number(v) }))}
          />
        </div>
        <button onClick={add} className="btn-accent !py-2 !text-sm">
          + Додати в галерею
        </button>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl ring-1 ring-espresso/10">
            <div className="relative aspect-square">
              <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
            </div>
            <button
              onClick={() => remove(img.id)}
              className="absolute right-2 top-2 rounded-full bg-cream/90 px-2.5 py-1 text-xs font-medium text-terracotta opacity-0 transition group-hover:opacity-100"
            >
              Видалити
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-mocha">Галерея порожня.</p>}
      </div>
    </div>
  );
}
