import type { Metadata } from 'next';
import { EventTypeForm } from '@/components/admin/settings/EventTypeForm';

export const metadata: Metadata = { title: 'Ny eventtyp — TKL Admin' };

export default function NewEventTypePage() {
  return <EventTypeForm />;
}
