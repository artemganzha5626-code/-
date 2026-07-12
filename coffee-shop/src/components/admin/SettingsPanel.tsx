'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Field, TextArea, Card, SaveBar } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';

type Row = Record<string, any>;

export function SettingsPanel() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      if (!supabase) return setLoading(false);
      const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      setRow(data ?? { name: 'КАВОВА' });
      setLoading(false);
    })();
  }, []);

  const set = (k: string, v: any) => {
    setRow((r) => ({ ...(r ?? {}), [k]: v }));
    setSaved(false);
  };

  const save = async () => {
    const supabase = createClient();
    if (!supabase || !row) return;
    setSaving(true);
    const payload = { ...row, updated_at: new Date().toISOString() };
    const query = row.id
      ? supabase.from('settings').update(payload).eq('id', row.id)
      : supabase.from('settings').insert(payload);
    const { error } = await query;
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (!row.id) {
        const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (data) setRow(data);
      }
    }
  };

  if (loading) return <p className="text-mocha">Завантаження…</p>;
  if (!row) return <p className="text-mocha">Немає з’єднання з Supabase.</p>;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-espresso">Основне</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Назва кав’ярні" value={row.name ?? ''} onChange={(v) => set('name', v)} />
          <Field label="Підзаголовок (tagline)" value={row.tagline ?? ''} onChange={(v) => set('tagline', v)} />
        </div>
        <TextArea label="Короткий опис" value={row.description ?? ''} onChange={(v) => set('description', v)} />
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-espresso">Головний банер</h3>
        <Field label="Заголовок Hero" value={row.hero_title ?? ''} onChange={(v) => set('hero_title', v)} />
        <TextArea label="Підзаголовок Hero" value={row.hero_subtitle ?? ''} onChange={(v) => set('hero_subtitle', v)} />
        <ImageUploader label="Фонове фото Hero" value={row.hero_image ?? ''} onChange={(v) => set('hero_image', v)} />
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-espresso">Контакти</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Адреса" value={row.address ?? ''} onChange={(v) => set('address', v)} />
          <Field label="Телефон" value={row.phone ?? ''} onChange={(v) => set('phone', v)} />
          <Field label="Графік роботи" value={row.hours ?? ''} onChange={(v) => set('hours', v)} />
          <Field label="Instagram (URL)" value={row.instagram ?? ''} onChange={(v) => set('instagram', v)} />
          <Field label="Посилання на маршрут" value={row.maps_url ?? ''} onChange={(v) => set('maps_url', v)} />
          <Field label="Embed-карта (iframe src)" value={row.map_embed ?? ''} onChange={(v) => set('map_embed', v)} />
          <Field label="Широта (lat)" type="number" value={row.lat ?? ''} onChange={(v) => set('lat', parseFloat(v))} />
          <Field label="Довгота (lng)" type="number" value={row.lng ?? ''} onChange={(v) => set('lng', parseFloat(v))} />
        </div>
      </Card>

      <SaveBar saving={saving} saved={saved} onSave={save} />
    </div>
  );
}
