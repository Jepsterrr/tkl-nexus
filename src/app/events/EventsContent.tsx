'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CalendarDays, MapPin, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { TKLEvent, Section } from '@/lib/schemas/event';
import { getPublishedEvents } from '@/lib/services/events';

// Section logo map
const SECTION_LOGOS: Record<Section, string | null> = {
  data: '/Logo/Data.png',
  geo: '/Logo/Geo.png',
  i: '/Logo/I.png',
  maskin: '/Logo/Maskin.png',
  general: null,
};

const SECTION_COLORS: Record<Section, string> = {
  data: '#f7cf3b',
  geo: '#858585',
  i: '#172191',
  maskin: '#5c0d0d',
  general: '#8B5CF6',
};

type FilterKey = Section | 'all';

// Event Card
function EventCard({ event, idx }: { event: TKLEvent; idx: number }) {
  const { t } = useLanguage();
  const { events: ev } = t;
  const shouldReduceMotion = useReducedMotion();
  const color = SECTION_COLORS[event.section];
  const logo = SECTION_LOGOS[event.section];

  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' });

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
      layout
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.07)`,
        backdropFilter: 'blur(12px)',
      }}
      aria-label={event.title}
    >
      {/* Accent edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: color }}
        aria-hidden="true"
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}18, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5">
        {/* Date badge */}
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl text-white font-bold"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <span className="text-xl leading-none" style={{ color }}>{day}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-70">{month}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Section & logo */}
          <div className="flex items-center gap-2 mb-2">
            {logo && (
              <img
                src={logo}
                alt={ev.sections[event.section]}
                width={20}
                height={20}
                className="object-contain"
              />
            )}
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color }}
            >
              {ev.sections[event.section]}
            </span>
          </div>

          <h3 className="hero-text font-semibold text-base leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
            {event.title}
          </h3>

          <p className="hero-text-muted text-sm leading-relaxed line-clamp-2 mb-3">
            {event.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs hero-text-subtle">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {event.location}
            </span>
            {event.tags.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                {event.tags.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 mt-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle">
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          {dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
        </span>
        <button
          className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2"
          style={{ color }}
          aria-label={`${ev.eventReadMore}: ${event.title}`}
        >
          {ev.eventReadMore}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}

// Filter Tab
function FilterTab({
  active,
  onClick,
  logo,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  logo: string | null;
  label: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
      style={{
        background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        color: active ? color : 'var(--hero-text-muted)',
        boxShadow: active ? `0 0 16px ${color}22` : 'none',
      }}
      aria-pressed={active}
    >
      {logo && (
        <img src={logo} alt="" width={16} height={16} className="object-contain" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}

export function EventsContent() {
  const { t } = useLanguage();
  const { events: ev } = t;
  const shouldReduceMotion = useReducedMotion();

  const [allEvents, setAllEvents] = useState<TKLEvent[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublishedEvents()
      .then((data) => {
        if (isMounted) {
          setAllEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Kunde inte hämta events.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered =
    filter === 'all' ? allEvents : allEvents.filter((e) => e.section === filter);

  const FILTERS: { key: FilterKey; label: string; logo: string | null; color: string }[] = [
    { key: 'all', label: ev.filterAll, logo: null, color: '#8B5CF6' },
    { key: 'data', label: ev.filterData, logo: '/Logo/Data.png', color: SECTION_COLORS.data },
    { key: 'geo', label: ev.filterGeo, logo: '/Logo/Geo.png', color: SECTION_COLORS.geo },
    { key: 'i', label: ev.filterI, logo: '/Logo/I.png', color: SECTION_COLORS.i },
    { key: 'maskin', label: ev.filterMaskin, logo: '/Logo/Maskin.png', color: SECTION_COLORS.maskin },
  ];

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[55vh] flex flex-col justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8"
        aria-labelledby="events-hero-heading"
      >
        {/* Depth-0: Background atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(139,92,246,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 85% 75%, rgba(59,130,246,0.08) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-1: Orbs */}
        <GradientOrb color="purple" size={500} top="35%" left="55%" opacity={0.10} animClass="animate-orb-float" />
        <GradientOrb color="green" size={280} top="65%" left="10%" opacity={0.06} animClass="animate-orb-float-reverse" />

        {/* Depth-4: Content */}
        <div className="relative max-w-4xl mx-auto w-full">
          <StaggerReveal className="text-center" delay={0.1}>
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#8B5CF6',
                }}
              >
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                {ev.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="events-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold hero-text leading-[1.1] tracking-tight"
              >
                {ev.heading}{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #60A5FA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {ev.headingAccent}
                  {/* Underline glow */}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, #8B5CF6, #60A5FA, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {ev.description}
              </p>
            </RevealItem>
          </StaggerReveal>
        </div>

        {/* Fade-out at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* Filters + Grid */}
      <section
        className="relative px-4 sm:px-6 lg:px-8 pb-24"
        aria-label="Events"
      >
        <div className="max-w-6xl mx-auto">
          {/* Filter bar */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-10"
            role="group"
            aria-label="Filtrera events efter sektion"
          >
            {FILTERS.map((f) => (
              <FilterTab
                key={f.key}
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
                logo={f.logo}
                label={f.label}
                color={f.color}
              />
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-24" aria-live="polite" aria-busy="true">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: '#8B5CF6' }}
                aria-label="Laddar events..."
              />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <p className="text-center hero-text-muted py-16" role="alert">
              {error}
            </p>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center hero-text-muted py-16"
            >
              {filter === 'all' ? ev.noEvents : ev.noEventsFiltered}
            </motion.p>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((event, idx) => (
                  <EventCard key={event.id} event={event} idx={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
