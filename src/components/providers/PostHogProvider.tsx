'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

/**
 * Trackar $pageview-events vid SPA-navigering (App Router pathname-ändringar).
 * Måste wrappas i <Suspense> eftersom useSearchParams kan suspenda.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString();
    const url = window.origin + pathname + (search ? `?${search}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Wrapper som ger PostHog React-kontext (usePostHog()) till hela trädet
 * och trackar sidbyten automatiskt. PostHog initialiseras i
 * instrumentation-client.ts — providern konsumerar samma singleton.
 */
export function PHProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}
