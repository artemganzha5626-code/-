import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { demoContent } from '@/lib/demo-data';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-sans',
});

const s = demoContent.settings;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bench-coffee.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${s.name} — ${s.tagline} у Києві`,
    template: `%s · ${s.name}`,
  },
  description: s.description,
  keywords: ['кав’ярня', 'кава', 'кофе', 'BENCH', 'сніданки', 'Київ', 'coffee shop'],
  authors: [{ name: s.name }],
  applicationName: s.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: siteUrl,
    siteName: s.name,
    title: `${s.name} — ${s.heroTitle}`,
    description: s.description,
    images: [{ url: s.heroImage, width: 1600, height: 900, alt: `${s.name} — інтер’єр кав’ярні` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${s.name} — ${s.heroTitle}`,
    description: s.description,
    images: [s.heroImage],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg' }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: s.name,
    description: s.description,
    image: s.heroImage,
    url: siteUrl,
    telephone: s.phone,
    servesCuisine: ['Кава', 'Сніданки', 'Десерти'],
    priceRange: '₴₴',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      addressLocality: 'Київ',
      addressCountry: 'UA',
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    openingHours: 'Mo-Fr 08:00-21:00, Sa-Su 09:00-22:00',
    sameAs: [s.instagram],
  };

  return (
    <html lang="uk" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
