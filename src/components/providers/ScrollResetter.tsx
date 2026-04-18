'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollContainer } from './ScrollProvider';

export function ScrollResetter() {
  const pathname = usePathname();
  const scrollRef = useScrollContainer();

  useEffect(() => {
    if (!scrollRef.current) return;
    const hash = window.location.hash;
    if (hash) {
      // Scroll to hash target after content renders; accounts for custom scroll container
      const timer = setTimeout(() => {
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(timer);
    } else {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname, scrollRef]);

  return null;
}
