/**
 * Central på/av-knapp för all analytik.
 *
 * false = ingen PostHog-init, ingen cookie-banner, alla capture() är no-ops.
 * Sätt till true först när DPA är signerat med PostHog — init-blocket i
 * instrumentation-client.ts läser samma flagga, så hela kedjan slås på
 * från en enda punkt.
 *
 * posthog-js importeras dynamiskt — biblioteket (~180 kB) hamnar aldrig i
 * root-bundlen när flaggan är av. Behåll det mönstret: ingen statisk
 * `import posthog from 'posthog-js'` utanför denna fil och
 * instrumentation-client.ts.
 */
export const ANALYTICS_ENABLED = false;

/**
 * Enda vägen att skicka events. No-op när analytiken är avstängd,
 * så komponenter slipper känna till flaggan och en o-initierad
 * posthog-singleton aldrig anropas (undviker console-varningar).
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!ANALYTICS_ENABLED) return;
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.capture(event, properties);
  });
}

/** Sätter samtyckes-läge efter cookie-bannern. No-op när analytiken är av. */
export function optInAnalytics(): void {
  if (!ANALYTICS_ENABLED) return;
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.set_config({ persistence: 'localStorage+cookie' });
    posthog.opt_in_capturing();
  });
}

/**
 * Återkallar samtycke. Persistence flyttas tillbaka till memory —
 * posthog-js rensar då sina ph_*-nycklar från cookie/localStorage.
 */
export function optOutAnalytics(): void {
  if (!ANALYTICS_ENABLED) return;
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.opt_out_capturing();
    posthog.set_config({ persistence: 'memory' });
  });
}

export const CONSENT_KEY = 'tkl-cookie-consent';
/** Window-event som synkar cookie-bannern och toggeln på /privacy. */
export const CONSENT_EVENT = 'tkl-consent-change';

export type ConsentValue = 'accepted' | 'declined';

export function getConsent(): ConsentValue | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'accepted' || stored === 'declined' ? stored : null;
  } catch {
    return null;
  }
}

/** Sparar valet, slår på/av PostHog och notifierar alla consent-UI:n. */
export function setConsent(value: ConsentValue): void {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* ignore */ }
  if (value === 'accepted') optInAnalytics();
  else optOutAnalytics();
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}
