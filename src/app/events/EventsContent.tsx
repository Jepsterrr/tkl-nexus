'use client';

import { useState, useEffect, useRef, useCallback, useDeferredValue, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CalendarDays, MapPin, Tag, Search, Sparkles, X, PlusCircle, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { useImageLoad } from '@/lib/hooks/useImageLoad';
import { HeroPhotoLayer } from '@/components/ui/HeroPhotoLayer';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { FilterTab } from '@/components/ui/FilterTab';
import { EventDrawer } from '@/components/ui/EventDrawer';
import type { TKLEvent, Section } from '@/lib/schemas/event';
// Endast typ — raderas vid kompilering, så dynamic()-uppdelningen bevaras
import type { LuddCalendarView } from '@/components/ui/LuddCalendar';
// Service-lagret importeras dynamiskt i effekterna — statisk import drar in
// Firestore-SDK:t (~145 kB gzip) i sidans hydration-bundle och försämrar LCP.
import { useDrawerUrl } from '@/lib/hooks/useDrawerUrl';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { z } from 'zod';
import { capture } from '@/lib/analytics';
import { toJsonLd } from '@/lib/json-ld';

// Kalendern används bara i LUDD-vyn — ladda den först när fliken öppnas
const LuddCalendar = dynamic(
  () => import('@/components/ui/LuddCalendar').then((m) => m.LuddCalendar),
  { ssr: false },
);

// LUDD API är extern data — validera istället för att lita på formen.
// Verklig shape (/api/events, nov 2026): id, title, slug, start_datetime,
// end_datetime (unix-sek), place {name, address, …}, tags, media, online_locations,
// parentId, multidate. Listan har INGEN beskrivning och detaljsidan saknar CORS —
// beskrivningar finns bara på events.ludd.ltu.se. Allt utom start_datetime är
// tolerant (.catch) så att ett avvikande fält aldrig fäller hela posten.
const LuddPlaceSchema = z.object({
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});
const LuddItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional().catch(undefined),
  title: z.string().optional().catch(undefined),
  description: z.string().nullable().optional().catch(undefined),
  start_datetime: z.number(),
  end_datetime: z.number().nullable().optional().catch(undefined),
  place: LuddPlaceSchema.nullable().optional().catch(undefined),
  // Äldre/platta fält — bakåtkompatibla fallbacks
  place_name: z.string().nullable().optional().catch(undefined),
  place_address: z.string().nullable().optional().catch(undefined),
  tags: z.array(z.string()).optional().catch(undefined),
  // Renderas i href — annat schema än http(s) (t.ex. javascript:) förkastas
  // och fallback-URL:en till events.ludd.ltu.se används i stället.
  url: z.string().refine((v) => /^https?:\/\//i.test(v)).optional().catch(undefined),
  slug: z.string().optional().catch(undefined),
});

/** LUDD skickar unix-sekunder; tål även millisekunder. */
const luddToMs = (t: number) => (t > 9999999999 ? t : t * 1000);

/**
 * Har eventet något drawern visar utöver kortet? Kortet visar redan titel,
 * plats, datum och två taggar — drawerns egentliga mervärde är beskrivningen
 * ("Om eventet"). Utan den blir drawern en återvändsgränd.
 */
const hasDetails = (event: TKLEvent) =>
  Boolean(event.description?.trim() || event.descriptionEn?.trim());

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

/**
 * Temasäker textvariant av sektionsfärgen. Rå hex som textfärg är oläslig —
 * marinblå (#172191) och mörkröd (#5c0d0d) ger ~1,3:1 på mörk bakgrund och
 * gul (#f7cf3b) fallerar i ljust tema. Blandning mot --hero-text drar färgen
 * till läsbar luminans i bägge teman utan att tappa kulören.
 * Rå hex får enbart användas för bg/border/glow.
 */
const sectionText = (color: string) =>
  `color-mix(in srgb, ${color} 45%, var(--hero-text))`;

