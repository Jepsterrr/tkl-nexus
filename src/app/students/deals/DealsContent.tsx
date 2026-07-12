'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, LayoutGroup } from 'framer-motion';
import { Tag, PlusCircle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { DealCard } from '@/components/ui/DealCard';
import { DealDrawer } from '@/components/ui/DealDrawer';
import type { TKLDeal } from '@/lib/schemas/deal';
// Service-lagret importeras dynamiskt i effekterna — statisk import drar in
// Firestore-SDK:t (~145 kB gzip) i sidans hydration-bundle och försämrar LCP.
import { useDrawerUrl } from '@/lib/hooks/useDrawerUrl';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { capture } from '@/lib/analytics';

type ViewMode = 'icon' | 'detail';

// Deals Page Content
export function DealsContent() {
  const { t } = useLanguage();
  const { deals } = t;

  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-30%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);
  const floatY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-22%']);

  const [allDeals, setAllDeals] = useState<TKLDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  // Init alltid 'icon' och läs localStorage i en effect — en initializer som
  // läser localStorage ger hydration-mismatch (servern prerendrar 'icon').
  const [viewMode, setViewMode] = useState<ViewMode>('icon');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tkl-deals-view');
      if (saved === 'icon' || saved === 'detail') setViewMode(saved);
    } catch {}
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('tkl-deals-view', mode);
    } catch {}
  };

  // Drawer state
  const [selectedDeal, setSelectedDeal] = useState<TKLDeal | null>(null);
  const previousFocusRef = useRef<HTMLButtonElement | null>(null);
  const { pushId, clearId } = useDrawerUrl();

  const handleCloseDrawer = useCallback(() => {
    setSelectedDeal(null);
    clearId();
    previousFocusRef.current?.focus();
  }, [clearId]);

  const handleOpenDeal = useCallback(
    (deal: TKLDeal, triggerEl?: HTMLButtonElement) => {
      if (triggerEl) previousFocusRef.current = triggerEl;
      setSelectedDeal(deal);
      pushId(deal.id);
      capture('deal_details_viewed', {
        deal_id: deal.id,
        company: deal.company,
        discount: deal.discount,
      });
    },
    [pushId],
  );

  // Initial URL-check (direktnavigering till /students/deals?id=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    void import('@/lib/services/deals').then((m) => m.getDealById(id)).then((d) => { if (d) setSelectedDeal(d); });
  }, []); // kör bara vid mount

  // Browser back/forward
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) { setSelectedDeal(null); return; }
      const cached = allDeals.find((d) => d.id === id);
      if (cached) setSelectedDeal(cached);
      else void import('@/lib/services/deals').then((m) => m.getDealById(id)).then((d) => { if (d) setSelectedDeal(d); });
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [allDeals]);

  // Hämta deals från Firestore (klientdriven)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    import('@/lib/services/deals')
      .then((m) => m.getPublishedDeals())
      .then((data) => {
        if (isMounted) {
          setAllDeals(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[DealsContent]', err);
          setError(deals.error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [deals, fetchKey]);

  return (
    <>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-[60svh] flex flex-col justify-center overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8"
        aria-labelledby="deals-hero-heading"
      >
        {/* Diagonal hatch bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(245,158,11,0.055) 0px, rgba(245,158,11,0.055) 1px, transparent 1px, transparent 28px)',
          }}
          aria-hidden="true"
        />

        {/* Rotated card silhouette */}
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: 'clamp(280px, 45vw, 520px)',
              height: 'clamp(175px, 28vw, 325px)',
              border: '1px solid rgba(245,158,11,0.20)',
              borderRadius: '28px',
              background: 'rgba(245,158,11,0.06)',
              transform: 'translate(-50%, -50%) rotate(-12deg)',
            }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Depth-3: Floating geometry + context pills */}
        <motion.div style={{ y: floatY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.span
            className="absolute top-[22%] right-[11%] text-4xl select-none"
            style={{ color: '#F59E0B', opacity: 0.14, textShadow: '0 0 22px rgba(245,158,11,0.6)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -14, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >✦</motion.span>
          <motion.span
            className="absolute top-[53%] left-[5%] text-2xl select-none"
            style={{ color: '#8B5CF6', opacity: 0.11, textShadow: '0 0 14px rgba(139,92,246,0.5)' }}
            animate={shouldReduceMotion ? {} : { y: [0, 12, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          >◆</motion.span>
          <motion.span
            className="absolute top-[37%] right-[4%] text-xl select-none"
            style={{ color: '#F59E0B', opacity: 0.08 }}
            animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          >%</motion.span>
        </motion.div>

        {/* Desktop: split — heading left, detail right. Mobile: stacked. */}
        <motion.div style={{ y: heroTextY }} className="relative w-full max-w-7xl mx-auto z-20">
          <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] lg:gap-16 lg:items-end">

            {/* Vänster: rubrik */}
            <StaggerReveal delay={0.05}>
              {/* Inte aria-hidden — eyebrown är innehåll, enda sidan som gömde sin */}
              <RevealItem>
                <p
                  className="text-xs font-mono uppercase tracking-[0.2em] mb-5"
                  style={{ color: 'var(--text-orange)' }}
                >
                  {deals.badge}
                </p>
              </RevealItem>
              {/* hero-reveal (CSS) — LCP-elementet får inte vänta på hydration */}
              <div className="hero-reveal">
                <h1
                  id="deals-hero-heading"
                  className="hero-text hero-heading"
                  style={{ fontSize: 'clamp(3rem, 8vw + 0.5rem, 8rem)', lineHeight: 0.92 }}
                >
                  {deals.heading}
                  <br />
                  <span className="text-accent-orange">{deals.headingAccent}</span>
                </h1>
              </div>
              {/* Separator */}
              <RevealItem>
                <div
                  className="mt-8 h-px w-24"
                  style={{ background: 'linear-gradient(90deg, #F59E0B, transparent)' }}
                  aria-hidden="true"
                />
              </RevealItem>
            </StaggerReveal>

            {/* Höger: beskrivning + kontextchips */}
            <StaggerReveal delay={0.25} className="mt-8 lg:mt-0 lg:pb-4">
              <RevealItem>
                <p className="text-base sm:text-lg hero-text-muted leading-relaxed max-w-[42ch]">
                  {deals.description}
                </p>
              </RevealItem>
              <RevealItem className="flex flex-wrap gap-2 mt-6">
                {[deals.pills.exclusive, deals.pills.name].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', color: 'var(--text-orange)' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </RevealItem>
            </StaggerReveal>
          </div>
        </motion.div>

        {/* Fade-out + scroll cue */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          animate={shouldReduceMotion ? {} : { y: [0, 7, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="w-px h-10 mx-auto rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(245,158,11,0.5))' }} />
        </motion.div>
      </section>

      {/* DEALS-LISTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-label={deals.badge}>
        <div className="max-w-4xl mx-auto">

          {/* View toggle */}
          {!loading && !error && allDeals.length > 0 && (
            <div className="flex justify-end mb-5">
              <LayoutGroup id="deals-view-toggle">
                <div
                  className="flex items-center gap-0.5 p-1 rounded-xl"
                  style={{
                    background: 'var(--about-card-bg)',
                    border: '1px solid var(--about-card-border)',
                  }}
                  role="group"
                  aria-label={deals.viewToggleAriaLabel}
                >
                  {(['icon', 'detail'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleViewChange(mode)}
                      aria-pressed={viewMode === mode}
                      className="relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 z-10"
                      style={{
                        // --text-muted existerar inte i temat — hero-text-muted är temasäker
                        color: viewMode === mode ? '#0a0a0a' : 'var(--hero-text-muted)',
                      }}
                    >
                      {viewMode === mode && (
                        <motion.span
                          layoutId="deals-view-indicator"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: '#F59E0B' }}
                          transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">
                        {mode === 'icon' ? deals.viewIcons : deals.viewDetails}
                      </span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </div>
          )}

          {/* Laddning — skeleton i ikonrastrets form (samma mönster som Career) */}
          {loading && (
            <div
              role="status"
              aria-busy="true"
              aria-label={deals.loading}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer rounded-2xl aspect-square" aria-hidden="true" />
              ))}
            </div>
          )}

          {/* Fel-state */}
          {error && !loading && (
            <div className="flex justify-center py-16" role="alert">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                <p className="text-red-400 light:text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => setFetchKey((k) => k + 1)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #B45309, #C2410C)' }}
                >
                  {deals.retry}
                </button>
              </div>
            </div>
          )}

          {/* Tomt state */}
          {!loading && !error && allDeals.length === 0 && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
              style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
            >
              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <Tag className="w-12 h-12 mb-4 opacity-35" style={{ color: '#F59E0B' }} />
              </motion.div>
              <p className="text-lg hero-text-muted">
                {deals.noDeals}
              </p>
              <p className="text-sm hero-text-subtle mt-2">
                {deals.noDealsHint}
              </p>
              <Link
                href="/corporate/post"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--text-orange)' }}
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                {deals.emptyStateCta}
              </Link>
            </motion.div>
          )}

          {/* Deals-lista */}
          {!loading && !error && allDeals.length > 0 && (
            <motion.div
              layout
              className={
                viewMode === 'icon'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              }
            >
              <AnimatePresence mode="popLayout">
                {allDeals.map((deal, idx) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    idx={idx}
                    variant={viewMode}
                    onViewDetails={(e) => handleOpenDeal(deal, e.currentTarget)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Corporate CTA banner — visas bara när det finns deals */}
      {!loading && !error && allDeals.length > 0 && <section className="px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(139,92,246,0.04))',
              border: '1px solid rgba(139,92,246,0.22)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.28)' }}>
              <Building2 className="w-6 h-6" style={{ color: 'var(--text-purple)' }} aria-hidden="true" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold hero-text text-base">{t.corporateCta.title}</p>
              <p className="hero-text-muted text-sm mt-1">{t.corporateCta.desc}</p>
            </div>
            <Link
              href="/corporate/post"
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: 'var(--text-purple)' }}
            >
              {t.corporateCta.btn}
            </Link>
          </div>
        </div>
      </section>}

      <DealDrawer deal={selectedDeal} onClose={handleCloseDrawer} />
    </>
  );
}
