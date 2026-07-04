import { ANALYTICS_ENABLED } from './src/lib/analytics';

// ANALYTIK INAKTIVERAD tills DPA signerats med PostHog.
// Återaktivering = sätt ANALYTICS_ENABLED till true i src/lib/analytics.ts —
// samma flagga styr init här, cookie-bannern och alla capture()-anrop.
// posthog-js importeras dynamiskt så biblioteket aldrig hamnar i bundlen
// när flaggan är av.
if (ANALYTICS_ENABLED) {
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      defaults: '2026-01-30',
      persistence: 'memory',
      opt_out_capturing_by_default: true,
      capture_exceptions: true,
      capture_pageleave: true,
      disable_session_recording: true,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      debug: process.env.NODE_ENV === 'development',
    });
  });
}
