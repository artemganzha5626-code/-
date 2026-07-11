import { getSiteContent } from '@/lib/content';
import { Navbar } from '@/components/Navbar';
import { CursorGlow } from '@/components/CursorGlow';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Menu } from '@/components/sections/Menu';
import { Gallery } from '@/components/sections/Gallery';
import { Reviews } from '@/components/sections/Reviews';
import { Contacts } from '@/components/sections/Contacts';
import { Footer } from '@/components/sections/Footer';

// Оновлюємо контент не частіше, ніж раз на 60 с (ISR).
export const revalidate = 60;

export default async function HomePage() {
  const { settings, categories, menu, gallery, reviews } = await getSiteContent();

  return (
    <>
      <CursorGlow />
      <Navbar brand={settings.name} />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <Menu categories={categories} items={menu} />
        <Gallery images={gallery} />
        <Reviews reviews={reviews} />
        <Contacts settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
