'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import Link from 'next/link';
import {
  Calendar,
  Tag,
  Briefcase,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/firebase';

// Types

interface StatData {
  published: number | null;
  total: number | null;
  error: boolean;
}

interface RecentItem {
  id: string;
  title: string;
  published: boolean;
  date: string;
}

interface DashData {
  events:        StatData;
  deals:         StatData;
  opportunities: StatData;
  admins:        StatData;
  recentEvents:        RecentItem[] | null;
  recentDeals:         RecentItem[] | null;
  recentOpportunities: RecentItem[] | null;
}

const INITIAL: DashData = {
  events:        { published: null, total: null, error: false },
  deals:         { published: null, total: null, error: false },
  opportunities: { published: null, total: null, error: false },
  admins:        { published: null, total: null, error: false },
  recentEvents:        null,
  recentDeals:         null,
  recentOpportunities: null,
};

// Helpers

const FETCH_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), FETCH_TIMEOUT_MS)),
  ]);
}

function formatDate(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString().slice(0, 10);
  if (typeof ts === 'string' && ts.length >= 10) return ts.slice(0, 10);
  return '–';
}

function truncate(str: string, max = 38): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

async function fetchStat(
  collectionName: string,
  hasPublished: boolean,
): Promise<StatData> {
  try {
    const col = collection(db, collectionName);
    const totalSnap = await getCountFromServer(col);
    const total = totalSnap.data().count;

    if (!hasPublished) {
      return { published: total, total, error: false };
    }

    const publishedSnap = await getCountFromServer(
      query(col, where('published', '==', true)),
    );
    return { published: publishedSnap.data().count, total, error: false };
  } catch {
    return { published: null, total: null, error: true };
  }
}

async function fetchRecent(
  collectionName: string,
  titleField: string,
): Promise<RecentItem[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc'),
        limit(3),
      ),
    );
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: truncate(String(data[titleField] ?? '–')),
        published: Boolean(data.published),
        date: formatDate(data.createdAt),
      };
    });
  } catch {
    return [];
  }
}

// Skeleton pulse — inline animation via Tailwind animate-pulse equiv
function Skeleton({ width, height }: { width?: string; height: string }) {
  return (
    <div
      className="rounded-[3px] bg-[oklch(22%_0.012_265)] animate-[admin-pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:opacity-50"
      style={{ height, width }}
    />
  );
}

// Sub-components

