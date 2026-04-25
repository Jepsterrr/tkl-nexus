'use client';

import { useEffect, useRef, useState } from 'react';
import { getLinksSettings, saveLinksSettings } from '@/lib/services/settings';
import { LinksSettingsSchema } from '@/lib/schemas/settings';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors',
  'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
  'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
  'focus:border-[oklch(55%_0.12_265)]',
].join(' ');
const labelCls = 'block text-[10px] font-semibold text-[oklch(48%_0.02_265)] uppercase tracking-widest mb-1.5';

const SECTION_NAMES = ['Datasektionen', 'Geosektionen', 'I-sektionen', 'Maskinsektionen'];
const SECTION_DEFAULTS = [
  'https://teknologkaren.se/om-oss/sektioner/datasektionen',
  'https://teknologkaren.se/om-oss/sektioner/geosektionen',
  'https://teknologkaren.se/om-oss/sektioner/i-sektionen',
  'https://teknologkaren.se/om-oss/sektioner/maskinsektionen',
];

export function LinksForm() {
  const [teknologkaren, setTeknologkaren] = useState('');
  const [larv, setLarv] = useState('');
  const [sectionHrefs, setSectionHrefs] = useState<string[]>(['', '', '', '']);

  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [fetchKey,   setFetchKey]   = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setLoadError(false);
    getLinksSettings()
      .then(data => {
        if (cancelled) return;
        setTeknologkaren(data?.teknologkaren ?? '');
        setLarv(data?.larv ?? '');
        setSectionHrefs(
          SECTION_DEFAULTS.map((def, i) => data?.sectionLinks?.[i]?.href ?? def)
        );
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const r = LinksSettingsSchema.safeParse({
      teknologkaren: teknologkaren || undefined,
      larv: larv || undefined,
      sectionLinks: SECTION_NAMES.map((name, i) => ({
        name,
        href: sectionHrefs[i] || SECTION_DEFAULTS[i],
      })),
    });
    if (!r.success) {
      const first = r.error.issues[0];
      setSaveError(first?.message ?? 'Ogiltiga URL-värden.');
      return;
    }
    setSaveStatus('saving');
    try {
      await saveLinksSettings(r.data);
      setSaveStatus('saved');
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setSaveError('Något gick fel. Försök igen.');
    }
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
      <div className="h-3 w-24 rounded bg-[oklch(18%_0.012_265)]" />
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />)}
    </div>
  );

  if (loadError) return (
    <div className="p-6 sm:p-8">
      <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">Kunde inte hämta inställningar.</p>
      <button type="button" onClick={() => setFetchKey(k => k + 1)}
        className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors">
        Försök igen
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 max-w-2xl">
      <h1 className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-widest text-[oklch(48%_0.02_265)] mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]">
        Externa Länkar
      </h1>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lk-tkl" className={labelCls}>Teknologkåren URL</label>
            <input id="lk-tkl" type="url" value={teknologkaren}
              onChange={e => setTeknologkaren(e.target.value)}
              placeholder="https://www.teknologkaren.se" className={inputCls} />
          </div>
          <div>
            <label htmlFor="lk-larv" className={labelCls}>LARV URL</label>
            <input id="lk-larv" type="url" value={larv}
              onChange={e => setLarv(e.target.value)}
              placeholder="https://larv.org" className={inputCls} />
          </div>
        </div>

        <p className="text-[10px] font-semibold text-[oklch(38%_0.02_265)] uppercase tracking-widest mt-6 mb-3">
          Sektionslänkar
        </p>
        {SECTION_NAMES.map((name, i) => (
          <div key={name}>
            <label htmlFor={`lk-sec-${i}`} className={labelCls}>{name}</label>
            <input
              id={`lk-sec-${i}`}
              type="url"
              value={sectionHrefs[i]}
              onChange={e => setSectionHrefs(prev => {
                const next = [...prev];
                next[i] = e.target.value;
                return next;
              })}
              placeholder={SECTION_DEFAULTS[i]}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[oklch(28%_0.015_265)]">
        <div>{saveError && <p className="text-xs text-[oklch(65%_0.2_25)]" role="alert">{saveError}</p>}</div>
        <button type="submit" disabled={saveStatus === 'saving'}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saveStatus === 'saving' ? 'Sparar\u2026' : saveStatus === 'saved' ? 'Sparat \u2713' : 'Spara inställningar'}
        </button>
      </div>
    </form>
  );
}
