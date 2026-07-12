import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

/**
 * Публічний клієнт для читання відкритого контенту (меню, галерея, відгуки).
 * На відміну від серверного клієнта в server.ts, НЕ читає cookies — тому
 * безпечний для статичної генерації/ISR (не конфліктує з revalidate).
 * Використовуйте лише там, де не потрібна сесія користувача.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
