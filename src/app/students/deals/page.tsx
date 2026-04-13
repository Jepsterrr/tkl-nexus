import type { Metadata } from 'next';
import { DealsContent } from './DealsContent';

export const metadata: Metadata = {
  title: 'Nexus Deals – TKL Nexus',
  description:
    'Exklusiva rabatter och förmåner för kårmedlemmar i Teknologkåren vid LTU. Se alla Nexus Deals.',
  openGraph: {
    title: 'Nexus Deals – TKL Nexus',
    description:
      'Exklusiva rabatter och förmåner för kårmedlemmar i Teknologkåren vid LTU. Se alla Nexus Deals.',
    url: 'https://tklnexus.se/students/deals',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function DealsPage() {
  return <DealsContent />;
}
