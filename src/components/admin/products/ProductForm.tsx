'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, getMaxOrderForCategory } from '@/lib/services/products';
import type { TKLProductFormData, TKLProduct } from '@/lib/schemas/product';
import { inputCls, labelCls, errorCls } from '@/components/admin/shared/formStyles';

interface ProductFormProps {
  initial?: TKLProduct;
}

const EMPTY: TKLProductFormData = {
  name: '', nameEn: '', description: '', descriptionEn: '',
  category: 'activities', highlights: [], highlightsEn: [],
  price: '', priceEn: '', order: 0, published: false,
};

function HighlightListInput({
  label, value, onChange,
}: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');

  function add() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className={inputCls}
          placeholder="Skriv en punkt och tryck Enter"
          aria-label={label}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 min-h-11 rounded-lg text-xs font-semibold bg-[oklch(22%_0.015_265)] text-[oklch(75%_0.01_265)] hover:bg-[oklch(28%_0.015_265)] transition-colors"
        >
          Lägg till
        </button>
      </div>
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-[oklch(75%_0.01_265)]">
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[oklch(55%_0.02_265)] hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductForm({ initial }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<TKLProductFormData>(
    initial
      ? { name: initial.name, nameEn: initial.nameEn, description: initial.description,
          descriptionEn: initial.descriptionEn, category: initial.category,
          highlights: initial.highlights, highlightsEn: initial.highlightsEn,
          price: initial.price, priceEn: initial.priceEn, order: initial.order,
          published: initial.published }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial;
  const prevCategory = useRef(form.category);

  useEffect(() => {
    if (!isNew) return;
    getMaxOrderForCategory(form.category).then((next) => set('order', next));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isNew) return;
    if (form.category === prevCategory.current) return;
    prevCategory.current = form.category;
    getMaxOrderForCategory(form.category).then((next) => set('order', next));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category]);

  function set<K extends keyof TKLProductFormData>(key: K, value: TKLProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (initial) {
        await updateProduct(initial.id, form);
      } else {
        await createProduct(form);
      }
      router.push('/admin/products');
    } catch {
      setError('Kunde inte spara. Försök igen.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-lg font-bold text-[oklch(88%_0.01_265)]">
        {initial ? 'Redigera produkt' : 'Ny produkt'}
      </h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-name" className={labelCls}>Namn (sv) *</label>
          <input id="pf-name" required className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label htmlFor="pf-name-en" className={labelCls}>Name (EN)</label>
          <input id="pf-name-en" className={inputCls} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-desc" className={labelCls}>Beskrivning (sv)</label>
          <textarea id="pf-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label htmlFor="pf-desc-en" className={labelCls}>Description (EN)</label>
          <textarea id="pf-desc-en" rows={3} className={inputCls} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
        </div>
      </div>

      <div>
        <label htmlFor="pf-category" className={labelCls}>Kategori *</label>
        <select
          id="pf-category"
          className={inputCls}
          value={form.category}
          onChange={(e) => set('category', e.target.value as TKLProductFormData['category'])}
        >
          <option value="activities">Aktiviteter & Event</option>
          <option value="services">Övriga tjänster</option>
          <option value="marketing">Marknadsföring</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <HighlightListInput label="Highlights (sv)" value={form.highlights} onChange={(v) => set('highlights', v)} />
        <HighlightListInput label="Highlights (EN)" value={form.highlightsEn} onChange={(v) => set('highlightsEn', v)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-price" className={labelCls}>Pris (sv)</label>
          <input id="pf-price" className={inputCls} placeholder="T.ex. 12 500 kr exkl. förtäring" value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div>
          <label htmlFor="pf-price-en" className={labelCls}>Price (EN)</label>
          <input id="pf-price-en" className={inputCls} placeholder="E.g. 12 500 SEK excl. food" value={form.priceEn} onChange={(e) => set('priceEn', e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-order" className={labelCls}>Ordning (lägre = visas först)</label>
          <input id="pf-order" type="number" className={inputCls} value={form.order} onChange={(e) => set('order', Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <input
            id="published"
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="published" className="text-sm text-[oklch(75%_0.01_265)]">Publicerad</label>
        </div>
      </div>

      {error && <p className={errorCls} role="alert">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Sparar…' : 'Spara'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[oklch(65%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
