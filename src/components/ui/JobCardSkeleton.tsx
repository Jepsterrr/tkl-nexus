'use client';

import { ACCENT_COLOR_MAP } from '@/lib/types';
import type { AccentColor } from '@/lib/types';

interface JobCardSkeletonProps {
  count?: number;
  accentColor?: AccentColor;
  /** 'card' = JobCard-format (standard), 'row' = JobRow-format */
  variant?: 'card' | 'row';
}

function SingleSkeleton({ accentColor = 'green' }: { accentColor: AccentColor }) {
  const colors = ACCENT_COLOR_MAP[accentColor];
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 space-y-4"
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.bg,
      }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-3 w-16 rounded-full" />
          <div className="skeleton-shimmer h-5 w-4/5 rounded-lg" />
          <div className="skeleton-shimmer h-3 w-1/3 rounded-full" />
        </div>
        <div className="skeleton-shimmer w-11 h-11 rounded-xl shrink-0" />
      </div>
      {/* Meta */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-1/3 rounded-full" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
      </div>
      {/* Actions */}
      <div className="flex justify-between pt-1">
        <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
        <div className="skeleton-shimmer w-9 h-9 rounded-xl" />
      </div>
    </div>
  );
}

/** Radformat — matchar JobRow (tät lista på /career). */
function RowSkeleton() {
  return (
    <div
      className="rounded-xl px-4 py-3.5 sm:px-5 grid gap-x-6 gap-y-2 items-center md:grid-cols-[minmax(0,1fr)_auto]"
      style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
      aria-hidden="true"
    >
      <div className="space-y-2">
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-3.5 w-28 rounded-full" />
          <div className="skeleton-shimmer h-3.5 w-14 rounded-full" />
        </div>
        <div className="skeleton-shimmer h-5 w-3/4 rounded-lg" />
        <div className="skeleton-shimmer h-3 w-1/3 rounded-full" />
      </div>
      <div className="skeleton-shimmer h-3 w-32 rounded-full" />
    </div>
  );
}

export function JobCardSkeleton({ count = 2, accentColor = 'green', variant = 'card' }: JobCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) =>
        variant === 'row' ? <RowSkeleton key={i} /> : <SingleSkeleton key={i} accentColor={accentColor} />,
      )}
    </>
  );
}
