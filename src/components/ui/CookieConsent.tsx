'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ANALYTICS_ENABLED, optInAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { EASE_OUT_EXPO } from '@/lib/motion';

const CONSENT_KEY = 'tkl-cookie-consent';

export function CookieConsent() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const cookie = t.cookieConsent;
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === 'accepted') {
        optInAnalytics();
      } else if (!stored) {
        setVisible(true);
      }
      // 'declined' → PostHog stays silent
    } catch {
      // localStorage not available
    }
  }, []);

  // Ingen banner när analytiken är avstängd — det finns inget att samtycka till
  if (!ANALYTICS_ENABLED) return null;

  // Hide on /admin/* routes
  if (pathname.startsWith('/admin')) return null;

  const accept = () => {
    optInAnalytics();
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch { /* ignore */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: EASE_OUT_EXPO }}
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4"
          role="dialog"
          aria-modal="false"
          aria-label={cookie.text}
        >
          {/* Light-mode overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-t-2xl" aria-hidden="true" />

          <div className="bg-black light:bg-white max-w-4xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="hero-text-muted text-sm leading-relaxed flex-1">
              {cookie.text}{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-blue)' }}
              >
                {cookie.link}
              </Link>
            </p>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={accept}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ background: 'rgba(59,130,246,0.9)', color: '#fff' }}
              >
                {cookie.accept}
              </button>
              <button
                onClick={decline}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--glass-border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                {cookie.decline}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
