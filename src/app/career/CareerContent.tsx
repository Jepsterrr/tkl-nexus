'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Briefcase, Compass, Search, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { FilterTab } from '@/components/ui/FilterTab';
import { JobCard } from '@/components/ui/JobCard';
import { JobCardSkeleton } from '@/components/ui/JobCardSkeleton';
import type { TKLCareer, CareerType } from '@/lib/schemas/career';
import { getPublishedCareer } from '@/lib/services/career';

type FilterKey = CareerType | 'all';

// Filter Färger — blåspektrum (indigo → blå → himmelblå → cyan)
const FILTER_COLORS: Record<FilterKey, string> = {
  all: '#3B82F6',
  exjobb: '#6366F1',
  jobb: '#3B82F6',
  praktik: '#0EA5E9',
  trainee: '#06B6D4',
};

export function CareerContent() {
  const { t } = useLanguage();
  const opportunity = t.opportunities;

  const [careerItems, setCareerItems] = useState<TKLCareer[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublishedCareer()
      .then((data) => {
        if (isMounted) {
          setCareerItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError(opportunity.error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [opportunity.error, fetchKey]);

  const filteredItems = careerItems
    .filter((o) => filter === 'all' || o.type === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        (o.location ?? '').toLowerCase().includes(q)
      );
    });

  const jobSchemaList = careerItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lediga tjänster & exjobb via TKL NEXUS',
    url: 'https://tklnexus.se/career',
    itemListElement: careerItems.map((opp, index) => {
      const employmentTypeMap: Record<string, string> = {
        jobb: 'FULL_TIME',
        exjobb: 'INTERN',
        praktik: 'INTERN',
        trainee: 'FULL_TIME',
      };
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'JobPosting',
          title: opp.title,
          description: opp.description ?? `${opp.type} hos ${opp.company} i ${opp.location}`,
          datePosted: opp.createdAt,
          ...(opp.deadline ? { validThrough: opp.deadline } : {}),
          employmentType: employmentTypeMap[opp.type] ?? 'FULL_TIME',
          hiringOrganization: {
            '@type': 'Organization',
            name: opp.company,
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: opp.location || 'Luleå',
              addressCountry: 'SE',
            },
          },
          ...(opp.applyUrl ? { url: opp.applyUrl } : {}),
        },
      };
    }),
  } : null;

  return (
    <>
      {jobSchemaList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchemaList) }}
        />
      )}
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-[45svh] flex flex-col justify-center overflow-hidden pt-28 pb-8 px-4 sm:px-6 lg:px-8"
        aria-labelledby="career-hero-heading"
      >
        {/* Blueprint grid (reinforced) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full z-20">
          <StaggerReveal className="text-left" delay={0.1}>
            <RevealItem className="flex justify-start mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#3B82F6',
                }}
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                {opportunity.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="career-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl hero-text hero-heading"
                style={{ fontWeight: 800 }}
              >
                {opportunity.heading}{' '}
                <span className="relative inline-block text-accent-blue">
                  {opportunity.headingAccent}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-[52ch] leading-relaxed">
                {opportunity.description}
              </p>
            </RevealItem>

            {/* Trust chips — visible on all sizes */}
            <RevealItem className="flex flex-wrap justify-start gap-2 mt-4">
              {[opportunity.pills.types, opportunity.pills.ltu].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}>
                  <span className="w-1 h-1 rounded-full bg-[#3B82F6] shrink-0" />
                  {label}
                </span>
              ))}
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

{/* INNEHÅLLS-SEKTION */}
      <section id="career-listings" className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-labelledby="career-listings-heading">
        <h2 id="career-listings-heading" className="sr-only">{opportunity.listingsHeading}</h2>
        <div className="max-w-6xl mx-auto">

          {/* Sök + Filtrering */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10 pt-10 space-y-4"
          >
            {/* Sökfält */}
            <div className="relative max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--hero-text-subtle)' }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={opportunity.searchPlaceholder}
                className="w-full rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all duration-150"
                style={{
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--glass-border-subtle)',
                  color: 'var(--hero-text)',
                }}
                aria-label={opportunity.searchPlaceholder}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-opacity hover:opacity-70"
                  aria-label="Rensa sökning"
                >
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--hero-text-subtle)' }} />
                </button>
              )}
            </div>

            {/* Filter-flikar */}
            <div
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
              role="group"
              aria-label={opportunity.filterAriaLabel}
            >
              {(Object.keys(FILTER_COLORS) as FilterKey[]).map((key) => (
                <FilterTab
                  key={key}
                  active={filter === key}
                  onClick={() => setFilter(key)}
                  label={opportunity.filters[key]}
                  color={FILTER_COLORS[key]}
                  showActiveIcon
                />
              ))}
            </div>
          </motion.div>

          {/* Laddar-state */}
          {loading && (
            <div aria-live="polite" aria-busy="true" aria-label={opportunity.loading} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <JobCardSkeleton count={6} accentColor="blue" />
            </div>
          )}

          {/* Error-state */}
          {error && !loading && (
            <div className="flex justify-center py-16" role="alert">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={() => { setError(null); setLoading(true); setFetchKey((k) => k + 1); }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
                >
                  {opportunity.retry}
                </button>
              </div>
            </div>
          )}

          {/* Tomt State */}
          {!loading && !error && filteredItems.length === 0 && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
              style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
            >
              <Briefcase className="w-12 h-12 mb-4 opacity-40" style={{ color: '#3B82F6' }} aria-hidden="true" />
              <p className="text-lg hero-text-muted">
                {search.trim()
                  ? opportunity.searchNoResults.replace('{query}', search)
                  : filter === 'all'
                    ? opportunity.noOpps
                    : opportunity.noOppsFiltered}
              </p>
              {filter === 'all' && !search.trim() && (
                <Link
                  href="/corporate/post"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6' }}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  {opportunity.emptyStateCta}
                </Link>
              )}
            </motion.div>
          )}

          {/* Aria-live region för filterresultat */}
          {!loading && !error && (
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {opportunity.resultsCount.replace('{count}', String(filteredItems.length))}
            </p>
          )}

          {/* Jobb Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.08 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((job, idx) => (
                  <JobCard key={job.id} job={job} color={FILTER_COLORS[job.type]} entryDelay={idx * 0.03} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </section>
    </>
  );
}
