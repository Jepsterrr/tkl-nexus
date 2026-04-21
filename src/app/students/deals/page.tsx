import type { Metadata } from 'next';
import { DealsContent } from './DealsContent';

export const metadata: Metadata = {
  alternates: { canonical: '/students/deals' },
  title: 'Studentförmåner & Rabatter för LTU-studenter | Nexus Deals',
  description:
    'Exklusiva rabatter, erbjudanden och förmåner för kårmedlemmar i Teknologkåren vid Luleå tekniska universitet. Spara pengar som LTU-student med Nexus Deals.',
  keywords: [
    'studentförmåner LTU', 'studentrabatt Luleå', 'kårförmåner Teknologkåren',
    'nexus deals', 'rabatter LTU-studenter', 'erbjudanden kårmedlem LTU',
  ],
  openGraph: {
    title: 'Studentförmåner & Rabatter för LTU-studenter | Nexus Deals',
    description:
      'Exklusiva rabatter och förmåner för kårmedlemmar i Teknologkåren vid Luleå tekniska universitet.',
    url: 'https://tklnexus.se/students/deals',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function DealsPage() {
  return <DealsContent />;
}
