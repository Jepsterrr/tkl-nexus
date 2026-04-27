"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { getTimelineItems, deleteTimelineItem } from "@/lib/services/settings";
import type { TimelineItem } from "@/lib/schemas/settings";

export function TimelineList() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<TimelineItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getTimelineItems()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTimelineItem(deleteTarget.id);
      setDeleteTarget(null);
      setFetchKey((k) => k + 1);
    } catch {
      setDeleteError("Kunde inte ta bort. Försök igen.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 sm:p-8 animate-pulse space-y-3">
        <div className="h-3 w-24 rounded bg-[oklch(18%_0.012_265)]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">
          Kunde inte hämta tidslinjeposter.
        </p>
        <button
          type="button"
          onClick={() => setFetchKey((k) => k + 1)}
          className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
        >
          Försök igen
        </button>
      </div>
    );

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]">
        <h1 className="font-(family-name:--font-heading) text-[10px] font-bold uppercase tracking-widest text-[oklch(48%_0.02_265)]">
          Tidslinje
        </h1>
        <Link
          href="/admin/settings/timeline/new"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] transition-colors"
        >
          Ny post
        </Link>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[oklch(56%_0.02_265)] py-4">
          Inga poster ännu.
        </p>
      )}

      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 py-3 border-b border-[oklch(18%_0.012_265)]"
          >
            <span className="text-xs font-mono text-[oklch(58%_0.02_265)] w-12 shrink-0">
              {item.year}
            </span>
            <span className="flex-1 text-sm text-[oklch(75%_0.01_265)] truncate">
              {item.titleSv}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/settings/timeline/edit?id=${item.id}`}
                className="p-3 rounded text-[oklch(45%_0.02_265)] hover:text-[oklch(75%_0.01_265)] transition-colors"
                aria-label={`Redigera ${item.titleSv}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="p-3 rounded text-[oklch(45%_0.02_265)] hover:text-[oklch(65%_0.2_25)] transition-colors"
                aria-label={`Ta bort ${item.titleSv}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteError && (
        <p className="mt-3 text-xs text-[oklch(65%_0.2_25)]" role="alert">
          {deleteError}
        </p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Ta bort tidslinjpost?"
        description={`"${deleteTarget?.titleSv}" tas bort permanent.`}
        confirmLabel={deleting ? "Tar bort…" : "Ta bort"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
