import type { SiteContent } from '@/types';
import { kavovaCategories, kavovaMenu } from '@/lib/kavova-menu';

/**
 * Демо-контент КАВОВА.
 * Використовується, коли Supabase ще не підключено — сайт одразу виглядає живим.
 * Фото — з Unsplash (ліниве завантаження через next/image).
 */

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const demoContent: SiteContent = {
  live: false,
  settings: {
    name: 'КАВОВА',
    tagline: 'кав’ярня',
    description:
      'КАВОВА — затишна кав’ярня у Дніпрі на Слобожанському проспекті. Добірне зерно, свіжа випічка та тепле світло — місце, куди хочеться повертатися.',
    heroTitle: 'Кава, до якої хочеться повертатися',
    heroSubtitle:
      'Повільна обжарка, чесний смак і місце, де приємно посидіти. Заходьте на каву — і залишайтеся на розмову.',
    heroImage: img('1442512595331-e89e73853f31', 1600),
    address: 'проспект Слобожанський, 67к, Дніпро, 49000',
    // Телефон-заповнювач — змініть у /admin або тут.
    phone: '+380 67 000 00 00',
    hours: 'Пн–Пт 08:00–21:00 · Сб–Нд 09:00–22:00',
    instagram: 'https://www.instagram.com/kavova.ua',
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      'проспект Слобожанський, 67к, Дніпро',
    )}`,
    mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(
      'проспект Слобожанський, 67к, Дніпро',
    )}&z=16&output=embed`,
    lat: 48.5127,
    lng: 35.0975,
  },
  categories: kavovaCategories,
  menu: kavovaMenu,
  gallery: [
    { id: 'g1', url: img('1554118811-1e0d58224f24', 900), alt: 'Затишний інтер’єр кав’ярні КАВОВА', sortOrder: 1 },
    { id: 'g2', url: img('1521017432531-fbd92d768814', 900), alt: 'Бариста готує каву', sortOrder: 2 },
    { id: 'g3', url: img('1447933601403-0c6688de566e', 900), alt: 'Чашка кави з латте-артом', sortOrder: 3 },
    { id: 'g4', url: img('1495474472287-4d71bcdd2085', 900), alt: 'Альтернативне заварювання', sortOrder: 4 },
    { id: 'g5', url: img('1509440159596-0249088772ff', 900), alt: 'Свіжа випічка', sortOrder: 5 },
    { id: 'g6', url: img('1445116572660-236099ec97a0', 900), alt: 'Сніданок на дерев’яному столі', sortOrder: 6 },
    { id: 'g7', url: img('1453614512568-c4024d13c247', 900), alt: 'Кавові зерна', sortOrder: 7 },
    { id: 'g8', url: img('1481833761820-0509d3217039', 900), alt: 'Тепле світло у залі', sortOrder: 8 },
  ],
  reviews: [
    {
      id: 'r1',
      name: 'Олена',
      rating: 5,
      text: 'Найкращий флет вайт у місті. Атмосфера така, що не хочеться йти. Повертаюся щоранку.',
      approved: true,
      createdAt: '2026-05-12T09:20:00Z',
    },
    {
      id: 'r2',
      name: 'Андрій',
      rating: 5,
      text: 'Круасани — окрема любов. Тепле світло, приємна музика, привітні баристи.',
      approved: true,
      createdAt: '2026-05-28T14:05:00Z',
    },
    {
      id: 'r3',
      name: 'Марія',
      rating: 4,
      text: 'Дуже смачна фільтр-кава і чудові сніданки. У вихідні буває людно, але воно того варте.',
      approved: true,
      createdAt: '2026-06-03T11:40:00Z',
    },
    {
      id: 'r4',
      name: 'Дмитро',
      rating: 5,
      text: 'Ідеальне місце попрацювати з ноутбуком за чашкою рафу. Wi-Fi та розетки — велике дякую.',
      approved: true,
      createdAt: '2026-06-19T16:15:00Z',
    },
  ],
};
