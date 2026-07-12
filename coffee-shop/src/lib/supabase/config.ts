/** Централізована перевірка, чи налаштовано Supabase. */
const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const RAW_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_URL = RAW_URL.trim();
export const SUPABASE_ANON_KEY = RAW_ANON_KEY.trim();
export const SUPABASE_BUCKET =
  (process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? 'kavova-media').trim();

const URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;
// JWT: три частини в base64url, розділені крапками — лише ASCII-символи.
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Якщо змінні середовища взагалі порожні — це нормально, просто Supabase
 * ще не підключено (покажемо демо). Якщо ж значення є, але має явно
 * неправильний формат (наприклад, у поле випадково вставили опис
 * замість самого ключа) — повертаємо конкретне пояснення, а не даємо
 * зламатись із незрозумілою помилкою браузера про заголовки запиту.
 */
export const supabaseConfigError: string | null = (() => {
  if (!SUPABASE_URL && !SUPABASE_ANON_KEY) return null;

  if (!URL_RE.test(SUPABASE_URL)) {
    return `NEXT_PUBLIC_SUPABASE_URL має неправильний формат. Очікується "https://<project>.supabase.co", а зараз там: "${SUPABASE_URL.slice(0, 60)}". Перевірте змінну у Vercel — Environment Variables.`;
  }
  if (!JWT_RE.test(SUPABASE_ANON_KEY)) {
    return `NEXT_PUBLIC_SUPABASE_ANON_KEY має неправильний формат (це має бути довгий ключ із трьох частин через крапку, що починається з "eyJ"). Схоже, у змінну потрапив сторонній текст замість самого ключа. Перевірте й пересіть значення у Vercel — Environment Variables.`;
  }
  return null;
})();

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0 && !supabaseConfigError;
