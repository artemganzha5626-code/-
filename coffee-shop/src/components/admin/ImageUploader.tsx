'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_BUCKET } from '@/lib/supabase/config';

/**
 * Завантажує зображення у Supabase Storage і повертає публічний URL.
 */
export function ImageUploader({
  value,
  onChange,
  label = 'Фото',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error('no-supabase');
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError('Не вдалося завантажити. Або вставте URL вручну.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-espresso">{label}</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-sand ring-1 ring-espresso/10">
          {value ? (
            <Image src={value} alt="Прев’ю" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-mocha/50">
              нема
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            className="block w-full text-sm text-mocha file:mr-3 file:rounded-lg file:border-0 file:bg-espresso file:px-3 file:py-2 file:text-cream"
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="або вставте URL зображення"
            className="w-full rounded-lg border border-espresso/15 bg-cream px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </div>
      </div>
      {uploading && <p className="mt-1 text-xs text-mocha">Завантаження…</p>}
      {error && <p className="mt-1 text-xs text-terracotta">{error}</p>}
    </div>
  );
}
