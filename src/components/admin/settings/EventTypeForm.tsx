'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEventType, updateEventType } from '@/lib/services/eventTypes';
import type { EventTypeFormData, TKLEventType } from '@/lib/schemas/eventType';
import { inputCls, labelCls, errorCls } from '@/components/admin/shared/formStyles';

function HighlightListInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  function add() {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex gap-2 mb-2">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className={inputCls} placeholder="Skriv en punkt och tryck Enter" />
        <button type="button" onClick={add} className="px-3 min-h-11 rounded-lg text-xs font-semibold bg-[oklch(22%_0.015_265)] text-[oklch(75%_0.01_265)] hover:bg-[oklch(28%_0.015_265)] transition-colors">
          Lägg till
        </button>
      </div>
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-[oklch(75%_0.01_265)]">
            <span className="flex-1">{item}</span>
            <button type="button" onClick={() => remove(i)} className="text-[oklch(55%_0.02_265)] hover:text-red-400 transition-colors">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EMPTY: EventTypeFormData = {
  name: '', nameEn: '', description: '', descriptionEn: '',
  highlights: [], highlightsEn: [], order: 0, published: false,
};

interface Props { initial?: TKLEventType }

export function EventTypeForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EventTypeFormData>(
    initial ? {
      name: initial.name, nameEn: initial.nameEn,
      description: initial.description, descriptionEn: initial.descriptionEn,
      highlights: initial.highlights, highlightsEn: initial.highlightsEn,
      order: initial.order, published: initial.published,
    } : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EventTypeFormData>(key: K, value: EventTypeFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (initial) { await updateEventType(initial.id, form); }
      else { await createEventType(form); }
      router.push('/admin/settings/event-types');
    } catch {
      setError('Kunde inte spara. Försök igen.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl p-6 space-y-6">
      <h1 className="text-lg font-bold text-[oklch(88%_0.01_265)]">
        {initial ? 'Redigera eventtyp' : 'Ny eventtyp'}
      </h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Namn (sv) *</label><input required className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><label className={labelCls}>Name (EN)</label><input className={inputCls} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} /></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Beskrivning (sv)</label><textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div><label className={labelCls}>Description (EN)</label><textarea rows={3} className={inputCls} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} /></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <HighlightListInput label="Highlights (sv)" value={form.highlights} onChange={(v) => set('highlights', v)} />
        <HighlightListInput label="Highlights (EN)" value={form.highlightsEn} onChange={(v) => set('highlightsEn', v)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Ordning</label><input type="number" className={inputCls} value={form.order} onChange={(e) => set('order', Number(e.target.value))} /></div>
        <div className="flex items-center gap-3 pt-5">
          <input id="et-published" type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="et-published" className="text-sm text-[oklch(75%_0.01_265)]">Publicerad</label>
        </div>
      </div>

      {error && <p className={errorCls} role="alert">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 transition-colors">
          {saving ? 'Sparar…' : 'Spara'}
        </button>
        <button type="button" onClick={() => router.push('/admin/settings/event-types')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[oklch(65%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors">
          Avbryt
        </button>
      </div>
    </form>
  );
}
