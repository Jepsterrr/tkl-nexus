'use client';

import { useEffect, useRef, useState } from 'react';
import { getServicesSettings, saveServicesSettings } from '@/lib/services/settings';
import { ServicesSettingsSchema } from '@/lib/schemas/settings';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

import { inputCls, labelCls } from '@/components/admin/shared/formStyles';

const cardHd = 'text-xs font-semibold text-[oklch(60%_0.02_265)] mt-6 mb-3';

export function ServicesForm() {
  const [etSv, setEtSv] = useState(''); const [etEn, setEtEn] = useState('');
  const [edSv, setEdSv] = useState(''); const [edEn, setEdEn] = useState('');
  const [ptSv, setPtSv] = useState(''); const [ptEn, setPtEn] = useState('');
  const [pdSv, setPdSv] = useState(''); const [pdEn, setPdEn] = useState('');
  const [prtSv, setPrtSv] = useState(''); const [prtEn, setPrtEn] = useState('');
  const [prdSv, setPrdSv] = useState(''); const [prdEn, setPrdEn] = useState('');

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
    getServicesSettings()
      .then(data => {
        if (cancelled) return;
        setEtSv(data?.eventsTitleSv ?? ''); setEtEn(data?.eventsTitleEn ?? '');
        setEdSv(data?.eventsDescSv ?? '');  setEdEn(data?.eventsDescEn ?? '');
        setPtSv(data?.portalTitleSv ?? ''); setPtEn(data?.portalTitleEn ?? '');
        setPdSv(data?.portalDescSv ?? '');  setPdEn(data?.portalDescEn ?? '');
        setPrtSv(data?.partnershipTitleSv ?? ''); setPrtEn(data?.partnershipTitleEn ?? '');
        setPrdSv(data?.partnershipDescSv ?? '');  setPrdEn(data?.partnershipDescEn ?? '');
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const r = ServicesSettingsSchema.safeParse({
      eventsTitleSv: etSv || undefined, eventsTitleEn: etEn || undefined,
      eventsDescSv:  edSv || undefined, eventsDescEn:  edEn || undefined,
      portalTitleSv: ptSv || undefined, portalTitleEn: ptEn || undefined,
      portalDescSv:  pdSv || undefined, portalDescEn:  pdEn || undefined,
      partnershipTitleSv: prtSv || undefined, partnershipTitleEn: prtEn || undefined,
      partnershipDescSv:  prdSv || undefined, partnershipDescEn:  prdEn || undefined,
    });
    if (!r.success) { setSaveError('Ogiltiga värden.'); return; }
    setSaveStatus('saving');
    try {
      await saveServicesSettings(r.data);
      setSaveStatus('saved');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setSaveError('Något gick fel. Försök igen.');
    }
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
      <div className="h-3 w-24 rounded bg-[oklch(18%_0.012_265)]" />
      {[1,2,3].map(i => <div key={i} className="h-24 rounded bg-[oklch(18%_0.012_265)]" />)}
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
        Tjänstekort
      </h1>

      <p className={cardHd}>Events &amp; Relations</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="sv-et-sv" className={labelCls}>Titel (sv)</label>
          <input id="sv-et-sv" type="text" value={etSv} onChange={e => setEtSv(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-et-en" className={labelCls}>Titel (en)</label>
          <input id="sv-et-en" type="text" value={etEn} onChange={e => setEtEn(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-ed-sv" className={labelCls}>Beskrivning (sv)</label>
          <textarea id="sv-ed-sv" value={edSv} onChange={e => setEdSv(e.target.value)} rows={3} className={inputCls} /></div>
        <div><label htmlFor="sv-ed-en" className={labelCls}>Beskrivning (en)</label>
          <textarea id="sv-ed-en" value={edEn} onChange={e => setEdEn(e.target.value)} rows={3} className={inputCls} /></div>
      </div>

      <p className={cardHd}>Nexus Portal</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="sv-pt-sv" className={labelCls}>Titel (sv)</label>
          <input id="sv-pt-sv" type="text" value={ptSv} onChange={e => setPtSv(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-pt-en" className={labelCls}>Titel (en)</label>
          <input id="sv-pt-en" type="text" value={ptEn} onChange={e => setPtEn(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-pd-sv" className={labelCls}>Beskrivning (sv)</label>
          <textarea id="sv-pd-sv" value={pdSv} onChange={e => setPdSv(e.target.value)} rows={3} className={inputCls} /></div>
        <div><label htmlFor="sv-pd-en" className={labelCls}>Beskrivning (en)</label>
          <textarea id="sv-pd-en" value={pdEn} onChange={e => setPdEn(e.target.value)} rows={3} className={inputCls} /></div>
      </div>

      <p className={cardHd}>Samarbete</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="sv-prt-sv" className={labelCls}>Titel (sv)</label>
          <input id="sv-prt-sv" type="text" value={prtSv} onChange={e => setPrtSv(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-prt-en" className={labelCls}>Titel (en)</label>
          <input id="sv-prt-en" type="text" value={prtEn} onChange={e => setPrtEn(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="sv-prd-sv" className={labelCls}>Beskrivning (sv)</label>
          <textarea id="sv-prd-sv" value={prdSv} onChange={e => setPrdSv(e.target.value)} rows={3} className={inputCls} /></div>
        <div><label htmlFor="sv-prd-en" className={labelCls}>Beskrivning (en)</label>
          <textarea id="sv-prd-en" value={prdEn} onChange={e => setPrdEn(e.target.value)} rows={3} className={inputCls} /></div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[oklch(28%_0.015_265)]">
        <div>{saveError && <p className="text-xs text-[oklch(65%_0.2_25)]" role="alert">{saveError}</p>}</div>
        <button type="submit" disabled={saveStatus === 'saving'}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saveStatus === 'saving' ? 'Sparar\u2026' : saveStatus === 'saved' ? 'Sparat \u2713' : 'Spara inställningar'}
        </button>
      </div>
    </form>
  );
}
