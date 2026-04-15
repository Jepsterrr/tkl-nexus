'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollContainer } from './ScrollProvider';

export function ScrollResetter() {
  const pathname = usePathname();
  const scrollRef = useScrollContainer();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname, scrollRef]);

  return null;
}
