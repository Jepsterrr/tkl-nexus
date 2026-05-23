import type { Metadata } from 'next';
import { EventTypesContent } from './EventTypesContent';

export const metadata: Metadata = { title: 'Eventtyper — TKL Admin' };

export default function EventTypesPage() {
  return <EventTypesContent />;
}
