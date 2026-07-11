'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/use-user';
import { UserIcon } from '@/components/icons';
import { AuthModal } from '@/components/auth/AuthModal';

export function AccountButton({ light = false }: { light?: boolean }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    setMenu(false);
  };

  const base = light
    ? 'text-cream ring-cream/30 hover:bg-cream/10'
    : 'text-espresso ring-espresso/15 hover:bg-espresso/5';

  if (user) {
    const label = user.email?.[0]?.toUpperCase() ?? 'U';
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-sm font-semibold text-cream"
          aria-label="Мій акаунт"
        >
          {label}
        </button>
        {menu && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-milk p-2 shadow-soft ring-1 ring-espresso/10">
            <p className="truncate px-3 py-2 text-xs text-mocha">{user.email}</p>
            <button
              type="button"
              onClick={logout}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-espresso hover:bg-espresso/5"
            >
              Вийти
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${base}`}
      >
        <UserIcon className="h-4 w-4" />
        Увійти
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
