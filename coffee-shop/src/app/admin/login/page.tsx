'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { CupIcon } from '@/components/icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError('Supabase не налаштовано.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Невірний email або пароль.');
      setLoading(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand/40 px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-espresso">
          <CupIcon className="h-7 w-7 text-terracotta" />
          <span className="font-display text-3xl font-semibold">КАВОВА</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold text-espresso">
            Вхід до адмін-панелі
          </h1>
          <p className="mt-2 text-sm text-mocha">
            Керуйте контентом кав’ярні без програмування.
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-xl bg-terracotta/10 p-4 text-sm text-mocha">
              Supabase ще не підключено. Додайте змінні у <code>.env.local</code> і створіть
              адміністратора — інструкція у <strong>README</strong>.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-espresso">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-espresso/15 bg-cream px-4 py-3 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
              />
            </label>
            <label className="block text-sm font-medium text-espresso">
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-espresso/15 bg-cream px-4 py-3 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
              />
            </label>

            {error && <p className="text-sm text-terracotta">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Входимо…' : 'Увійти'}
            </button>
          </form>
        </div>

        <Link href="/" className="mt-6 block text-center text-sm text-mocha hover:text-espresso">
          ← На головну
        </Link>
      </div>
    </main>
  );
}
