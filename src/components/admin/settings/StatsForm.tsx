'use client';

import { useEffect, useRef, useState } from 'react';
import { getStatsSettings, saveStatsSettings } from '@/lib/services/settings';
import { StatsSettingsSchema } from '@/lib/schemas/settings';
import type { StatsSettings } from '@/lib/schemas/settings';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors font-variant-numeric tabular-nums',
  'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
  'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
  'focus:border-[oklch(55%_0.12_265)]',
].join(' ');
const labelCls = 'block text-[10px] font-semibold text-[oklch(48%_0.02_265)] uppercase tracking-widest mb-1.5';

export function StatsForm() {
  const [members,  setMembers]  = useState('');
  const [programs, setPrograms] = useState('');
  const [sections, setSections] = useState('');

  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fetchKey, setFetchKey]   = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError]   = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getStatsSettings()
      .then(data => {
        if (cancelled) return;
        setMembers(data?.members  ?? '');
        setPrograms(data?.programs ?? '');
        setSections(data?.sections ?? '');
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setLoadError(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const data: StatsSettings = {
      members:  members  || undefined,
      programs: programs || undefined,
      sections: sections || undefined,
    };
    const r = StatsSettingsSchema.safeParse(data);
    if (!r.success) { setSaveError('Ogiltiga värden.'); return; }
    setSaveStatus('saving');
    try {
      await saveStatsSettings(r.data);
      setSaveStatus('saved');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setSaveError('Något gick fel. Försök igen.');
    }
  };

  if (loading) return <SettingsFormSkeleton rows={3} />;

  if (loadError) return (
    <div className="p-6 sm:p-8">
      <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">Kunde inte hämta inställningar.</p>
      <button
        type="button"
        onClick={() => setFetchKey(k => k + 1)}
        className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
      >
        Försök igen
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 max-w-2xl">
      <h1 className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-widest text-[oklch(48%_0.02_265)] mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]">
        Statistik
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label htmlFor="stat-members" className={labelCls}>Medlemmar</label>
          <input id="stat-members" type="text" value={members}
            onChange={e => setMembers(e.target.value)}
            placeholder="1 600+" className={inputCls} />
        </div>
        <div>
          <label htmlFor="stat-programs" className={labelCls}>Program</label>
          <input id="stat-programs" type="text" value={programs}
            onChange={e => setPrograms(e.target.value)}
            placeholder="30" className={inputCls} />
        </div>
        <div>
          <label htmlFor="stat-sections" className={labelCls}>Sektioner</label>
          <input id="stat-sections" type="text" value={sections}
            onChange={e => setSections(e.target.value)}
            placeholder="4" className={inputCls} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[oklch(28%_0.015_265)]">
        <div>
          {saveError && <p className="text-xs text-[oklch(65%_0.2_25)]" role="alert">{saveError}</p>}
        </div>
        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveStatus === 'saving' ? 'Sparar…' : saveStatus === 'saved' ? 'Sparat ✓' : 'Spara inställningar'}
        </button>
      </div>
    </form>
  );
}

function SettingsFormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
      <div className="h-3 w-24 rounded bg-[oklch(18%_0.012_265)]" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
        ))}
      </div>
    </div>
  );
}
