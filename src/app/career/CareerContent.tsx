'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Briefcase, Building2, Compass, Plus, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { useImageLoad } from '@/lib/hooks/useImageLoad';
import { HeroPhotoLayer } from '@/components/ui/HeroPhotoLayer';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { JobRow } from '@/components/ui/JobRow';
import { JobCardSkeleton } from '@/components/ui/JobCardSkeleton';
import { CareerDrawer } from '@/components/ui/CareerDrawer';
import { CareerFilterPanel } from '@/components/ui/CareerFilterPanel';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { TKLCareer, CareerType } from '@/lib/schemas/career';
// Service-lagret importeras dynamiskt i effekterna — statisk import drar in
// Firestore-SDK:t (~145 kB gzip) i sidans hydration-bundle och försämrar LCP.
import { useDrawerUrl } from '@/lib/hooks/useDrawerUrl';
import {
  DEFAULT_FILTERS, parseFilters, serializeFilters, applyFilters,
  deriveOptions, facetCounts, activeFilterCount, type CareerFilters,
} from '@/lib/careerFilters';
import { capture } from '@/lib/analytics';
import { toJsonLd } from '@/lib/json-ld';

const PAGE_SIZE = 20;

// Blå tint för sekundärknappar och aktiva filterchips. Neutral text (≥4,5:1 på tinten i
// båda teman) — --text-blue på blå tint över glasskort når bara ~4,3:1 i mörkt tema;
// accenten bärs av kant + bakgrund.
const BLUE_TINT = {
  background: 'color-mix(in srgb, #3B82F6 12%, transparent)',
  border: '1px solid color-mix(in srgb, #3B82F6 45%, transparent)',
  color: 'var(--hero-text)',
} as const;

