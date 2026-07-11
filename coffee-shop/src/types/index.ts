export type Badge = 'hit' | 'new';

export interface MenuItem {
  id: string;
  categorySlug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badges: Badge[];
  sortOrder: number;
  available: boolean;
}

export interface MenuCategory {
  slug: string;
  name: string;
  sortOrder: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number; // 1..5
  text: string;
  approved: boolean;
  createdAt: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  address: string;
  phone: string;
  hours: string;
  instagram: string;
  mapsUrl: string;
  mapEmbed: string;
  lat: number;
  lng: number;
}

export interface SiteContent {
  settings: SiteSettings;
  categories: MenuCategory[];
  menu: MenuItem[];
  gallery: GalleryImage[];
  reviews: Review[];
  /** true, якщо дані реальні з Supabase; false — демо-контент. */
  live: boolean;
}
