'use client';

import { useScrollContainer } from './ScrollProvider';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useScrollContainer();

  // Intercept same-page hash link clicks before Next.js router handles them.
  // Without this, router.push('#id') tries to scroll window (overflow:hidden) — nothing happens.
  function handleHashClick(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as Element).closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div ref={scrollRef} className="scroll-container" onClickCapture={handleHashClick}>
      {children}
    </div>
  );
}
