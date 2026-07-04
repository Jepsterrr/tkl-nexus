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
