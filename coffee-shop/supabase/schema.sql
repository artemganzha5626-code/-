-- ============================================================
--  КАВОВА — схема бази даних Supabase
--  Виконайте у Supabase Dashboard → SQL Editor → New query.
-- ============================================================

-- ── Розширення ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Налаштування сайту (один рядок) ──────────────────────────
create table if not exists public.settings (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default 'КАВОВА',
  tagline       text default 'кав’ярня',
  description   text,
  hero_title    text,
  hero_subtitle text,
  hero_image    text,
  address       text,
  phone         text,
  hours         text,
  instagram     text,
  maps_url      text,
  map_embed     text,
  lat           double precision default 50.4501,
  lng           double precision default 30.5234,
  updated_at    timestamptz default now()
);

-- ── Категорії меню ───────────────────────────────────────────
create table if not exists public.menu_categories (
  slug        text primary key,
  name        text not null,
  sort_order  int default 0
);

-- ── Позиції меню ─────────────────────────────────────────────
create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.menu_categories(slug) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null default 0,
  image         text,
  badges        text[] default '{}',          -- 'hit' | 'new'
  sort_order    int default 0,
  available     boolean default true,
  created_at    timestamptz default now()
);

-- ── Галерея ──────────────────────────────────────────────────
create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  alt         text default 'КАВОВА',
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ── Відгуки ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  rating      int not null check (rating between 1 and 5),
  text        text not null,
  approved    boolean default false,          -- нові відгуки — на модерації
  created_at  timestamptz default now()
);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.settings        enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.gallery_images  enable row level security;
alter table public.reviews         enable row level security;

-- Публічне читання контенту --------------------------------------------------
create policy "public read settings"   on public.settings        for select using (true);
create policy "public read categories" on public.menu_categories for select using (true);
create policy "public read menu"       on public.menu_items      for select using (true);
create policy "public read gallery"    on public.gallery_images  for select using (true);

-- Відгуки: усі бачать лише схвалені; будь-хто може надіслати новий (approved=false)
create policy "public read approved reviews" on public.reviews
  for select using (approved = true);
create policy "anyone can submit review" on public.reviews
  for insert with check (approved = false);

-- Повний доступ для авторизованих адміністраторів ----------------------------
create policy "admin all settings"   on public.settings        for all to authenticated using (true) with check (true);
create policy "admin all categories" on public.menu_categories for all to authenticated using (true) with check (true);
create policy "admin all menu"       on public.menu_items      for all to authenticated using (true) with check (true);
create policy "admin all gallery"    on public.gallery_images  for all to authenticated using (true) with check (true);
create policy "admin all reviews"    on public.reviews         for all to authenticated using (true) with check (true);

-- ============================================================
--  Storage: публічний бакет для фото (bench-media)
--  Створіть бакет у Dashboard → Storage → New bucket (public),
--  назва має збігатися з NEXT_PUBLIC_SUPABASE_BUCKET.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('bench-media', 'bench-media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'bench-media');
create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'bench-media');
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'bench-media');
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'bench-media');

-- ============================================================
--  Початкове наповнення (seed) — прибирайте за потреби
-- ============================================================
insert into public.settings (name, tagline, description, hero_title, hero_subtitle, hero_image, address, phone, hours, instagram, maps_url, map_embed, lat, lng)
values (
  'КАВОВА',
  'кав’ярня',
  'КАВОВА — це затишна кав’ярня, де добірне зерно, свіжа випічка та тепле світло створюють ранок, до якого хочеться повертатися.',
  'Кава, до якої хочеться повертатися',
  'Повільна обжарка, чесний смак і місце, де приємно посидіти. Заходьте на каву — і залишайтеся на розмову.',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=70',
  'проспект Слобожанський, 67к, Дніпро, 49000',
  '+380 44 123 45 67',
  'Пн–Пт 08:00–21:00 · Сб–Нд 09:00–22:00',
  'https://www.instagram.com/kavova.ua',
  'https://www.google.com/maps/dir/?api=1&destination=%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9%2C%2067%D0%BA%2C%20%D0%94%D0%BD%D1%96%D0%BF%D1%80%D0%BE',
  'https://maps.google.com/maps?q=%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B6%D0%B0%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9%2C%2067%D0%BA%2C%20%D0%94%D0%BD%D1%96%D0%BF%D1%80%D0%BE&z=16&output=embed',
  48.5127, 35.0975
)
on conflict do nothing;

insert into public.menu_categories (slug, name, sort_order) values
  ('coffee',    'Кава',     1),
  ('tea',       'Чай',      2),
  ('breakfast', 'Сніданки', 3),
  ('desserts',  'Десерти',  4),
  ('bakery',    'Випічка',  5)
on conflict (slug) do nothing;

insert into public.menu_items (category_slug, name, description, price, image, badges, sort_order) values
  ('coffee', 'Еспресо',        'Щільна крема, темні ягоди та какао.',                55, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=70', '{hit}', 1),
  ('coffee', 'Капучино',       'Оксамитова молочна піна й баланс карамелі.',         70, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=70', '{hit}', 2),
  ('coffee', 'Флет вайт',      'Подвійний рістретто та мікропіна.',                  75, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=70', '{}',    3),
  ('bakery', 'Круасан',        'Листкове тісто на бельгійському маслі.',             65, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=70', '{hit}', 1)
on conflict do nothing;

insert into public.reviews (name, rating, text, approved) values
  ('Олена', 5, 'Найкращий флет вайт у місті. Повертаюся щоранку.', true),
  ('Андрій', 5, 'Круасани — окрема любов. Тепле світло, приємна музика.', true)
on conflict do nothing;
