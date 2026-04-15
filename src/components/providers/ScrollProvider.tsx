'use client';

import { createContext, useContext, useRef } from 'react';
import type { RefObject } from 'react';

const ScrollContext = createContext<RefObject<HTMLDivElement | null>>({ current: null });

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <ScrollContext.Provider value={scrollRef}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContainer(): RefObject<HTMLDivElement | null> {
  return useContext(ScrollContext);
}
