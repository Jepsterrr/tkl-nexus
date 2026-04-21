import type { Metadata } from 'next';
import { EventsContent } from './EventsContent';

export const metadata: Metadata = {
  alternates: { canonical: '/events' },
  title: 'Karriärevent & Arbetsmarknadsdagar vid LTU',
  description:
    'Kommande karriärevent, arbetsmarknadsdagar, företagsmingel och sektionsaktiviteter vid Luleå tekniska universitet. Nätverka med teknik- och industriföretag i Norrbotten.',
  keywords: [
    'arbetsmarknadsdagar LTU', 'karriärevent Luleå', 'företagsmingel LTU',
    'nätverkande ingenjörsstudenter', 'events Teknologkåren', 'LUDD events Luleå',
    'sektionsaktiviteter LTU', 'campus events Luleå tekniska',
  ],
  openGraph: {
    title: 'Karriärevent & Arbetsmarknadsdagar vid LTU',
    description:
      'Kommande karriärevent, arbetsmarknadsdagar och företagsmingel vid Luleå tekniska universitet. Nätverka med teknik- och industriföretag i Norrbotten.',
    url: 'https://tklnexus.se/events',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function EventsPage() {
  return <EventsContent />;
}
