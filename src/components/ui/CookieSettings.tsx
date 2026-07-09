'use client';

import { useEffect, useState } from 'react';
import {
  ANALYTICS_ENABLED,
  CONSENT_EVENT,
  getConsent,
  setConsent,
  type ConsentValue,
} from '@/lib/analytics';
import { useLanguage } from '@/components/providers/LanguageProvider';

const CARD_STYLE = {
  background: 'var(--about-card-bg)',
  border: '1px solid var(--about-card-border)',
  backdropFilter: 'blur(12px)',
} as const;

/**
 * Toggle för analys-samtycke på /privacy — låter besökaren när som helst
 * slå på eller återkalla sitt cookie-val efter att bannern besvarats.
 * Renderas inte alls när ANALYTICS_ENABLED är false (inget att samtycka till).
 */
export function CookieSettings() {
  const { t } = useLanguage();
  const p = t.privacy;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getConsent() === 'accepted');

    // Synkar toggeln om valet görs i cookie-bannern medan sidan är öppen
    const onConsentChange = (e: Event) => {
      setEnabled((e as CustomEvent<ConsentValue>).detail === 'accepted');
    };
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  if (!ANALYTICS_ENABLED) return null;

  const toggle = () => setConsent(enabled ? 'declined' : 'accepted');

  return (
    <div className="mb-6 rounded-2xl p-6" style={CARD_STYLE}>
      <h2 className="hero-text font-bold text-base mb-3" style={{ color: 'var(--text-red)' }}>
        {p.cookieSettingsTitle}
      </h2>
      <p className="hero-text-muted text-sm leading-relaxed mb-4">{p.cookieSettingsBody}</p>

      <div className="flex items-center justify-between gap-4">
        <span id="cookie-toggle-label" className="hero-text text-sm font-medium">
          {p.cookieSettingsLabel}
        </span>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={enabled}
          aria-labelledby="cookie-toggle-label"
          className="inline-flex items-center gap-3 shrink-0 min-h-[44px] min-w-[44px] px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
        >
          <span className="hero-text-muted text-xs font-semibold tabular-nums" aria-hidden="true">
            {enabled ? p.cookieSettingsOn : p.cookieSettingsOff}
          </span>
          <span
            className="relative inline-block w-11 h-6 rounded-full transition-colors duration-200 motion-reduce:transition-none"
            style={
              enabled
                ? { background: 'var(--text-blue)' }
                : { background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-border-subtle)' }
            }
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 motion-reduce:transition-none ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
