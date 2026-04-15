'use client';

import { useScrollContainer } from './ScrollProvider';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useScrollContainer();
  return (
    <div ref={scrollRef} className="scroll-container">
      {children}
    </div>
  );
}
