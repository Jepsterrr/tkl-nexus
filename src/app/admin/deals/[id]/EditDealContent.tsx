'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DealForm } from '@/components/admin/deals/DealForm';
import { getDealById } from '@/lib/services/deals';
import type { TKLDeal } from '@/lib/schemas/deal';

export function EditDealContent() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal]     = useState<TKLDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDealById(id)
      .then(data => {
        if (!cancelled) { setDeal(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
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

  if (error || !deal) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)]">
          {error ? 'Kunde inte hämta dealen. Kontrollera anslutningen.' : 'Dealen hittades inte.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <DealForm mode="edit" initialData={deal} />
    </div>
  );
}