// Kortets footer-CTA (knapp eller extern länk). Pillret är visuellt ~26px högt;
// ::before förlänger träffytan till ≥44px utan att ändra kortets layout.
const ctaCls =
  'relative flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 ' +
  'hover:gap-2.5 px-2.5 py-1 rounded-lg hover:brightness-110 ' +
  'before:absolute before:-inset-x-1 before:-inset-y-2.5';

// NEXUS/Campus-växlaren — mobil: halva bredden var, centrerat innehåll. Ingen nowrap:
// vid 360 px får "TKL NEXUS Events" hellre radbryta än flöda över sin kolumn.
const TOGGLE_CLS =
  'flex items-center justify-center gap-2 min-w-0 min-h-11 px-3 sm:px-6 py-2 rounded-xl text-sm leading-tight text-center font-semibold sm:whitespace-nowrap ' +
  'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-purple)';

const RETRY_CLS =
  'min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-purple) focus-visible:ring-offset-2 focus-visible:ring-offset-(--cosmic-bg)';
const RETRY_STYLE = { background: 'linear-gradient(135deg, var(--cta-purple-from), var(--cta-blue))' } as const;

type FilterKey = Section | 'all';
/** source: 'ludd' = campus-event från LUDD-API:t (märks med källa, inte sektion) */
type ExtendedEvent = TKLEvent & { externalUrl?: string; source?: 'ludd' };

