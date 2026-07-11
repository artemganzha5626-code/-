import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from './config';

/**
 * Серверний клієнт Supabase (Server Components / Route Handlers / middleware helpers).
 * Повертає null, якщо Supabase не налаштовано.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Виклик із Server Component — cookies можна ігнорувати,
          // сесію оновить middleware.
        }
      },
    },
  });
}
