'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Briefcase, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { JobCard } from '@/components/ui/JobCard';
import { JobCardSkeleton } from '@/components/ui/JobCardSkeleton';
import type { TKLOpportunity, OpportunityType } from '@/lib/schemas/opportunity';
import { getPublishedOpportunities } from '@/lib/services/opportunities';

type FilterKey = OpportunityType | 'all';

// Filter Färger — blåspektrum (indigo → blå → himmelblå → cyan)
const FILTER_COLORS: Record<FilterKey, string> = {
  all: '#3B82F6',
  exjobb: '#6366F1',
  jobb: '#3B82F6',
  praktik: '#0EA5E9',
  trainee: '#06B6D4',
};

// Filter Tab - Framer Motion variant med hover/tap-animationer
function FilterTab({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
      style={{
        background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        color: active ? color : 'var(--hero-text-muted)',
        boxShadow: active ? `0 0 20px ${color}15` : 'none',
        transition: 'background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s',
      }}
      aria-pressed={active}
    >
      {active && <Sparkles className="w-4 h-4" style={{ color }} />}
      {label}
    </motion.button>
  );
}

export function CareerContent() {
  const { t } = useLanguage();
  const opportunity = t.opportunities;

  const [opportunities, setOpportunities] = useState<TKLOpportunity[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
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

    getPublishedOpportunities()
      .then((data) => {
        if (isMounted) {
          setOpportunities(data);
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

  const filteredOpps = filter === 'all'
    ? opportunities
    : opportunities.filter((o) => o.type === filter);

  return (
    <>
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

            <RevealItem className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <a
                href="#career-listings"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  boxShadow: '0 0 28px rgba(59,130,246,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {opportunity.ctaSeeJobs}
              </a>
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

          {/* Filtrering */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12 pt-10"
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
              />
            ))}
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
          {!loading && !error && filteredOpps.length === 0 && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
              style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
            >
              <Briefcase className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
              <p className="text-lg hero-text-muted">
                {filter === 'all' ? opportunity.noOpps : opportunity.noOppsFiltered}
              </p>
            </motion.div>
          )}

          {/* Aria-live region för filterresultat */}
          {!loading && !error && (
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {opportunity.resultsCount.replace('{count}', String(filteredOpps.length))}
            </p>
          )}

          {/* Jobb Grid */}
          {!loading && !error && filteredOpps.length > 0 && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredOpps.map((job) => (
                  <JobCard key={job.id} job={job} color={FILTER_COLORS[job.type]} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </section>
    </>
  );
}
