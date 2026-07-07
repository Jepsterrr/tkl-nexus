'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { getAllProducts, deleteProduct, toggleProductPublished, reorderProducts } from '@/lib/services/products';
import type { TKLProduct } from '@/lib/schemas/product';

const CATEGORY_LABELS: Record<TKLProduct['category'], string> = {
  activities: 'Aktiviteter & Event',
  services: 'Övriga tjänster',
  marketing: 'Marknadsföring',
};
const CATEGORIES: TKLProduct['category'][] = ['activities', 'services', 'marketing'];

// Sortable row

interface RowProps {
  item: TKLProduct;
  toggling: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableProductRow({ item, toggling, onToggle, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-[oklch(20%_0.012_265)] hover:bg-[oklch(13%_0.01_265)]"
    >
      <td className="px-2 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[oklch(40%_0.01_265)] hover:text-[oklch(65%_0.02_265)] touch-none"
          aria-label={`Dra för att ändra ordning för ${item.name}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3 text-[oklch(88%_0.01_265)] font-medium">{item.name}</td>
      <td className="px-4 py-3 text-[oklch(65%_0.02_265)] text-xs max-w-35 truncate">
        {item.price || '—'}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-50 ${
            item.published
              ? 'bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400'
              : 'bg-[oklch(22%_0.012_265)] text-[oklch(55%_0.02_265)] hover:bg-green-500/15 hover:text-green-400'
          }`}
        >
          {toggling ? '…' : item.published ? 'Publicerad' : 'Utkast'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <Link
            href={`/admin/products/edit?id=${item.id}`}
            className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
          >
            Redigera
          </Link>
          <button
            onClick={onDelete}
            className="text-xs text-[oklch(45%_0.02_265)] hover:text-red-400 transition-colors"
          >
            Ta bort
          </button>
        </div>
      </td>
    </tr>
  );
}

// Category group with own DndContext

interface GroupProps {
  category: TKLProduct['category'];
  items: TKLProduct[];
  toggling: Record<string, boolean>;
  onToggle: (item: TKLProduct) => void;
  onDelete: (item: TKLProduct) => void;
  onReorder: (category: TKLProduct['category'], reordered: TKLProduct[]) => void;
}

function CategoryGroup({ category, items, toggling, onToggle, onDelete, onReorder }: GroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(category, reordered);
  }

  if (items.length === 0) return null;

  return (
    <>
      <tr>
        <td
          colSpan={5}
          className="px-4 py-2 bg-[oklch(11%_0.01_265)] border-t border-[oklch(22%_0.015_265)]"
        >
          <span className="text-xs font-semibold text-[oklch(55%_0.02_265)] uppercase tracking-wider">
            {CATEGORY_LABELS[category]}
          </span>
        </td>
      </tr>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableProductRow
              key={item.id}
              item={item}
              toggling={!!toggling[item.id]}
              onToggle={() => onToggle(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
}

// Main component

export function ProductsContent() {
  const [items, setItems] = useState<TKLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<TKLProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getAllProducts()
      .then((data) => { if (!cancelled) { setItems(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetchKey]);

  useEffect(() => {
    const onFocus = () => setFetchKey((k) => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleToggle = useCallback(async (item: TKLProduct) => {
    setToggling((t) => ({ ...t, [item.id]: true }));
    try {
      await toggleProductPublished(item.id);
      setItems((all) => all.map((p) => (p.id === item.id ? { ...p, published: !p.published } : p)));
    } finally {
      setToggling((t) => ({ ...t, [item.id]: false }));
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setItems((all) => all.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleReorder = useCallback(
    (category: TKLProduct['category'], reordered: TKLProduct[]) => {
      setItems((prev) => {
        const others = prev.filter((p) => p.category !== category);
        const updated = [...others, ...reordered];
        void reorderProducts(reordered.map((p) => p.id));
        return updated;
      });
    },
    []
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[oklch(88%_0.01_265)]">Produktportfölj</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] transition-colors"
        >
          + Ny produkt
        </Link>
      </div>

      {loading && <p className="text-sm text-[oklch(55%_0.02_265)]">Laddar…</p>}
      {error && (
        <div>
          <p className="text-sm text-red-400 mb-2">Kunde inte hämta produkter.</p>
          <button
            onClick={() => setFetchKey((k) => k + 1)}
            className="text-xs text-[oklch(65%_0.02_265)] underline"
          >
            Försök igen
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-xl overflow-hidden border border-[oklch(22%_0.015_265)]">
          <table className="w-full text-sm">
            <thead className="bg-[oklch(14%_0.01_265)]">
              <tr>
                <th className="w-8 px-2 py-3" aria-label="Dra för att sortera" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-[oklch(55%_0.02_265)]">Namn</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[oklch(55%_0.02_265)]">Pris</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[oklch(55%_0.02_265)]">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  items={items.filter((p) => p.category === cat)}
                  toggling={toggling}
                  onToggle={handleToggle}
                  onDelete={(item) => setDeleteTarget(item)}
                  onReorder={handleReorder}
                />
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[oklch(45%_0.02_265)] text-sm">
                    Inga produkter hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[oklch(12%_0.01_265)] border border-[oklch(25%_0.015_265)] rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-sm text-[oklch(88%_0.01_265)]">
              Ta bort <strong>{deleteTarget.name}</strong>? Åtgärden kan inte ångras.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Tar bort…' : 'Ta bort'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[oklch(65%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
