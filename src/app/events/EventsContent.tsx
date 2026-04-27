'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CalendarDays, MapPin, Tag, Loader2, ExternalLink, Search, Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { FilterTab } from '@/components/ui/FilterTab';
import { LuddCalendar } from '@/components/ui/LuddCalendar';
import type { TKLEvent, Section } from '@/lib/schemas/event';
import { getPublishedEvents } from '@/lib/services/events';
import { EASE_OUT_EXPO } from '@/lib/motion';

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
type ExtendedEvent = TKLEvent & { externalUrl?: string };

// Event Card
function EventCard({ event, entryDelay = 0 }: { event: ExtendedEvent; entryDelay?: number }) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const shouldReduceMotion = useReducedMotion();
  const color = SECTION_COLORS[event.section];
  const logo = SECTION_LOGOS[event.section];

  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' });

  const isEnglish = locale === 'en';

  const displayTitle = isEnglish && event.titleEn ? event.titleEn : event.title;
  const displayDesc = isEnglish && event.descriptionEn ? event.descriptionEn : event.description;

  const isExternal = !!event.externalUrl;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: entryDelay, ease: EASE_OUT_EXPO }}
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-300"
    >

      {/* Hover glow - pointer-events-none ser till att glöden aldrig blockerar klick */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}18, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5 flex-1 relative z-10">
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl text-white font-bold"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <span className="text-xl leading-none" style={{ color }}>{day}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-70">{month}</span>
        </div>

        <div className="flex-1 min-w-0">
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

          <h3 className="hero-text font-semibold text-base leading-snug mb-1 line-clamp-2 group-hover:text-foreground transition-colors">
            {displayTitle}
          </h3>

          <p className="hero-text-muted text-sm leading-relaxed line-clamp-2 mb-3">
            {displayDesc}
          </p>

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

      {/* FOOTER - z-20 säkerställer att länken ligger högst upp och alltid kan klickas */}
      <div
        className="flex items-center justify-between px-5 py-3 mt-1 relative"
        style={{ borderTop: '1px solid var(--about-card-border)' }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle">
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          {dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
        </span>

        {/* Endast texten är klickbar som en helt vanlig länk */}
        {isExternal && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2 hover:opacity-80 cursor-pointer"
            style={{ color }}
          >
            {ev.readOnLudd}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function EventsContent() {
  const { t } = useLanguage();
  const { events: ev } = t;

  const [allEvents, setAllEvents] = useState<ExtendedEvent[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  // State variables for LUDD Data
  const [calendarView, setCalendarView] = useState<'nexus' | 'ludd'>('nexus');
  const [luddEvents, setLuddEvents] = useState<ExtendedEvent[]>([]);
  const [luddLoading, setLuddLoading] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const [luddError, setLuddError] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef as React.RefObject<HTMLElement>,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', shouldReduceMotion ? '0%' : '-10%']
  );

  // Fetch TKL Events
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getPublishedEvents()
      .then((data) => {
        if (isMounted) { setAllEvents(data); setLoading(false); }
      })
      .catch(() => {
        if (isMounted) { setError(ev.nexusFetchError); setLoading(false); }
      });
    return () => { isMounted = false; };
  }, [ev, fetchKey]);

  // Fetch LUDD Events as JSON when switching tab
  useEffect(() => {
    if (calendarView === 'ludd' && luddEvents.length === 0) {
      let isMounted = true;
      setLuddLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      fetch('https://events.ludd.ltu.se/api/events?show_recurrent=true', { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          const items = Array.isArray(data) ? data : data.events || [];

          // Mappar LUDD-datan till vårt utökade ExtendedEvent-format
          const mapped: ExtendedEvent[] = items.map((item: any) => {
            const timeMs = item.start_datetime > 9999999999 ? item.start_datetime : item.start_datetime * 1000;
            return {
              id: `ludd-${item.id || Math.random()}`,
              title: item.title || 'Campus Event',
              description: item.description ? item.description.replace(/<[^>]*>?/gm, '').trim() : '',
              date: new Date(timeMs).toISOString(),
              location: item.place_name || item.place_address || 'LUDD (Campus)',
              tags: item.tags || [],
              section: 'general',
              published: true,
              createdAt: new Date().toISOString(),
              externalUrl: item.url || `https://events.ludd.ltu.se/event/${item.slug || item.id}`,
            };
          });

          setLuddEvents(mapped);
          setLuddLoading(false);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          console.error('LUDD API Error:', err);
          setLuddError(true);
          setLuddLoading(false);
        });

      return () => { isMounted = false; controller.abort(); clearTimeout(timeoutId); };
    }
  }, [calendarView, luddEvents.length]);

  const filtered = allEvents
    .filter((e) => filter === 'all' || e.section === filter)
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location ?? '').toLowerCase().includes(q)
      );
    });
  const filteredLuddEvents =
    calendarSelectedDate !== null
      ? luddEvents.filter((e) => {
          const d = new Date(e.date);
          return d.toDateString() === calendarSelectedDate.toDateString();
        })
      : luddEvents;

  const FILTERS: { key: FilterKey; label: string; logo: string | null; color: string }[] = [
    { key: 'all', label: ev.filterAll, logo: null, color: '#8B5CF6' },
    { key: 'data', label: ev.filterData, logo: '/Logo/Data.png', color: SECTION_COLORS.data },
    { key: 'geo', label: ev.filterGeo, logo: '/Logo/Geo.png', color: SECTION_COLORS.geo },
    { key: 'i', label: ev.filterI, logo: '/Logo/I.png', color: SECTION_COLORS.i },
    { key: 'maskin', label: ev.filterMaskin, logo: '/Logo/Maskin.png', color: SECTION_COLORS.maskin },
  ];

  const eventSchemaList = allEvents.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kommande events – TKL Nexus',
    url: 'https://tklnexus.se/events',
    itemListElement: allEvents.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        ...(event.endDate ? { endDate: event.endDate } : {}),
        description: event.description,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Luleå',
            addressRegion: 'Norrbotten',
            addressCountry: 'SE',
          },
        },
        organizer: {
          '@type': 'Organization',
          name: 'TKL Nexus',
          url: 'https://tklnexus.se',
        },
      },
    })),
  } : null;

  return (
    <>
      {eventSchemaList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemaList) }}
        />
      )}
      <section ref={heroRef} className="relative min-h-[60svh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8" aria-labelledby="events-hero-heading">
        {/* Concentric circles bg */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%]"
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {[80, 180, 280, 380, 480].map((r, i) => (
              <circle
                key={r}
                cx="400"
                cy="400"
                r={r}
                stroke="rgba(139,92,246,0.13)"
                strokeWidth="1"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </svg>
        </div>

        <div className="relative w-full max-w-7xl mx-auto z-20">
          {/* Desktop: poster split — heading words stacked left, content right */}
          <div className="hidden lg:grid lg:grid-cols-[auto_1fr] lg:gap-20 lg:items-center">
            <motion.div style={{ y: heroTextY }}>
              <StaggerReveal delay={0.05}>
                <h1
                  id="events-hero-heading"
                  className="hero-text"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, fontSize: 'clamp(4rem, 7vw, 7rem)' }}
                >
                  {ev.heading.split(' ').map((word, i) => (
                    <RevealItem key={i} className="block">{word}</RevealItem>
                  ))}
                  <RevealItem className="block">
                    <span className="text-accent-purple">{ev.headingAccent}</span>
                  </RevealItem>
                </h1>
              </StaggerReveal>
            </motion.div>

            <motion.div style={{ y: heroTextY }} className="flex flex-col justify-center">
              <StaggerReveal delay={0.25}>
                <RevealItem className="mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                    <CalendarDays className="w-4 h-4" aria-hidden="true" />
                    {ev.badge}
                  </span>
                </RevealItem>
                <RevealItem>
                  <p className="text-lg hero-text-muted max-w-[46ch] leading-relaxed mb-6">{ev.description}</p>
                </RevealItem>
                <RevealItem className="flex flex-wrap gap-2 mb-8">
                  {[ev.pills.nexus, ev.pills.campus, ev.pills.sections].map((label) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#8B5CF6' }}>
                      <span className="w-1 h-1 rounded-full bg-[#8B5CF6] shrink-0" />{label}
                    </span>
                  ))}
                </RevealItem>
              </StaggerReveal>
            </motion.div>
          </div>

          {/* Mobile: centred layout */}
          <motion.div style={{ y: heroTextY }} className="lg:hidden">
            <StaggerReveal className="text-center" delay={0.1}>
              <RevealItem className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  {ev.badge}
                </span>
              </RevealItem>
              <RevealItem>
                <h1 className="text-4xl sm:text-5xl hero-text hero-heading">
                  {ev.heading}{' '}<span className="text-accent-purple">{ev.headingAccent}</span>
                </h1>
              </RevealItem>
              <RevealItem>
                <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">{ev.description}</p>
              </RevealItem>
              <RevealItem className="flex flex-wrap justify-center gap-2 mt-4">
                {[ev.pills.nexus, ev.pills.campus, ev.pills.sections].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#8B5CF6' }}>
                    <span className="w-1 h-1 rounded-full bg-[#8B5CF6] shrink-0" />{label}
                  </span>
                ))}
              </RevealItem>
            </StaggerReveal>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30" style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }} aria-hidden="true" />
      </section>

      <section id="events-list" className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-label="Events">
        <div className="max-w-6xl mx-auto">

          {/* Dual Calendar Toggle */}
          <div className="flex justify-center mb-10 overflow-x-auto">
            <div
              className="inline-flex items-center p-1.5 rounded-2xl shrink-0"
              style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-border-subtle)' }}
            >
              <button
                onClick={() => setCalendarView('nexus')}
                aria-pressed={calendarView === 'nexus'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[44px]"
                style={calendarView === 'nexus'
                  ? { background: 'rgba(139,92,246,0.20)', color: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }
                  : { color: 'var(--hero-text-muted)' }}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                TKL Nexus Events
              </button>
              <button
                onClick={() => setCalendarView('ludd')}
                aria-pressed={calendarView === 'ludd'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[44px]"
                style={calendarView === 'ludd'
                  ? { background: 'rgba(139,92,246,0.20)', color: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }
                  : { color: 'var(--hero-text-muted)' }}
              >
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                Campus Events
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* VIEW 1: TKL NEXUS EVENTS */}
            {calendarView === 'nexus' && (
              <motion.div key="nexus-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {/* Sök + Filtrering */}
                <div className="space-y-4 mb-10">
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
                      placeholder={ev.searchPlaceholder}
                      className="w-full rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all duration-150"
                      style={{
                        background: 'var(--glass-bg-subtle)',
                        border: '1px solid var(--glass-border-subtle)',
                        color: 'var(--hero-text)',
                      }}
                      aria-label={ev.searchPlaceholder}
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
                  <div
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                    role="group"
                    aria-label={ev.filterAriaLabel}
                  >
                    {FILTERS.map((f) => (
                      <FilterTab key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)} logo={f.logo} label={f.label} color={f.color} />
                    ))}
                  </div>
                </div>
                {loading && (
                  <div className="flex justify-center py-24" aria-live="polite" aria-busy="true" aria-label={ev.loading}>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B5CF6' }} aria-hidden="true" />
                  </div>
                )}
                {error && !loading && (
                  <div className="flex justify-center py-16" role="alert">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                      <p className="text-red-400 font-medium">{error}</p>
                      <button
                        onClick={() => setFetchKey((k) => k + 1)}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
                      >
                        {ev.retry}
                      </button>
                    </div>
                  </div>
                )}
                {!loading && !error && filtered.length === 0 && <motion.p role="status" className="text-center hero-text-muted py-16">{filter === 'all' ? ev.noEvents : ev.noEventsFiltered}</motion.p>}
                {!loading && !error && filtered.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={filter}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.08 }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                    >
                      {filtered.map((event, idx) => <EventCard key={event.id} event={event} entryDelay={idx * 0.03} />)}
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* VIEW 2: LUDD CAMPUS EVENTS */}
            {calendarView === 'ludd' && (
              <motion.div
                key="ludd-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header: powered-by */}
                <div className="flex items-center mb-8">
                  <a
                    href="https://www.ludd.ltu.se/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hero-text-subtle hover:text-[#60A5FA] transition-colors flex items-center gap-1.5"
                  >
                    Powered by <span className="font-bold text-white tracking-wide">/LUDD/</span>
                  </a>
                </div>

                {luddLoading && (
                  <div className="flex justify-center py-24" aria-live="polite" aria-busy="true" aria-label={ev.loading}>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#60A5FA' }} aria-hidden="true" />
                  </div>
                )}

                {!luddLoading && luddError && (
                  <div className="flex justify-center py-16" role="alert">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                      <p className="text-red-400 font-medium">{ev.luddFetchError}</p>
                      <button
                        onClick={() => { setLuddError(false); setLuddEvents([]); }}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
                      >
                        {ev.retry}
                      </button>
                    </div>
                  </div>
                )}
                {!luddLoading && !luddError && luddEvents.length === 0 && (
                  <p role="status" className="text-center hero-text-muted py-16">
                    {ev.luddFetchError}
                  </p>
                )}

                {!luddLoading && luddEvents.length > 0 && (
                  <>
                    <LuddCalendar
                      events={luddEvents}
                      selectedDate={calendarSelectedDate}
                      onDaySelect={setCalendarSelectedDate}
                    />

                    {calendarSelectedDate !== null && filteredLuddEvents.length === 0 && (
                      <p role="status" className="text-center hero-text-muted py-10">
                        {ev.calendarNoEvents}
                      </p>
                    )}

                    {calendarSelectedDate !== null && filteredLuddEvents.length > 0 && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={calendarSelectedDate.toDateString()}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.08 }}
                          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6"
                        >
                          {filteredLuddEvents.map((event, idx) => (
                            <EventCard key={`ludd-${event.id}`} event={event} entryDelay={idx * 0.03} />
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
