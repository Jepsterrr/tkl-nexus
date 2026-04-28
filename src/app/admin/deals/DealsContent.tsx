'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';
import { getAllDeals, deleteDeal, toggleDealPublished } from '@/lib/services/deals';
import type { TKLDeal } from '@/lib/schemas/deal';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

type FilterMode = 'all' | 'published' | 'draft';

export function DealsContent() {
  const [deals, setDeals]       = useState<TKLDeal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [filter, setFilter]     = useState<FilterMode>('all');

  const [toggling, setToggling]         = useState<Record<string, boolean>>({});
  const [toggleError, setToggleError]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TKLDeal | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getAllDeals()
      .then(data => {
        if (!cancelled) { setDeals(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [fetchKey]);

  useEffect(() => {
    const onFocus = () => setFetchKey(k => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleToggle = async (deal: TKLDeal) => {
    setToggleError(null);
    setToggling(t => ({ ...t, [deal.id]: true }));
    try {
      await toggleDealPublished(deal.id, deal.published);
      setDeals(ds => ds.map(d => d.id === deal.id ? { ...d, published: !d.published } : d));
    } catch {
      setToggleError('Kunde inte ändra publiceringsstatus. Försök igen.');
    } finally {
      setToggling(t => ({ ...t, [deal.id]: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteDeal(deleteTarget.id);
      setDeals(ds => ds.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError('Kunde inte ta bort dealen. Försök igen.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = deals.filter(d => {
    if (filter === 'published') return d.published;
    if (filter === 'draft')     return !d.published;
    return true;
  });

  return (
    <div className="min-h-full bg-[oklch(12%_0.01_265)] text-[oklch(88%_0.01_265)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-(family-name:--font-heading) text-2xl font-bold text-[oklch(88%_0.01_265)]">
            Deals
          </h1>
          <Link
            href="/admin/deals/new"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] transition-colors"
          >
            Ny deal
          </Link>
        </div>

        {/* Filterrad */}
        <div className="flex gap-2 mb-6" role="group" aria-label="Filtrera deals">
          {(['all', 'published', 'draft'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              aria-pressed={filter === mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === mode
                  ? 'bg-[oklch(55%_0.12_265)] text-white'
                  : 'bg-[oklch(18%_0.012_265)] text-[oklch(50%_0.02_265)] hover:text-[oklch(75%_0.01_265)]'
              }`}
            >
              {mode === 'all' ? 'Alla' : mode === 'published' ? 'Publicerade' : 'Utkast'}
            </button>
          ))}
        </div>

        {/* Fel-alerts */}
        {toggleError && (
          <p className="mb-4 text-xs text-[oklch(65%_0.2_25)]" role="alert">{toggleError}</p>
        )}
        {deleteError && (
          <p className="mb-4 text-xs text-[oklch(65%_0.2_25)]" role="alert">{deleteError}</p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-px" aria-busy="true" aria-label="Laddar deals">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 rounded-lg animate-pulse bg-[oklch(18%_0.012_265)]"
              >
                <div className="w-8 h-8 rounded-full bg-[oklch(22%_0.012_265)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-[oklch(22%_0.012_265)]" />
                  <div className="h-3 w-32 rounded bg-[oklch(22%_0.012_265)]" />
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded bg-[oklch(22%_0.012_265)]" />
                  <div className="w-7 h-7 rounded bg-[oklch(22%_0.012_265)]" />
                  <div className="w-7 h-7 rounded bg-[oklch(22%_0.012_265)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fel */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-[oklch(65%_0.2_25)]">
              Kunde inte hämta deals. Kontrollera anslutningen.
            </p>
            <button
              type="button"
              onClick={() => setFetchKey(k => k + 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[oklch(18%_0.012_265)] text-[oklch(55%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors"
            >
              Försök igen
            </button>
          </div>
        )}

        {/* Tom state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-[oklch(50%_0.02_265)]">Inga deals ännu.</p>
            <Link
              href="/admin/deals/new"
              className="text-sm font-medium text-[oklch(55%_0.12_265)] hover:text-[oklch(65%_0.12_265)] transition-colors underline underline-offset-2"
            >
              Skapa den första
            </Link>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filtered.length > 0 && (
          <ul className="space-y-px" role="list" aria-label="Deallista">
            {filtered.map(deal => (
              <li
                key={deal.id}
                className={`flex items-center gap-4 px-4 py-3 mt-1 rounded-lg border border-[oklch(18%_0.012_265)] transition-colors ${
                  deal.published
                    ? 'bg-[oklch(55%_0.12_265/8%)]'
                    : 'bg-[oklch(75%_0.12_60/8%)]'
                }`}
              >
                {/* Logotyp eller initial */}
                <div
                  className="w-8 h-8 shrink-0 rounded-full bg-[oklch(22%_0.012_265)] flex items-center justify-center overflow-hidden"
                  aria-hidden="true"
                >
                  {deal.logoUrl ? (
                    <img
                      src={deal.logoUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-[oklch(50%_0.02_265)]">
                      {deal.company.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Mitten: titel + meta */}
                <div className="flex-1 min-w-0">
                  <p className="font-(family-name:--font-body) font-medium text-sm text-[oklch(88%_0.01_265)] truncate">
                    {deal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[oklch(50%_0.02_265)] truncate">
                      {deal.company}
                    </span>
                    {deal.discount && (
                      <span className="text-xs text-[oklch(55%_0.15_145)] font-medium">
                        {deal.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Datum */}
                <div className="hidden sm:block text-[10px] text-[oklch(40%_0.02_265)] shrink-0 font-mono">
                  {formatDate(deal.createdAt)}
                </div>

                {/* Åtgärder */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title={deal.published ? 'Avpublicera — dölj för användare' : 'Publicera — visa för användare'}
                    aria-label={deal.published ? 'Avpublicera deal' : 'Publicera deal'}
                    disabled={toggling[deal.id]}
                    onClick={() => handleToggle(deal)}
                    className="p-1.5 rounded-md text-[oklch(50%_0.02_265)] hover:text-[oklch(80%_0.01_265)] hover:bg-[oklch(18%_0.012_265)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deal.published ? (
                      <Eye size={15} aria-hidden="true" />
                    ) : (
                      <EyeOff size={15} aria-hidden="true" />
                    )}
                  </button>

                  <Link
                    href={`/admin/deals/edit?id=${deal.id}`}
                    title="Redigera deal"
                    aria-label={`Redigera deal: ${deal.title}`}
                    className="p-1.5 rounded-md text-[oklch(50%_0.02_265)] hover:text-[oklch(80%_0.01_265)] hover:bg-[oklch(18%_0.012_265)] transition-colors"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    title="Radera deal permanent"
                    aria-label={`Radera deal: ${deal.title}`}
                    disabled={deleting}
                    onClick={() => { setDeleteError(null); setDeleteTarget(deal); }}
                    className="p-1.5 rounded-md text-[oklch(50%_0.02_265)] hover:text-[oklch(65%_0.2_25)] hover:bg-[oklch(18%_0.012_265)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Radera deal?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" tas bort permanent och kan inte återställas.`
            : ''
        }
        confirmLabel={deleting ? 'Raderar…' : 'Ta bort'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </div>
  );
}
