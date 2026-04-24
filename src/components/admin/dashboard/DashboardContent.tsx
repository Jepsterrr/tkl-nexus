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
    <div className="dash-stat-card" aria-busy={loading || undefined}>
      <div className="dash-stat-header">
        <Icon size={14} aria-hidden="true" />
        {label}
      </div>
      {stat.error ? (
        <div className="dash-stat-number" aria-label="Data otillgänglig">–</div>
      ) : loading ? (
        <>
          <div
            className="admin-skeleton"
            style={{ height: '2rem', width: '3.5rem', marginBottom: 'var(--space-1)' }}
          />
          <div
            className="admin-skeleton"
            style={{ height: '0.75rem', width: '5rem' }}
          />
        </>
      ) : (
        <>
          <div className="dash-stat-number">{stat.published}</div>
          <div className="dash-stat-label">{valueLabel}</div>
          {showTotal && (
            <div className="dash-stat-total">{stat.total} totalt</div>
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
    <div className="dash-recent-col">
      <div className="dash-recent-col-header">
        <Icon size={13} aria-hidden="true" />
        {label}
      </div>
      {items === null ? (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} className="dash-recent-row">
              <div
                className="admin-skeleton dash-recent-title"
                style={{ height: '0.875rem' }}
              />
            </div>
          ))}
        </>
      ) : items.length === 0 ? (
        <div className="dash-recent-empty">Inga poster ännu.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="dash-recent-row">
            <span className="dash-recent-title">{item.title}</span>
            <span
              className={`dash-badge ${
                item.published ? 'dash-badge-published' : 'dash-badge-draft'
              }`}
            >
              {item.published ? 'Pub' : 'Utkast'}
            </span>
            <span className="dash-recent-date">{item.date}</span>
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
        withTimeout(fetchStat('opportunities', true), errStat),
        withTimeout(fetchStat('admins', false), errStat),
        withTimeout(fetchRecent('events', 'title'), []),
        withTimeout(fetchRecent('deals', 'title'), []),
        withTimeout(fetchRecent('opportunities', 'title'), []),
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
      <p className="dash-section-title">Översikt</p>
      <div className="dash-stats-grid">
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
      <p className="dash-section-title">Hantera</p>
      <div className="dash-links-grid">
        <Link href="/admin/events" className="dash-link-card">
          <Calendar size={16} aria-hidden="true" />
          Events
          <ArrowRight size={14} className="dash-link-arrow" aria-hidden="true" />
        </Link>
        <Link href="/admin/deals" className="dash-link-card">
          <Tag size={16} aria-hidden="true" />
          Deals
          <ArrowRight size={14} className="dash-link-arrow" aria-hidden="true" />
        </Link>
        <Link href="/admin/opportunities" className="dash-link-card">
          <Briefcase size={16} aria-hidden="true" />
          Jobb & Exjobb
          <ArrowRight size={14} className="dash-link-arrow" aria-hidden="true" />
        </Link>
        <Link href="/admin/admins" className="dash-link-card">
          <Shield size={16} aria-hidden="true" />
          Adminhantering
          <ArrowRight size={14} className="dash-link-arrow" aria-hidden="true" />
        </Link>
      </div>

      {/* Senaste poster */}
      <p className="dash-section-title">Senaste poster</p>
      <div className="dash-recent">
        <RecentCol label="Events" icon={Calendar} items={data.recentEvents} />
        <RecentCol label="Deals" icon={Tag} items={data.recentDeals} />
        <RecentCol label="Jobb & Exj." icon={Briefcase} items={data.recentOpportunities} />
      </div>
    </div>
  );
}
