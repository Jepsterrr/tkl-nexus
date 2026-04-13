import type { Metadata } from 'next';
import { EventsContent } from './EventsContent';

export const metadata: Metadata = {
  title: 'Events | TKL Nexus',
  description:
    'Kommande events och aktiviteter från TKL Nexus — arbetsmarknadsdagar, mingel och sektionsaktiviteter vid LTU.',
  openGraph: {
    title: 'Events | TKL Nexus',
    description:
      'Kommande events och aktiviteter från TKL Nexus — arbetsmarknadsdagar, mingel och sektionsaktiviteter vid LTU.',
    url: 'https://tklnexus.se/events',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function EventsPage() {
  return <EventsContent />;
}
