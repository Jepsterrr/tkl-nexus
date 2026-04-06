import type { Metadata } from 'next';
import { EventsContent } from './EventsContent';

export const metadata: Metadata = {
  title: 'Events | TKL Nexus',
  description:
    'Kommande events och aktiviteter från TKL Nexus — arbetsmarknadsdagar, mingel och sektionsaktiviteter vid LTU.',
};

export default function EventsPage() {
  return <EventsContent />;
}
