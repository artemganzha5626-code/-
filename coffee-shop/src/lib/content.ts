import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { demoContent } from '@/lib/demo-data';
import type {
  SiteContent,
  SiteSettings,
  MenuCategory,
  MenuItem,
  GalleryImage,
  Review,
  Badge,
} from '@/types';

/**
 * Головна точка отримання контенту.
 * Якщо Supabase налаштовано і дані є — повертає «живий» контент,
 * інакше акуратно відкочується до демо-даних (сайт завжди виглядає повним).
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return demoContent;

  try {
    const supabase = createClient();
    if (!supabase) return demoContent;

    const [settingsRes, categoriesRes, menuRes, galleryRes, reviewsRes] =
      await Promise.all([
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
        supabase.from('gallery_images').select('*').order('sort_order'),
        supabase
          .from('reviews')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false }),
      ]);

    // Якщо базові таблиці порожні — показуємо демо, щоб не було пустого сайту.
    if (!settingsRes.data || !categoriesRes.data?.length) {
      return demoContent;
    }

    const settings = mapSettings(settingsRes.data);
    const categories = (categoriesRes.data ?? []).map(mapCategory);
    const menu = (menuRes.data ?? []).map(mapMenuItem);
    const gallery = (galleryRes.data ?? []).map(mapGallery);
    const reviews = (reviewsRes.data ?? []).map(mapReview);

    return {
      live: true,
      settings,
      categories,
      menu: menu.length ? menu : demoContent.menu,
      gallery: gallery.length ? gallery : demoContent.gallery,
      reviews: reviews.length ? reviews : demoContent.reviews,
    };
  } catch (error) {
    console.error('[content] Не вдалося завантажити з Supabase, показуємо демо:', error);
    return demoContent;
  }
}

/* ── Маппери БД → доменні типи ─────────────────────────────── */

function mapSettings(row: Record<string, any>): SiteSettings {
  const d = demoContent.settings;
  return {
    name: row.name ?? d.name,
    tagline: row.tagline ?? d.tagline,
    description: row.description ?? d.description,
    heroTitle: row.hero_title ?? d.heroTitle,
    heroSubtitle: row.hero_subtitle ?? d.heroSubtitle,
    heroImage: row.hero_image ?? d.heroImage,
    address: row.address ?? d.address,
    phone: row.phone ?? d.phone,
    hours: row.hours ?? d.hours,
    instagram: row.instagram ?? d.instagram,
    mapsUrl: row.maps_url ?? d.mapsUrl,
    mapEmbed: row.map_embed ?? d.mapEmbed,
    lat: row.lat ?? d.lat,
    lng: row.lng ?? d.lng,
  };
}

function mapCategory(row: Record<string, any>): MenuCategory {
  return {
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapMenuItem(row: Record<string, any>): MenuItem {
  return {
    id: String(row.id),
    categorySlug: row.category_slug,
    name: row.name,
    group: row.group ?? undefined,
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    image: row.image ?? '',
    badges: (row.badges ?? []) as Badge[],
    sortOrder: row.sort_order ?? 0,
    available: row.available ?? true,
  };
}

function mapGallery(row: Record<string, any>): GalleryImage {
  return {
    id: String(row.id),
    url: row.url,
    alt: row.alt ?? 'BENCH',
    sortOrder: row.sort_order ?? 0,
  };
}

function mapReview(row: Record<string, any>): Review {
  return {
    id: String(row.id),
    name: row.name,
    rating: Number(row.rating ?? 5),
    text: row.text ?? '',
    approved: row.approved ?? false,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}
