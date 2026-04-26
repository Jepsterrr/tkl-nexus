'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/components/admin/events/EventForm';
import { getEventById } from '@/lib/services/events';
import type { TKLEvent } from '@/lib/schemas/event';

export function EditEventContent() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<TKLEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEventById(id)
      .then(data => {
        if (!cancelled) {
          setEvent(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 rounded bg-[oklch(18%_0.012_265)]" />
          <div className="h-4 w-32 rounded bg-[oklch(18%_0.012_265)]" />
          <div className="h-10 w-full rounded bg-[oklch(18%_0.012_265)]" />
          <div className="h-10 w-full rounded bg-[oklch(18%_0.012_265)]" />
          <div className="h-28 w-full rounded bg-[oklch(18%_0.012_265)]" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)]">
          {error ? 'Kunde inte hämta eventet. Kontrollera anslutningen.' : 'Eventet hittades inte.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <EventForm mode="edit" initialData={event} />
    </div>
  );
}
