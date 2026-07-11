# ☕ BENCH — сайт кав’ярні

Атмосферний, швидкий і зручний у редагуванні сайт кав’ярні **BENCH**.
Українською мовою, з адмін-панеллю без програмування.

Побудовано на **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, з делікатними
анімаціями **Framer Motion**, точковим 3D на **React Three Fiber** та бекендом на
**Supabase** (база даних, сховище фото, авторизація).

> **Працює одразу.** Без Supabase сайт показує красиві демо-дані. Підключіть Supabase —
> і ввімкнеться реальний контент та адмінка `/admin`.

---

## ✨ Можливості

- **Головний екран** — великий заголовок, 3D-чашка кави (лінива, з fallback), кнопки
  «Дивитись меню» та «Прокласти маршрут».
- **Про кав’ярню** — історія, філософія, 3 переваги з іконками.
- **Меню** — фільтри за категоріями, картки з фото/ціною/мітками «Хіт»/«Новинка»,
  модальне вікно зі збільшеним фото.
- **Галерея** — адаптивна masonry-сітка з лайтбоксом (стрілки, Esc, свайп-кнопки).
- **Відгуки** — картки + форма (ім’я, оцінка 1–5, текст) із відправкою на модерацію.
- **Контакти** — адреса, телефон, графік, карта, кнопки «Подзвонити / Instagram / Маршрут»
  (працюють в один тап на телефоні).
- **Адмін-панель `/admin`** — редагування текстів, контактів, банера, меню, галереї та
  модерація відгуків. Завантаження фото в Supabase Storage.
- **Делікатний ефект за курсором** — м’яке кавове свічення + дрібні частинки (лише на
  десктопі, вимикається при `prefers-reduced-motion`).
- **Доступність і SEO** — контрастні кольори, великі кнопки, `title/description`,
  Open Graph, `schema.org` (CafeOrCoffeeShop), favicon, `sitemap.xml`, `robots.txt`.
- **Адаптив** — коректно від 320 px до великого монітора; iPhone, Android, планшет.

---

## 🚀 Швидкий старт (демо-режим)

```bash
cd coffee-shop
npm install
npm run dev
```

Відкрийте <http://localhost:3000> — сайт уже працює на демо-даних.

Продакшн-збірка:

```bash
npm run build
npm run start
```

---

## 🔌 Підключення Supabase (реальний контент + адмінка)

### 1. Створіть проєкт

Зареєструйтесь на <https://supabase.com> → **New project**. Дочекайтесь готовності бази.

### 2. Створіть таблиці

Supabase Dashboard → **SQL Editor** → **New query** → вставте вміст файлу
[`supabase/schema.sql`](./supabase/schema.sql) → **Run**.

Скрипт створює таблиці (`settings`, `menu_categories`, `menu_items`, `gallery_images`,
`reviews`), налаштовує **RLS** (публічне читання, захищений запис) і публічний бакет
`bench-media`, а також наповнює базу початковими даними.

### 3. Створіть змінні середовища

Скопіюйте `.env.example` у `.env.local` і заповніть:

```bash
cp .env.example .env.local
```

| Змінна | Де взяти |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Публічний домен сайту |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | там само → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | там само → **service_role** (не комітити!) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Назва бакета (за замовчуванням `bench-media`) |

### 4. Створіть адміністратора

Dashboard → **Authentication** → **Users** → **Add user** →
введіть email і пароль → **Create user** (позначте *Auto Confirm* або підтвердьте лист).

Це і буде логін до `/admin`.

### 5. Запуск

```bash
npm run dev
```

Тепер сайт бере контент із Supabase, а `/admin` вимагає входу.
Увійдіть на <http://localhost:3000/admin> створеним email/паролем.

> **Фото у next/image.** next.config.mjs уже дозволяє домени `images.unsplash.com` та
> `*.supabase.co`. Якщо додаєте фото з інших джерел — впишіть їхній домен туди ж.

---

## 🌐 Розміщення онлайн (деплой)

Найпростіше — **Vercel**:

