import type { Metadata } from 'next';
import { EventForm } from '@/components/admin/events/EventForm';

export const metadata: Metadata = { title: 'Nytt event — TKL Admin' };

export default function NewEventPage() {
  return (
    <div className="p-6 sm:p-8">
      <EventForm mode="create" />
    </div>
  );
}
