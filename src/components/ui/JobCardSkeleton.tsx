'use client';

import { ACCENT_COLOR_MAP } from '@/lib/types';
import type { AccentColor } from '@/lib/types';

interface JobCardSkeletonProps {
  count?: number;
  accentColor?: AccentColor;
}

function SingleSkeleton({ accentColor = 'green' }: { accentColor: AccentColor }) {
  const colors = ACCENT_COLOR_MAP[accentColor];
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 space-y-4 animate-pulse"
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.bg,
      }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 rounded-full bg-white/10" />
          <div className="h-5 w-4/5 rounded-lg bg-white/10" />
          <div className="h-3 w-1/3 rounded-full bg-white/8" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/8 shrink-0" />
      </div>
      {/* Meta */}
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded-full bg-white/8" />
        <div className="h-3 w-1/2 rounded-full bg-white/8" />
      </div>
      {/* Actions */}
      <div className="flex justify-between pt-1">
        <div className="h-9 w-28 rounded-xl bg-white/10" />
        <div className="w-9 h-9 rounded-xl bg-white/8" />
      </div>
    </div>
  );
}

export function JobCardSkeleton({ count = 2, accentColor = 'green' }: JobCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} accentColor={accentColor} />
      ))}
    </>
  );
}
