import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteContent } from '@/lib/content';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Політика конфіденційності',
  description: 'Як КАВОВА обробляє персональні дані відвідувачів сайту.',
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const { settings } = await getSiteContent();

  return (
    <main className="container-x max-w-3xl py-20">
      <Link href="/" className="inline-flex rotate-180 items-center text-mocha hover:text-espresso">
        <ArrowIcon className="h-5 w-5" />
        <span className="sr-only">На головну</span>
      </Link>

      <h1 className="mt-6 font-display text-4xl font-semibold text-espresso sm:text-5xl">
        Політика конфіденційності
      </h1>
      <p className="mt-4 text-mocha">Оновлено: {new Date().getFullYear()} рік</p>

      <div className="prose mt-10 space-y-6 text-mocha">
        <section>
          <h2 className="font-display text-2xl font-semibold text-espresso">Загальні положення</h2>
          <p className="mt-2 leading-relaxed">
            Ця політика описує, як кав’ярня «{settings.name}» збирає, використовує та
            захищає інформацію, яку ви надаєте під час користування сайтом.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-espresso">Які дані ми збираємо</h2>
          <p className="mt-2 leading-relaxed">
            Ми обробляємо лише ті дані, які ви добровільно залишаєте у формі відгуку —
            ім’я, оцінку та текст повідомлення. Ми не збираємо платіжні дані на цьому сайті.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-espresso">Як ми використовуємо дані</h2>
          <p className="mt-2 leading-relaxed">
            Відгуки проходять модерацію та можуть бути опубліковані на сайті. Ми не
            передаємо ваші дані третім сторонам, окрім випадків, передбачених законом.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-espresso">Контакти</h2>
          <p className="mt-2 leading-relaxed">
            З питань обробки персональних даних звертайтеся:{' '}
            {settings.phone ? `${settings.phone}, ` : ''}
            {settings.address}.
          </p>
        </section>
      </div>

      <Link href="/" className="btn-primary mt-12">
        Повернутися на головну
      </Link>
    </main>
  );
}