function StatCard({
  label,
  icon: Icon,
  stat,
  valueLabel = 'publicerade',
  showTotal = true,
}: {
  label: string;
  icon: React.ElementType;
  stat: StatData;
  valueLabel?: string;
  showTotal?: boolean;
}) {
  const loading = stat.published === null && !stat.error;

  return (
    <div
      className="bg-[oklch(15%_0.012_265)] border border-[oklch(22%_0.015_265)] rounded-md p-5 transition-colors hover:bg-[oklch(20%_0.012_265)] hover:-translate-y-px"
      aria-busy={loading || undefined}
    >
      <div className="flex items-center gap-2 mb-4 text-[oklch(55%_0.02_265)] text-xs font-medium uppercase tracking-[0.08em]">
        <Icon size={14} aria-hidden="true" />
        {label}
      </div>
      {stat.error ? (
        <div className="font-(family-name:--font-heading) text-[1.75rem] font-bold text-[oklch(88%_0.01_265)] leading-none mb-1" aria-label="Data otillgänglig">–</div>
      ) : loading ? (
        <>
          <Skeleton height="2rem" width="3.5rem" />
          <div className="mt-1">
            <Skeleton height="0.75rem" width="5rem" />
          </div>
        </>
      ) : (
        <>
          <div className="font-(family-name:--font-heading) text-[1.75rem] font-bold text-[oklch(88%_0.01_265)] leading-none mb-1">
            {stat.published}
          </div>
          <div className="text-xs text-[oklch(55%_0.02_265)]">{valueLabel}</div>
          {showTotal && (
            <div className="text-[0.6875rem] text-[oklch(40%_0.01_265)] mt-0.5">
              {stat.total} totalt
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecentCol({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: React.ElementType;
  items: RecentItem[] | null;
}) {
  return (
    <div className="bg-[oklch(15%_0.012_265)] border border-[oklch(22%_0.015_265)] rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[oklch(22%_0.015_265)] text-xs font-semibold text-[oklch(65%_0.02_265)] uppercase tracking-[0.08em]">
        <Icon size={13} aria-hidden="true" />
        {label}
      </div>
      {items === null ? (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-[oklch(18%_0.01_265)] last:border-b-0 min-w-0 text-[0.8125rem]">
              <div className="flex-1 min-w-0">
                <Skeleton height="0.875rem" />
              </div>
            </div>
          ))}
        </>
      ) : items.length === 0 ? (
        <div className="px-5 py-5 text-[0.8125rem] text-[oklch(40%_0.01_265)]">Inga poster ännu.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-[oklch(18%_0.01_265)] last:border-b-0 text-[0.8125rem] min-w-0">
            <span className="flex-1 text-[oklch(75%_0.01_265)] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
              {item.title}
            </span>
            <span
              className={`shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded ${
                item.published
                  ? 'bg-[oklch(55%_0.15_145/20%)] text-[oklch(70%_0.15_145)]'
                  : 'bg-[oklch(22%_0.012_265)] text-[oklch(50%_0.02_265)]'
              }`}
            >
              {item.published ? 'Pub' : 'Utkast'}
            </span>
            <span className="text-[0.6875rem] text-[oklch(40%_0.01_265)] shrink-0">
              {item.date}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// Main component

export function DashboardContent() {
  const [data, setData] = useState<DashData>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const errStat: StatData = { published: null, total: null, error: true };
      const results = await Promise.allSettled([
        withTimeout(fetchStat('events', true), errStat),
        withTimeout(fetchStat('deals', true), errStat),
        withTimeout(fetchStat('career', true), errStat),
        withTimeout(fetchStat('admins', false), errStat),
        withTimeout(fetchRecent('events', 'title'), []),
        withTimeout(fetchRecent('deals', 'title'), []),
        withTimeout(fetchRecent('career', 'title'), []),
      ]);

      const [events, deals, opportunities, admins, recentEvents, recentDeals, recentOpportunities] =
        results;

      if (cancelled) return;

      setData({
        events: events.status === 'fulfilled' ? events.value : errStat,
        deals: deals.status === 'fulfilled' ? deals.value : errStat,
        opportunities: opportunities.status === 'fulfilled' ? opportunities.value : errStat,
        admins: admins.status === 'fulfilled' ? admins.value : errStat,
        recentEvents: recentEvents.status === 'fulfilled' ? recentEvents.value : [],
        recentDeals: recentDeals.status === 'fulfilled' ? recentDeals.value : [],
        recentOpportunities: recentOpportunities.status === 'fulfilled' ? recentOpportunities.value : [],
      });
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      {/* Stat-kort */}
      <p className="text-[0.8125rem] font-semibold text-[oklch(55%_0.02_265)] uppercase tracking-[0.08em] mb-4">
        Översikt
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Events" icon={Calendar} stat={data.events} />
        <StatCard label="Deals" icon={Tag} stat={data.deals} />
        <StatCard label="Jobb & Exj." icon={Briefcase} stat={data.opportunities} />
        <StatCard
          label="Admins"
          icon={Shield}
          stat={data.admins}
          valueLabel="aktiva"
          showTotal={false}
        />
      </div>

      {/* Snabblänkar */}
      <p className="text-[0.8125rem] font-semibold text-[oklch(55%_0.02_265)] uppercase tracking-[0.08em] mb-4">
        Hantera
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/admin/events',  Icon: Calendar,  label: 'Events' },
          { href: '/admin/deals',   Icon: Tag,        label: 'Deals' },
          { href: '/admin/career',  Icon: Briefcase,  label: 'Jobb & Exjobb' },
          { href: '/admin/admins',  Icon: Shield,     label: 'Adminhantering' },
        ].map(({ href, Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 bg-[oklch(15%_0.012_265)] border border-[oklch(22%_0.015_265)] rounded-md px-5 py-4 no-underline text-[oklch(72%_0.02_265)] text-sm font-medium transition-colors hover:bg-[oklch(20%_0.012_265)] hover:text-[oklch(88%_0.01_265)] hover:-translate-y-px"
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            <ArrowRight size={14} className="ml-auto text-[oklch(45%_0.02_265)]" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Senaste poster */}
      <p className="text-[0.8125rem] font-semibold text-[oklch(55%_0.02_265)] uppercase tracking-[0.08em] mb-4">
        Senaste poster
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentCol label="Events" icon={Calendar} items={data.recentEvents} />
        <RecentCol label="Deals" icon={Tag} items={data.recentDeals} />
        <RecentCol label="Jobb & Exj." icon={Briefcase} items={data.recentOpportunities} />
      </div>
    </div>
  );
}
