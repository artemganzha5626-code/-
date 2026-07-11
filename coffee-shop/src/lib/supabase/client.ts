'use client';

import { createBrowserClient } from '@supabase/ssr';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from './config';

/**
 * Браузерний клієнт Supabase для адмін-панелі.
 * Повертає null, якщо Supabase ще не налаштовано.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
