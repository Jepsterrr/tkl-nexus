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
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'Events', item: 'https://tklnexus.se/events' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <EventsContent />
    </>
  );
}
