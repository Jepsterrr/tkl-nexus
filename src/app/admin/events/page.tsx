import type { Metadata } from 'next';
import { EventsContent } from './EventsContent';

export const metadata: Metadata = { title: 'Events — TKL Admin' };

export default function EventsPage() {
  return <EventsContent />;
}
