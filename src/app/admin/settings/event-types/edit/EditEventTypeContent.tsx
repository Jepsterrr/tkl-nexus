'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventTypeForm } from '@/components/admin/settings/EventTypeForm';
import { getAllEventTypes } from '@/lib/services/eventTypes';
import type { TKLEventType } from '@/lib/schemas/eventType';

export function EditEventTypeContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const [eventType, setEventType] = useState<TKLEventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    getAllEventTypes()
      .then((types) => {
        const found = types.find((t) => t.id === id) ?? null;
        setEventType(found);
        if (!found) setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  if (loading) return <p className="p-6 text-sm text-[oklch(55%_0.02_265)]">Laddar…</p>;
  if (error || !eventType) return <p className="p-6 text-sm text-red-400">Eventtypen hittades inte.</p>;
  return <EventTypeForm initial={eventType} />;
}