1. Залийте репозиторій на GitHub.
2. <https://vercel.com> → **Add New → Project** → імпортуйте репозиторій.
3. **Root Directory** → вкажіть `coffee-shop`.
4. Додайте ті самі змінні середовища (розділ **Environment Variables**).
5. **Deploy**. Vercel сам виконає `npm run build`.

Підійде будь-який хостинг із підтримкою Node 18+ (Netlify, Render, власний сервер:
`npm run build && npm run start`).

---

## 🗂️ Структура проєкту

```
coffee-shop/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # шрифти, SEO-метадані, schema.org
│   │   ├── page.tsx             # головна (збірка секцій, ISR)
│   │   ├── globals.css          # тема, палітра, reduce-motion
│   │   ├── privacy/page.tsx     # політика конфіденційності
│   │   ├── sitemap.ts, robots.ts
│   │   └── admin/
│   │       ├── page.tsx         # дашборд (вкладки)
│   │       └── login/page.tsx   # вхід (Supabase Auth)
│   ├── components/
│   │   ├── Navbar.tsx           # липке меню + бургер
│   │   ├── CursorGlow.tsx       # ефект за курсором
│   │   ├── Reveal.tsx           # поява при скролі
│   │   ├── icons.tsx            # SVG-іконки
│   │   ├── three/               # 3D-чашка (R3F) + lazy-обгортка
│   │   ├── sections/            # Hero, About, Menu, Gallery, Reviews, Contacts, Footer
│   │   └── admin/               # панелі адмінки + завантажувач фото
│   ├── lib/
│   │   ├── content.ts           # отримання контенту (Supabase → fallback демо)
│   │   ├── demo-data.ts         # демо-контент
│   │   ├── hooks.ts             # reduce-motion / desktop детекція
│   │   └── supabase/            # клієнти (browser/server) + config
│   ├── types/index.ts           # доменні типи
│   └── middleware.ts            # захист /admin + оновлення сесії
├── supabase/schema.sql          # SQL-схема + RLS + seed
├── public/favicon.svg
├── .env.example
└── next.config.mjs / tailwind.config.ts / tsconfig.json
```

---

## ✅ Виконано за брифом

- [x] Next.js + TypeScript + Tailwind + Framer Motion + R3F (точкове 3D)
- [x] Адаптив 320 px → десктоп, iPhone/Android/планшет
- [x] Ліниве 3D і зображення, fallback на слабких пристроях і при reduce-motion
- [x] Тепла преміальна палітра (кремовий/бежевий/кавовий/графіт + теракота)
- [x] Елегантний заголовковий шрифт (Playfair Display) + читабельний текст (Inter)
- [x] Делікатний ефект за курсором (десктоп), вимкнення на телефонах
- [x] Усі 7 секцій + липке меню + плавний скрол + бургер
- [x] Меню з фільтрами, мітками, модалкою; галерея з лайтбоксом
- [x] Форма відгуку → «Дякуємо! Ваш відгук відправлено на модерацію»
- [x] Контакти: карта, tap-to-call, маршрут в один тап
- [x] Адмін-панель `/admin` на Supabase (Auth + DB + Storage)
- [x] `.env.example`, `supabase/schema.sql`, інструкція
- [x] Демо-дані без Supabase
- [x] SEO: title/description/OG, favicon, schema.org, sitemap, robots
- [x] Стани завантаження / порожніх даних / помилок

---

## 🎨 Як швидко змінити

| Що | Де |
| --- | --- |
| Назва, тексти, контакти, банер | `/admin` → **Налаштування** (або `src/lib/demo-data.ts` у демо) |
| Меню, категорії, ціни, мітки | `/admin` → **Меню** |
| Галерея | `/admin` → **Галерея** |
| Модерація відгуків | `/admin` → **Відгуки** |
| Кольори / шрифти | `tailwind.config.ts`, `src/app/layout.tsx` |

---

## 🧩 Команди

```bash
npm run dev     # локальна розробка (http://localhost:3000)
npm run build   # продакшн-збірка
npm run start   # запуск зібраного застосунку
npm run lint    # перевірка коду
```

Ліцензія: MIT. Логотипи третіх сторін не використовуються; демо-фото — з Unsplash.
