import posthog from 'posthog-js';

/**
 * Central på/av-knapp för all analytik.
 *
 * false = ingen PostHog-init, ingen cookie-banner, alla capture() är no-ops.
 * Sätt till true först när DPA är signerat med PostHog — init-blocket i
 * instrumentation-client.ts läser samma flagga, så hela kedjan slås på
 * från en enda punkt.
 */
export const ANALYTICS_ENABLED = false;

/**
 * Enda vägen att skicka events. No-op när analytiken är avstängd,
 * så komponenter slipper känna till flaggan och en o-initierad
 * posthog-singleton aldrig anropas (undviker console-varningar).
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!ANALYTICS_ENABLED) return;
  posthog.capture(event, properties);
}
