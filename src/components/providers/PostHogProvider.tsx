'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { capture } from '@/lib/analytics';

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
    capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Pageview-tracking för hela trädet. PostHog initialiseras i
 * instrumentation-client.ts; all capture går via lib/analytics som
 * importerar posthog-js dynamiskt — root-bundlen är posthog-fri när
 * ANALYTICS_ENABLED är false. usePostHog()/React-context används inte
 * i kodbasen — återinför posthog-js/react-providern bara om det behövs.
 */
export function PHProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
