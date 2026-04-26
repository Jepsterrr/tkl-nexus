'use client';

import { useEffect, useRef, useState } from 'react';
import { getContactSettings, saveContactSettings } from '@/lib/services/settings';
import { ContactSettingsSchema } from '@/lib/schemas/settings';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors',
  'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
  'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
  'focus:border-[oklch(55%_0.12_265)]',
].join(' ');
const labelCls = 'block text-[10px] font-semibold text-[oklch(48%_0.02_265)] uppercase tracking-widest mb-1.5';

export function ContactForm() {
  const [email,     setEmail]     = useState('');
  const [linkedin,  setLinkedin]  = useState('');
  const [instagram, setInstagram] = useState('');
  const [address,   setAddress]   = useState('');

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
    getContactSettings()
      .then(data => {
        if (cancelled) return;
        setEmail(data?.email ?? '');
        setLinkedin(data?.linkedin ?? '');
        setInstagram(data?.instagram ?? '');
        setAddress(data?.address ?? '');
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const r = ContactSettingsSchema.safeParse({
      email: email || undefined,
      linkedin: linkedin || undefined,
      instagram: instagram || undefined,
      address: address || undefined,
    });
    if (!r.success) {
      const first = r.error.issues[0];
      setSaveError(first?.message ?? 'Ogiltiga värden.');
      return;
    }
    setSaveStatus('saving');
    try {
      await saveContactSettings(r.data);
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
      {[1,2,3,4].map(i => <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />)}
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
        Kontaktuppgifter
      </h1>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="ct-email" className={labelCls}>E-postadress</label>
          <input id="ct-email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ao@teknologkaren.se" className={inputCls} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ct-linkedin" className={labelCls}>LinkedIn-URL</label>
            <input id="ct-linkedin" type="url" value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/tkl-nexus/" className={inputCls} />
          </div>
          <div>
            <label htmlFor="ct-instagram" className={labelCls}>Instagram-URL</label>
            <input id="ct-instagram" type="url" value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="https://instagram.com/tkl_nexus" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-address" className={labelCls}>Besöksadress</label>
          <input id="ct-address" type="text" value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Tekniktorget 3, 977 54 Luleå" className={inputCls} />
        </div>
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
