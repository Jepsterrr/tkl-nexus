'use client';

import { useEffect, useRef, useState } from 'react';
import { getAboutSettings, saveAboutSettings } from '@/lib/services/settings';
import { AboutSettingsSchema } from '@/lib/schemas/settings';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors',
  'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
  'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
  'focus:border-[oklch(55%_0.12_265)]',
].join(' ');
const labelCls = 'block text-[10px] font-semibold text-[oklch(48%_0.02_265)] uppercase tracking-widest mb-1.5';
const subHdCls = 'text-[10px] font-semibold text-[oklch(38%_0.02_265)] uppercase tracking-widest mt-6 mb-3';

export function AboutForm() {
  const [p1Sv, setP1Sv] = useState('');
  const [p1En, setP1En] = useState('');
  const [p2Sv, setP2Sv] = useState('');
  const [p2En, setP2En] = useState('');
  const [p3Sv, setP3Sv] = useState('');
  const [p3En, setP3En] = useState('');
  const [footerSv, setFooterSv] = useState('');
  const [footerEn, setFooterEn] = useState('');

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
    getAboutSettings()
      .then(data => {
        if (cancelled) return;
        setP1Sv(data?.whatIsP1Sv ?? ''); setP1En(data?.whatIsP1En ?? '');
        setP2Sv(data?.whatIsP2Sv ?? ''); setP2En(data?.whatIsP2En ?? '');
        setP3Sv(data?.whatIsP3Sv ?? ''); setP3En(data?.whatIsP3En ?? '');
        setFooterSv(data?.footerDescSv ?? ''); setFooterEn(data?.footerDescEn ?? '');
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const r = AboutSettingsSchema.safeParse({
      whatIsP1Sv: p1Sv || undefined, whatIsP1En: p1En || undefined,
      whatIsP2Sv: p2Sv || undefined, whatIsP2En: p2En || undefined,
      whatIsP3Sv: p3Sv || undefined, whatIsP3En: p3En || undefined,
      footerDescSv: footerSv || undefined, footerDescEn: footerEn || undefined,
    });
    if (!r.success) { setSaveError('Ogiltiga värden.'); return; }
    setSaveStatus('saving');
    try {
      await saveAboutSettings(r.data);
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
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 rounded bg-[oklch(18%_0.012_265)]" />)}
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
        Om oss
      </h1>

      <p className={subHdCls}>Vad är TKL Nexus? — Stycke 1</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="ab-p1sv" className={labelCls}>Svenska</label>
          <textarea id="ab-p1sv" value={p1Sv} onChange={e => setP1Sv(e.target.value)} rows={5} className={inputCls} /></div>
        <div><label htmlFor="ab-p1en" className={labelCls}>Engelska</label>
          <textarea id="ab-p1en" value={p1En} onChange={e => setP1En(e.target.value)} rows={5} className={inputCls} /></div>
      </div>

      <p className={subHdCls}>Stycke 2</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="ab-p2sv" className={labelCls}>Svenska</label>
          <textarea id="ab-p2sv" value={p2Sv} onChange={e => setP2Sv(e.target.value)} rows={5} className={inputCls} /></div>
        <div><label htmlFor="ab-p2en" className={labelCls}>Engelska</label>
          <textarea id="ab-p2en" value={p2En} onChange={e => setP2En(e.target.value)} rows={5} className={inputCls} /></div>
      </div>

      <p className={subHdCls}>Stycke 3</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="ab-p3sv" className={labelCls}>Svenska</label>
          <textarea id="ab-p3sv" value={p3Sv} onChange={e => setP3Sv(e.target.value)} rows={5} className={inputCls} /></div>
        <div><label htmlFor="ab-p3en" className={labelCls}>Engelska</label>
          <textarea id="ab-p3en" value={p3En} onChange={e => setP3En(e.target.value)} rows={5} className={inputCls} /></div>
      </div>

      <p className={subHdCls}>Footer-beskrivning</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="ab-fsv" className={labelCls}>Svenska</label>
          <textarea id="ab-fsv" value={footerSv} onChange={e => setFooterSv(e.target.value)} rows={2} className={inputCls} /></div>
        <div><label htmlFor="ab-fen" className={labelCls}>Engelska</label>
          <textarea id="ab-fen" value={footerEn} onChange={e => setFooterEn(e.target.value)} rows={2} className={inputCls} /></div>
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
