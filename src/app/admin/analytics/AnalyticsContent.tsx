'use client';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_POSTHOG_DASHBOARD_URL;

export function AnalyticsContent() {
  if (!DASHBOARD_URL) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <p className="text-[oklch(55%_0.02_265)] text-sm">
          Ingen dashboard konfigurerad.
        </p>
        <p className="text-[oklch(40%_0.015_265)] text-xs max-w-sm">
          Skapa en delad dashboard i PostHog, kopiera embed-URL:en och lägg till den i{' '}
          <code className="font-mono text-[oklch(60%_0.08_265)]">NEXT_PUBLIC_POSTHOG_DASHBOARD_URL</code>{' '}
          i din <code className="font-mono text-[oklch(60%_0.08_265)]">.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="-m-8">
      <iframe
        src={DASHBOARD_URL}
        className="w-full border-0"
        style={{ minHeight: 'calc(100svh - 130px)' }}
        title="PostHog Analytics Dashboard"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
