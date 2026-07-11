'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { CupIcon } from '@/components/icons';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { MenuPanel } from '@/components/admin/MenuPanel';
import { GalleryPanel } from '@/components/admin/GalleryPanel';
import { ReviewsPanel } from '@/components/admin/ReviewsPanel';

const tabs = [
  { key: 'settings', label: 'Налаштування' },
  { key: 'menu', label: 'Меню' },
  { key: 'gallery', label: 'Галерея' },
  { key: 'reviews', label: 'Відгуки' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>('settings');
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand/40 px-5">
        <div className="card max-w-lg p-8 text-center">
          <CupIcon className="mx-auto h-10 w-10 text-terracotta" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-espresso">
            Підключіть Supabase
          </h1>
          <p className="mt-3 text-mocha">
            Адмін-панель працює з базою даних Supabase. Додайте змінні середовища у{' '}
            <code>.env.local</code>, виконайте <code>supabase/schema.sql</code> і створіть
            адміністратора. Повна інструкція — у <strong>README.md</strong>.
          </p>
          <Link href="/" className="btn-primary mt-6">
            На головну
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand/30">
      <header className="glass sticky top-0 z-20 border-b border-espresso/10">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CupIcon className="h-6 w-6 text-terracotta" />
            <span className="font-display text-xl font-semibold text-espresso">
              BENCH · Адмінка
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm text-mocha hover:text-espresso">
              Переглянути сайт ↗
            </Link>
            <button onClick={logout} className="btn-ghost !py-2 !text-sm">
              Вийти
            </button>
          </div>
        </div>
        <div className="container-x no-scrollbar flex gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.key ? 'bg-espresso text-cream' : 'text-mocha hover:bg-espresso/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="container-x py-8">
        {tab === 'settings' && <SettingsPanel />}
        {tab === 'menu' && <MenuPanel />}
        {tab === 'gallery' && <GalleryPanel />}
        {tab === 'reviews' && <ReviewsPanel />}
      </div>
    </main>
  );
}