export function CareerContent() {
  const { t } = useLanguage();
  const opportunity = t.opportunities;

  const [careerItems, setCareerItems] = useState<TKLCareer[]>([]);
  // Startar alltid på DEFAULT_FILTERS (identiskt på server och klient) — URL:en läses i en mount-effekt.
  const [filters, setFilters] = useState<CareerFilters>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Drawer state
  const [selectedJob, setSelectedJob] = useState<TKLCareer | null>(null);
  const previousFocusRef = useRef<HTMLButtonElement | null>(null);
  const { pushId, clearId } = useDrawerUrl();

  const handleCloseDrawer = useCallback(() => {
    setSelectedJob(null);
    clearId();
    previousFocusRef.current?.focus();
  }, [clearId]);

  // Väntande debouncad URL-skrivning (fritext). Spolas före drawerns pushState och rensas vid popstate.
  const urlWriteTimer = useRef<number | null>(null);
  const pendingUrlWrite = useRef<(() => void) | null>(null);

  const handleOpenJob = useCallback(
    (job: TKLCareer, triggerEl?: HTMLButtonElement) => {
      if (triggerEl) previousFocusRef.current = triggerEl;
      // Skriv ett väntande q till den nuvarande historikposten nu — annars hamnar det i drawerns post.
      if (urlWriteTimer.current !== null) {
        window.clearTimeout(urlWriteTimer.current);
        urlWriteTimer.current = null;
      }
      pendingUrlWrite.current?.();
      setSelectedJob(job);
      pushId(job.id);
      capture('career_job_viewed', {
        job_id: job.id,
        company: job.company,
        job_type: job.type,
        title: job.title,
      });
    },
    [pushId],
  );

  // Initial URL-check (direktnavigering till /career?id=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    void import('@/lib/services/career').then((m) => m.getCareerById(id)).then((j) => { if (j) setSelectedJob(j); });
  }, []); // kör bara vid mount

  // Browser back/forward — synkar både drawern och filtren mot URL:en
  useEffect(() => {
    const handler = () => {
      if (urlWriteTimer.current !== null) {
        window.clearTimeout(urlWriteTimer.current);
        urlWriteTimer.current = null;
      }
      pendingUrlWrite.current = null;
      const params = new URLSearchParams(window.location.search);
      setFilters(parseFilters(params));
      setVisibleCount(PAGE_SIZE);
      const id = params.get('id');
      if (!id) { setSelectedJob(null); return; }
      const cached = careerItems.find((j) => j.id === id);
      if (cached) setSelectedJob(cached);
      else void import('@/lib/services/career').then((m) => m.getCareerById(id)).then((j) => { if (j) setSelectedJob(j); });
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [careerItems]);

  // Filter ← URL vid mount (delade länkar, t.ex. /career?type=exjobb&org=public).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- engångssynk från URL efter hydration
    setFilters(parseFilters(new URLSearchParams(window.location.search)));
  }, []);

  // Filter → URL med replaceState: ingen ny historikpost, övriga params (?id=) bevaras.
  // Fritext skrivs debouncat (~250 ms) — filtreringen och fältet uppdateras direkt.
  // Unmount släpper bara timern (ingen skrivning till en URL man redan lämnat);
  // flush sker i stället när sökfältet tappar fokus, se flushPendingUrl.
  useEffect(() => () => {
    if (urlWriteTimer.current !== null) window.clearTimeout(urlWriteTimer.current);
  }, []);

  const flushPendingUrl = useCallback(() => {
    if (urlWriteTimer.current !== null) {
      window.clearTimeout(urlWriteTimer.current);
      urlWriteTimer.current = null;
    }
    pendingUrlWrite.current?.();
  }, []);

  const updateFilters = useCallback((patch: Partial<CareerFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    setVisibleCount(PAGE_SIZE);

    const writeUrl = () => {
      urlWriteTimer.current = null;
      pendingUrlWrite.current = null;
      try {
        const url = new URL(window.location.href);
        url.search = serializeFilters(next, new URLSearchParams(window.location.search)).toString();
        history.replaceState(history.state, '', url.toString());
      } catch {
        // Safari kastar SecurityError vid för många replaceState-anrop — filtret gäller ändå i UI:t.
      }
    };
    if (urlWriteTimer.current !== null) window.clearTimeout(urlWriteTimer.current);
    pendingUrlWrite.current = null;
    const onlyQuery = Object.keys(patch).length === 1 && 'q' in patch;
    if (onlyQuery) {
      pendingUrlWrite.current = writeUrl;
      urlWriteTimer.current = window.setTimeout(writeUrl, 250);
    } else {
      writeUrl();
    }

    if (patch.type && patch.type !== 'all') capture('career_filter_applied', { filter: patch.type });
    if (patch.org && patch.org !== 'all') capture('career_filter_applied', { org: patch.org });
    if (patch.company) capture('career_filter_applied', { company: patch.company });
    if (patch.location) capture('career_filter_applied', { location: patch.location });
  }, [filters]);

  const resetFilters = useCallback(() => updateFilters({ ...DEFAULT_FILTERS }), [updateFilters]);
  const openSheet = useCallback(() => setSheetOpen(true), []);
  const focusListingsHeading = useCallback(() => document.getElementById('career-listings-heading'), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Sheeten är lg:hidden — blir fönstret ≥1024px (rotation/resize) medan den är öppen
  // skulle den bli osynlig men fortsatt modal (fokusfälla, dold navbar). Stäng den.
  useEffect(() => {
    if (!sheetOpen) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setSheetOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [sheetOpen]);

  const shouldReduceMotion = useReducedMotion();
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);

  const { heroImages } = useSettings();
  const bgUrl = heroImages?.careerUrl || '/images/heroes/career.svg';
  const imgLoaded = useImageLoad(bgUrl);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    import('@/lib/services/career')
      .then((m) => m.getPublishedCareer())
      .then((data) => {
        if (isMounted) {
          setCareerItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          const isOffline = err?.code === 'unavailable' || !navigator.onLine;
          setError(isOffline ? opportunity.errorOffline : opportunity.error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [opportunity.error, fetchKey]);

  const filteredItems = useMemo(() => applyFilters(careerItems, filters), [careerItems, filters]);
  const options = useMemo(() => deriveOptions(careerItems), [careerItems]);
  const counts = useMemo(() => facetCounts(careerItems, filters), [careerItems, filters]);
  const activeCount = activeFilterCount(filters);
  const visibleItems = filteredItems.slice(0, visibleCount);
  // Filterknapp/träffantal bara när det finns något att filtrera (data eller aktiva filter)
  const hasFilterable = !loading && !error && (careerItems.length > 0 || activeCount > 0);

  // Aktiva filter som borttagbara chips — fungerar även för värden som inte
  // längre finns i datan (t.ex. arbetsgivare från en gammal delad länk).
  const activeChips: { key: string; label: string; clear: Partial<CareerFilters> }[] = [];
  if (filters.type !== 'all') activeChips.push({ key: 'type', label: opportunity.filters[filters.type], clear: { type: 'all' } });
  if (filters.org !== 'all') activeChips.push({ key: 'org', label: filters.org === 'public' ? opportunity.orgPublic : opportunity.orgCompany, clear: { org: 'all' } });
  if (filters.company) activeChips.push({ key: 'company', label: filters.company, clear: { company: '' } });
  if (filters.location) activeChips.push({ key: 'location', label: filters.location, clear: { location: '' } });
  if (filters.q.trim()) activeChips.push({ key: 'q', label: `“${filters.q.trim()}”`, clear: { q: '' } });

  const jobSchemaList = careerItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lediga tjänster & exjobb via TKL NEXUS',
    url: 'https://tklnexus.se/career',
    itemListElement: careerItems.map((opp, index) => {
      const employmentTypeMap: Record<CareerType, string> = {
        jobb: 'FULL_TIME',
        exjobb: 'INTERN',
        sommarjobb: 'TEMPORARY',
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

  const panel = (
    <CareerFilterPanel
      filters={filters}
      onChange={updateFilters}
      onSearchBlur={flushPendingUrl}
      onReset={resetFilters}
      options={options}
      counts={counts}
      activeCount={activeCount}
    />
  );

  return (
    <>
      {jobSchemaList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(jobSchemaList) }}
        />
      )}
      {/* HERO SECTION — kompakt så att annonserna syns ovanför vikningen */}
      <section
        ref={heroRef}
        className="relative min-h-[26svh] flex flex-col justify-center overflow-hidden pt-28 pb-4 px-4 sm:px-6 lg:px-8"
        aria-labelledby="career-hero-heading"
      >
        <HeroPhotoLayer url={bgUrl} isLoaded={imgLoaded} />

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

        <motion.div style={{ y: heroTextY }} className="relative max-w-7xl mx-auto w-full z-20">
          <StaggerReveal className="text-left" delay={0.1}>
            <RevealItem className="flex justify-start mb-4">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: 'var(--text-blue)',
                }}
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                {opportunity.badge}
              </span>
            </RevealItem>

            {/* hero-reveal (CSS) — LCP-elementet får inte vänta på hydration */}
            <div className="hero-reveal">
              <h1
                id="career-hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl hero-text hero-heading"
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
            </div>

            {/* hero-reveal (CSS) — stycket är LCP-element på mobil och får
                inte vänta på hydration; fördröjningen behåller staggern */}
            <div className="hero-reveal" style={{ animationDelay: '0.2s' }}>
              <p className="mt-4 text-base sm:text-lg hero-text-muted max-w-[52ch] leading-relaxed">
                {opportunity.description}
              </p>
            </div>
          </StaggerReveal>
        </motion.div>

        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* INNEHÅLLS-SEKTION — filterpanel vänster, tät radlista höger (Chalmers-stil) */}
      <section id="career-listings" className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-labelledby="career-listings-heading">
        {/* tabIndex=-1: fokusmål när filtersheeten stängs och filterknappen är dold (resize ≥lg) */}
        <h2 id="career-listings-heading" tabIndex={-1} className="sr-only">{opportunity.listingsHeading}</h2>
        <div className="max-w-7xl mx-auto pt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 lg:items-start">

          {/* Filterpanel — sticky på desktop */}
          <aside
            aria-label={opportunity.filterPanelTitle}
            className="hidden lg:block sticky top-28 rounded-2xl p-5 max-h-[calc(100svh-8.5rem)] overflow-y-auto overscroll-contain"
            style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
          >
            <p className="font-heading font-bold hero-text text-sm mb-4">{opportunity.filterPanelTitle}</p>
            {panel}
          </aside>

          <div className="min-w-0">
            {/* Verktygsrad: träffantal + mobil filterknapp. Utan annonser och utan aktiva
                filter finns inget att räkna eller filtrera — "Visar 0 av 0" och en Filter-
                knapp till tomma val är brus; tomt-statet nedan bär budskapet. */}
            <div className={`flex items-center justify-between gap-3 mb-4 ${hasFilterable ? 'min-h-11' : ''}`}>
              <p className="text-sm hero-text-muted tabular-nums" aria-live="polite" aria-atomic="true">
                {/* Enda live-regionen för resultat — tomt-state annonserar inte själv */}
                {loading || error || !hasFilterable
                  ? ''
                  : (careerItems.length === 1 ? opportunity.showingOne : opportunity.showing)
                      .replace('{shown}', String(filteredItems.length))
                      .replace('{total}', String(careerItems.length))}
              </p>
              <button
                type="button"
                onClick={openSheet}
                hidden={!hasFilterable}
                className="lg:hidden inline-flex items-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
                style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-border-subtle)', color: 'var(--hero-text)' }}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                {opportunity.openFilters}{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>

            {/* Aktiva filter som borttagbara chips (mobil + desktop) */}
            {activeChips.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-4" aria-label={opportunity.activeFilters}>
                {activeChips.map((c) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={() => updateFilters(c.clear)}
                      className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue) after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']"
                      style={BLUE_TINT}
                      aria-label={`${opportunity.removeFilter}: ${c.label}`}
                    >
                      <span className="max-w-[16rem] truncate">{c.label}</span>
                      <X className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* min-h stabiliserar höjden vid skeleton→innehåll-swap (CLS) */}
            <div className="min-h-[26rem]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 gap-2.5"
                    role="status"
                    aria-busy="true"
                    aria-label={opportunity.loading}
                  >
                    <JobCardSkeleton count={4} variant="row" />
                  </motion.div>
                ) : !error && filteredItems.length > 0 ? (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    {/* Stabil key + popLayout: filter exit-animerar raderna individuellt i stället för remount */}
                    <motion.ul layout={!shouldReduceMotion} className="space-y-2.5">
                      <AnimatePresence mode="popLayout">
                        {visibleItems.map((job, idx) => (
                          <JobRow
                            key={job.id}
                            job={job}
                            entryDelay={Math.min(idx, 10) * 0.02}
                            onViewDetails={(e) => handleOpenJob(job, e.currentTarget)}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                    {visibleCount < filteredItems.length && (
                      <div className="flex justify-center mt-6">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                          className="min-h-11 px-6 rounded-xl text-sm font-semibold cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
                          style={BLUE_TINT}
                        >
                          {opportunity.showMore}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Error-state */}
              {error && !loading && (
                <div className="flex justify-center py-16" role="alert">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                    <p className="text-red-400 light:text-red-700 font-medium">{error}</p>
                    <button
                      type="button"
                      onClick={() => { setError(null); setLoading(true); setFetchKey((k) => k + 1); }}
                      className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue) focus-visible:ring-offset-2 focus-visible:ring-offset-(--cosmic-bg)"
                      style={{ background: 'linear-gradient(135deg, var(--cta-blue), var(--cta-green-from))' }}
                    >
                      {opportunity.retry}
                    </button>
                  </div>
                </div>
              )}

              {/* Tomt state */}
              {!loading && !error && filteredItems.length === 0 && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center rounded-2xl"
                  style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                >
                  <Briefcase className="w-10 h-10 mb-4 opacity-40" style={{ color: '#3B82F6' }} aria-hidden="true" />
                  <p className="text-base sm:text-lg hero-text-muted max-w-[44ch]">
                    {filters.q.trim()
                      ? opportunity.searchNoResults.replace('{query}', () => filters.q.trim())
                      : activeCount === 0
                        ? opportunity.noOpps
                        : opportunity.noOppsFiltered}
                  </p>
                  {activeCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 min-h-11 px-5 rounded-xl text-sm font-semibold cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
                      style={BLUE_TINT}
                    >
                      {opportunity.resetFilters}
                    </button>
                  )}
                  {activeCount === 0 && (
                    <Link
                      href="/corporate/post"
                      className="mt-6 inline-flex items-center gap-2 min-h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={BLUE_TINT}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      {opportunity.emptyStateCta}
                    </Link>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={opportunity.filterPanelTitle}
        closeLabel={opportunity.closeFilters}
        fallbackFocus={focusListingsHeading}
        footer={
          <button
            type="button"
            onClick={closeSheet}
            className="w-full min-h-12 rounded-xl text-sm font-semibold text-white cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue) focus-visible:ring-offset-2 focus-visible:ring-offset-(--drawer-bg)"
            style={{ background: 'var(--cta-blue)' }}
          >
            {filteredItems.length === 1
              ? opportunity.showResultsOne
              : opportunity.showResults.replace('{count}', String(filteredItems.length))}
          </button>
        }
      >
        {panel}
      </BottomSheet>

      {/* Corporate CTA banner — visas bara när det finns jobb */}
      {!loading && !error && careerItems.length > 0 && <section className="px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(139,92,246,0.04))',
              border: '1px solid rgba(139,92,246,0.22)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.28)' }}>
              <Building2 className="w-6 h-6" style={{ color: '#8B5CF6' }} aria-hidden="true" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold hero-text text-base">{t.corporateCta.title}</p>
              <p className="hero-text-muted text-sm mt-1">{t.corporateCta.desc}</p>
            </div>
            <Link
              href="/corporate/post"
              className="shrink-0 inline-flex items-center min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: 'var(--text-purple)' }}
            >
              {t.corporateCta.btn}
            </Link>
          </div>
        </div>
      </section>}

      <CareerDrawer job={selectedJob} onClose={handleCloseDrawer} />
    </>
  );
}