// Event Card
function EventCard({
  event,
  entryDelay = 0,
  onViewDetails,
}: {
  event: ExtendedEvent;
  entryDelay?: number;
  onViewDetails: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const shouldReduceMotion = useReducedMotion();
  const color = SECTION_COLORS[event.section];
  const logo = SECTION_LOGOS[event.section];

  const isEnglish = locale === 'en';
  const dateLocale = isEnglish ? 'en-GB' : 'sv-SE';

  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString(dateLocale, { month: 'short' });

  const displayTitle = isEnglish && event.titleEn ? event.titleEn : event.title;
  const displayDesc = isEnglish && event.descriptionEn ? event.descriptionEn : event.description;

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ duration: 0.22, delay: entryDelay, ease: EASE_OUT_EXPO }}
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-col"
    >

      {/* Hover glow - pointer-events-none ser till att glöden aldrig blockerar klick */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}18, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5 flex-1 relative z-10">
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <span className="text-xl leading-none" style={{ color: sectionText(color) }}>{day}</span>
          <span className="hero-text-subtle text-[0.625rem] uppercase tracking-widest">{month}</span>
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
                loading="lazy"
                decoding="async"
              />
            )}
            <span
              className="text-[0.6875rem] font-semibold uppercase tracking-widest"
              style={{ color: sectionText(color) }}
            >
              {/* LUDD-event saknar sektion — "Allmänt" var en missvisande fallback */}
              {event.source === 'ludd' ? ev.sourceLudd : ev.sections[event.section]}
            </span>
          </div>

          <h3 className="hero-text font-semibold text-base leading-snug mb-1 line-clamp-2 group-hover:text-foreground transition-colors">
            {displayTitle}
          </h3>

          {displayDesc?.trim() && (
            <p className="hero-text-muted text-sm leading-relaxed line-clamp-2 mb-3">
              {displayDesc}
            </p>
          )}

          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs hero-text-subtle ${displayDesc?.trim() ? '' : 'mt-2'}`}>
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

      {/* FOOTER — min-h håller samma höjd oavsett om en CTA renderas */}
      <div
        className="flex items-center justify-between gap-3 min-h-12.5 px-5 py-3 mt-1 relative z-20"
        style={{ borderTop: '1px solid var(--about-card-border)' }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle">
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          {dateObj.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'long' })}
        </span>

        {/* Mer att visa → drawer. Annars direkt till källan (LUDD) om den finns,
            annars ingen CTA alls — en drawer utan beskrivning är en återvändsgränd. */}
        {hasDetails(event) ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewDetails(e); }}
            aria-label={`${ev.visaMer}: ${displayTitle}`}
            className={ctaCls}
            style={{ color: sectionText(color), background: `${color}12`, border: `1px solid ${color}28` }}
          >
            {ev.visaMer}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        ) : event.externalUrl ? (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            // Replacer-funktion: extern titel med $&/$' tolkas annars som ersättningsmönster
            aria-label={ev.readOnLuddAria.replace('{title}', () => displayTitle)}
            className={ctaCls}
            style={{ color: sectionText(color), background: `${color}12`, border: `1px solid ${color}28` }}
          >
            {ev.readOnLudd}
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        ) : null}
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

  // Drawer state
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(null);
  const previousFocusRef = useRef<HTMLButtonElement | null>(null);
  const { pushId, clearId } = useDrawerUrl();

  const handleCloseDrawer = useCallback(() => {
    setSelectedEvent(null);
    clearId();
    previousFocusRef.current?.focus();
  }, [clearId]);

  const handleOpenEvent = useCallback(
    (event: ExtendedEvent, triggerEl?: HTMLButtonElement) => {
      if (triggerEl) previousFocusRef.current = triggerEl;
      setSelectedEvent(event);
      pushId(event.id);
      capture('event_details_viewed', {
        event_id: event.id,
        title: event.title,
        section: event.section,
        date: event.date,
      });
    },
    [pushId],
  );

  // State variables for LUDD Data
  const [calendarView, setCalendarView] = useState<'nexus' | 'ludd'>('nexus');
  const [luddEvents, setLuddEvents] = useState<ExtendedEvent[]>([]);
  // ?id=ludd-… som väntar på att LUDD-listan hämtas (direktlänk, omladdning, bakåt/framåt).
  // LUDD-event finns inte i Firestore — getEventById kan aldrig hitta dem.
  const [pendingLuddId, setPendingLuddId] = useState<string | null>(null);

  // Initial URL-check (direktnavigering till /events?id=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    if (id.startsWith('ludd-')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- engångssynk från URL efter hydration
      setPendingLuddId(id);
      setCalendarView('ludd');
      return;
    }
    void import('@/lib/services/events').then((m) => m.getEventById(id)).then((ev) => {
      if (ev) setSelectedEvent(ev as ExtendedEvent);
    });
  }, []); // kör bara vid mount

  // Browser back/forward
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) {
        setSelectedEvent(null);
        return;
      }
      const cached = allEvents.find((e) => e.id === id) ?? luddEvents.find((e) => e.id === id);
      if (cached) {
        setSelectedEvent(cached);
      } else if (id.startsWith('ludd-')) {
        setPendingLuddId(id);
        setCalendarView('ludd');
      } else {
        void import('@/lib/services/events').then((m) => m.getEventById(id)).then((ev) => {
          if (ev) setSelectedEvent(ev as ExtendedEvent);
        });
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [allEvents, luddEvents]);

  // Väntande LUDD-id löses när listan finns. Saknas eventet (passerat/borttaget)
  // rensas id:t ur URL:en i stället för att lämna en död länk kvar.
  useEffect(() => {
    if (!pendingLuddId || luddEvents.length === 0) return;
    const found = luddEvents.find((e) => e.id === pendingLuddId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synk mot asynkront hämtad LUDD-lista
    setPendingLuddId(null);
    if (found) setSelectedEvent(found);
    else clearId();
  }, [pendingLuddId, luddEvents, clearId]);
  const [luddLoading, setLuddLoading] = useState(false);
  const [luddCalendarView, setLuddCalendarView] = useState<LuddCalendarView>('week');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const [luddError, setLuddError] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const shouldReduceMotion = useReducedMotion();
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', shouldReduceMotion ? '0%' : '-10%']
  );

  const { heroImages } = useSettings();
  const bgUrl = heroImages?.eventsUrl || '/images/heroes/events.svg';
  const imgLoaded = useImageLoad(bgUrl);

  // Fetch TKL Events
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    import('@/lib/services/events')
      .then((m) => m.getPublishedEvents())
      .then((data) => {
        if (isMounted) { setAllEvents(data); setLoading(false); }
      })
      .catch((err) => {
        if (isMounted) {
          const isOffline = err?.code === 'unavailable' || !navigator.onLine;
          setError(isOffline ? ev.nexusFetchErrorOffline : ev.nexusFetchError);
          setLoading(false);
        }
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
        .then((res) => {
          if (!res.ok) throw new Error(`LUDD API svarade ${res.status}`);
          return res.json();
        })
        .then((data) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          const items: unknown[] = Array.isArray(data) ? data : data?.events ?? [];

          // Mappar LUDD-datan till vårt utökade ExtendedEvent-format.
          // Extern data valideras med Zod — poster som inte matchar hoppas över.
          const mapped: ExtendedEvent[] = items.flatMap((raw, rawIndex) => {
            const parsed = LuddItemSchema.safeParse(raw);
            if (!parsed.success) return [];
            const item = parsed.data;
            const timeMs = luddToMs(item.start_datetime);
            // end_datetime före start (eller saknas) → faller tillbaka på start
            const endMs = item.end_datetime ? Math.max(luddToMs(item.end_datetime), timeMs) : timeMs;
            // Publika LUDD-sidan nås via slug (id fungerar som reserv)
            // || (inte ??): tom slug ska falla tillbaka på id
            const luddRef = item.slug || item.id;
            return [{
              // Stabil key-fallback — Math.random() ger ny identitet per render
              // och bryter Reacts reconciliation (omount + tappade animationer)
              id: `ludd-${item.id ?? item.slug ?? `idx-${rawIndex}`}`,
              title: item.title || ev.luddFallbackTitle,
              description: item.description ? item.description.replace(/<[^>]*>?/gm, '').trim() : '',
              date: new Date(timeMs).toISOString(),
              endDate: new Date(endMs).toISOString(),
              location:
                item.place?.name || item.place?.address || item.place_name || item.place_address || ev.luddFallbackLocation,
              tags: item.tags ?? [],
              section: 'general' as const,
              source: 'ludd' as const,
              published: true,
              createdAt: new Date().toISOString(),
              externalUrl:
                item.url ??
                (luddRef !== undefined ? `https://events.ludd.ltu.se/event/${encodeURIComponent(String(luddRef))}` : undefined),
            }];
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
  // ev med i deps för i18n-fallbacks — guarden luddEvents.length === 0
  // förhindrar omhämtning vid språkbyte.
  }, [calendarView, luddEvents.length, ev]);

  // Veckovyns chips: drawer bara när det finns mer att visa (beskrivning). Annars
  // direktlänk till LUDD i ny flik, eller — utan länk — en icke-klickbar rad.
  const calendarEvents = useMemo(
    () => luddEvents.map((e) => (hasDetails(e) ? e : { ...e, href: e.externalUrl, inert: !e.externalUrl })),
    [luddEvents],
  );

  // Deferred sök — inputfältet uppdateras direkt, medan grid-filtreringen
  // (AnimatePresence + layout-animationer) får släpa efter utan att blockera skrivandet.
  const deferredSearch = useDeferredValue(search);

  const filtered = allEvents
    .filter((e) => filter === 'all' || e.section === filter)
    .filter((e) => {
      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();
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
    name: 'Kommande events – TKL NEXUS',
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
          name: 'TKL NEXUS',
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
          dangerouslySetInnerHTML={{ __html: toJsonLd(eventSchemaList) }}
        />
      )}
      <section ref={heroRef} className="relative min-h-[60svh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8" aria-labelledby="events-hero-heading">
        <HeroPhotoLayer url={bgUrl} isLoaded={imgLoaded} />

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
              {/* hero-reveal (CSS) per ord — LCP-elementet får inte vänta på
                  hydration; staggern återskapas med animation-delay */}
              <h1
                id="events-hero-heading"
                className="hero-text"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, fontSize: 'clamp(4rem, 7vw, 7rem)' }}
              >
                {ev.heading.split(' ').map((word, i) => (
                  <span key={i} className="block hero-reveal" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>{word}</span>
                ))}
                <span className="block hero-reveal" style={{ animationDelay: `${0.05 + ev.heading.split(' ').length * 0.1}s` }}>
                  <span className="text-accent-purple">{ev.headingAccent}</span>
                </span>
              </h1>
            </motion.div>

            <motion.div style={{ y: heroTextY }} className="flex flex-col justify-center">
              <StaggerReveal delay={0.25}>
                <RevealItem className="mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--text-purple)' }}>
                    <CalendarDays className="w-4 h-4" aria-hidden="true" />
                    {ev.badge}
                  </span>
                </RevealItem>
                <RevealItem>
                  <p className="text-lg hero-text-muted max-w-[46ch] leading-relaxed mb-6">{ev.description}</p>
                </RevealItem>
                <RevealItem className="flex flex-wrap gap-2 mb-8">
                  {[ev.pills.nexus, ev.pills.campus, ev.pills.sections].map((label) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: 'var(--text-purple)' }}>
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--text-purple)' }}>
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  {ev.badge}
                </span>
              </RevealItem>
              {/* hero-reveal (CSS) — LCP-elementet får inte vänta på hydration */}
              <div className="hero-reveal">
                <h1 className="text-4xl sm:text-5xl hero-text hero-heading">
                  {ev.heading}{' '}<span className="text-accent-purple">{ev.headingAccent}</span>
                </h1>
              </div>
              <RevealItem>
                <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">{ev.description}</p>
              </RevealItem>
              <RevealItem className="flex flex-wrap justify-center gap-2 mt-4">
                {[ev.pills.nexus, ev.pills.campus, ev.pills.sections].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: 'var(--text-purple)' }}>
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
          {/* Mobil: två lika breda kolumner över hela bredden (px-6 + ikon flödade
              tidigare över 358 px och klipptes); från sm: kompakt centrerad pill. */}
          <div className="flex justify-center mb-10">
            <div
              className="grid grid-cols-2 w-full sm:inline-flex sm:w-auto items-center gap-1 p-1.5 rounded-2xl"
              style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-border-subtle)' }}
            >
              <button
                type="button"
                onClick={() => setCalendarView('nexus')}
                aria-pressed={calendarView === 'nexus'}
                className={TOGGLE_CLS}
                style={calendarView === 'nexus'
                  ? { background: 'rgba(139,92,246,0.20)', color: 'var(--text-purple)', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }
                  : { color: 'var(--hero-text-muted)' }}
              >
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                {ev.nexusTab}
              </button>
              <button
                type="button"
                onClick={() => { setCalendarView('ludd'); capture('campus_calendar_viewed'); }}
                aria-pressed={calendarView === 'ludd'}
                className={TOGGLE_CLS}
                style={calendarView === 'ludd'
                  ? { background: 'rgba(139,92,246,0.20)', color: 'var(--text-purple)', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }
                  : { color: 'var(--hero-text-muted)' }}
              >
                <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
                {ev.campusTab}
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
                      className="w-full min-h-11 rounded-xl pl-10 pr-11 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-(--text-purple)"
                      style={{
                        background: 'var(--glass-bg-subtle)',
                        // --input-border (3:1, WCAG 1.4.11) — samma fältkant som övriga formulär
                        border: '1px solid var(--input-border)',
                        color: 'var(--hero-text)',
                      }}
                      aria-label={ev.searchPlaceholder}
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-purple)"
                        aria-label={ev.clearSearch}
                      >
                        <X className="w-3.5 h-3.5" style={{ color: 'var(--hero-text-subtle)' }} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                    role="group"
                    aria-label={ev.filterAriaLabel}
                  >
                    {FILTERS.map((f) => (
                      <FilterTab key={f.key} active={filter === f.key} onClick={() => {
                        setFilter(f.key);
                        if (f.key !== filter) {
                          capture('event_filter_applied', { filter: f.key });
                        }
                      }} logo={f.logo} label={f.label} color={f.color} />
                    ))}
                  </div>
                </div>
                {loading && (
                  <div
                    role="status"
                    aria-busy="true"
                    aria-label={ev.loading}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-shimmer rounded-2xl h-44" aria-hidden="true" />
                    ))}
                  </div>
                )}
                {error && !loading && (
                  <div className="flex justify-center py-16" role="alert">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                      <p className="text-red-400 light:text-red-700 font-medium">{error}</p>
                      <button
                        type="button"
                        onClick={() => setFetchKey((k) => k + 1)}
                        className={RETRY_CLS}
                        style={RETRY_STYLE}
                      >
                        {ev.retry}
                      </button>
                    </div>
                  </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <motion.div
                    role="status"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
                    style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                  >
                    <CalendarDays className="w-12 h-12 mb-4 opacity-35" style={{ color: '#8B5CF6' }} aria-hidden="true" />
                    <p className="text-lg hero-text-muted">
                      {filter === 'all' ? ev.noEvents : ev.noEventsFiltered}
                    </p>
                    {filter === 'all' && (
                      <Link
                        href="/corporate/post"
                        className="mt-6 inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--text-purple)' }}
                      >
                        <PlusCircle className="w-4 h-4" aria-hidden="true" />
                        {ev.emptyStateCta}
                      </Link>
                    )}
                  </motion.div>
                )}
                {!loading && !error && filtered.length > 0 && (
                  // AnimatePresence + layout (epic design-kravet): korten
                  // exit-animeras individuellt och gridet flödar om — även vid
                  // sökning, som tidigare bytte kort helt utan animation.
                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((event, idx) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          entryDelay={idx * 0.03}
                          onViewDetails={(e) => handleOpenEvent(event, e.currentTarget)}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
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
                <div className="flex items-center mb-6">
                  <a
                    href="https://www.ludd.ltu.se/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-11 text-xs font-medium hero-text-subtle hover:text-(--text-blue) transition-colors flex items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
                  >
                    {ev.luddPoweredBy} <span className="font-bold text-white light:text-black tracking-wide">/LUDD/</span>
                  </a>
                </div>

                {luddLoading && (
                  <div
                    role="status"
                    aria-busy="true"
                    aria-label={ev.loading}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-shimmer rounded-2xl h-44" aria-hidden="true" />
                    ))}
                  </div>
                )}

                {!luddLoading && luddError && (
                  <div className="flex justify-center py-16" role="alert">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                      <p className="text-red-400 light:text-red-700 font-medium">{ev.luddFetchError}</p>
                      <button
                        type="button"
                        onClick={() => { setLuddError(false); setLuddEvents([]); }}
                        className={RETRY_CLS}
                        style={RETRY_STYLE}
                      >
                        {ev.retry}
                      </button>
                    </div>
                  </div>
                )}
                {!luddLoading && !luddError && luddEvents.length === 0 && (
                  <div
                    role="status"
                    className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
                    style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                  >
                    <CalendarDays className="w-12 h-12 mb-4 opacity-35" style={{ color: 'var(--text-blue)' }} aria-hidden="true" />
                    <p className="text-lg hero-text-muted">{ev.luddNoEvents}</p>
                  </div>
                )}

                {!luddLoading && luddEvents.length > 0 && (
                  <>
                    <LuddCalendar
                      events={calendarEvents}
                      selectedDate={calendarSelectedDate}
                      onDaySelect={setCalendarSelectedDate}
                      view={luddCalendarView}
                      onViewChange={setLuddCalendarView}
                      onEventOpen={(id, trigger) => {
                        const event = luddEvents.find((e) => e.id === id);
                        if (event && hasDetails(event)) handleOpenEvent(event, trigger);
                      }}
                    />

                    {/* "Valt datum"-listan hör till månadsvyn — veckovyn visar eventen i dagsrutorna */}
                    {luddCalendarView === 'month' && calendarSelectedDate !== null && filteredLuddEvents.length === 0 && (
                      <p role="status" className="text-center hero-text-muted py-10">
                        {ev.calendarNoEvents}
                      </p>
                    )}

                    {luddCalendarView === 'month' && calendarSelectedDate !== null && filteredLuddEvents.length > 0 && (
                      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                        <AnimatePresence mode="popLayout">
                          {filteredLuddEvents.map((event, idx) => (
                            <EventCard
                              key={`ludd-${event.id}`}
                              event={event}
                              entryDelay={idx * 0.03}
                              onViewDetails={(e) => handleOpenEvent(event, e.currentTarget)}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <EventDrawer event={selectedEvent} onClose={handleCloseDrawer} />
    </>
  );
}
