'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { addDays, dayKey, eventsOnDay, isoWeek, startOfWeek, weekDays } from '@/lib/weekRange';
import { EASE_OUT_EXPO } from '@/lib/motion';

export interface WeekCalendarEvent {
  id: string;
  date: string; // ISO
  title: string;
  location?: string;
  /** Extern sida (LUDD) — chipet blir en länk i ny flik i stället för att öppna drawern */
  href?: string;
  /** Inget att öppna (ingen beskrivning, ingen länk) — chipet renderas icke-klickbart */
  inert?: boolean;
}

type ChipProps = {
  e: WeekCalendarEvent;
  className: string;
  /** Interaktionsklasser (hover/fokus/press) — utelämnas för inerta chips */
  interactiveCls: string;
  style: React.CSSProperties;
  onOpen: (id: string, trigger: HTMLButtonElement) => void;
  /** Skärmläsartillägg efter den synliga texten för länkchips, t.ex. "– läs på LUDD (öppnas i ny flik)" */
  linkSuffix: string;
  children: React.ReactNode;
};

/** Button (drawer), länk (extern källa) eller statisk rad — samma utseende. */
function EventChip({ e, className, interactiveCls, style, onOpen, linkSuffix, children }: ChipProps) {
  if (e.href) {
    // Namnet kommer från innehållet: synlig text (tid, titel, ev. plats) först och
    // sedan ett dolt tillägg — aldrig aria-label, som måste innehålla exakt den
    // synliga texten i följd (WCAG 2.5.3 Label in Name; röststyrning "klicka 18:00 …").
    return (
      <a
        href={e.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} ${interactiveCls}`}
        style={style}
      >
        {children}{' '}
        <span className="sr-only">{linkSuffix}</span>
      </a>
    );
  }
  if (e.inert) {
    return <div className={className} style={style}>{children}</div>;
  }
  return (
    <button
      type="button"
      onClick={(evt) => onOpen(e.id, evt.currentTarget)}
      className={`${className} ${interactiveCls}`}
      style={style}
    >
      {children}
    </button>
  );
}

interface LuddWeekViewProps {
  events: WeekCalendarEvent[];
  /** Måndag 00:00 (lokal tid) för visad vecka */
  weekStart: Date;
  onWeekChange: (monday: Date) => void;
  /** Öppnar eventets drawer; triggern får tillbaka fokus när drawern stängs */
  onEventOpen: (id: string, trigger: HTMLButtonElement) => void;
}

const LOCALE_TAGS = { sv: 'sv-SE', en: 'en-GB' } as const;
const MAX_CHIPS = 3;
const hoverCls = 'hover:bg-[color-mix(in_srgb,var(--hero-text)_8%,transparent)]';
const focusCls = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)';
// Blå TEXT (ofta på blå tint) — --text-blue når bara 3,4–4,25:1 i mörkt tema.
// --text-blue används fortfarande för ytor, kanter och ikoner.
const BLUE_TEXT = 'var(--text-blue-strong)';

export function LuddWeekView({ events, weekStart, onWeekChange, onEventOpen }: LuddWeekViewProps) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const tag = LOCALE_TAGS[locale];
  const shouldReduceMotion = useReducedMotion();

  // Dagar vars "+n till" fällts ut (desktop) — nyckel per datum, så andra
  // veckor påverkas inte
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  // Per render, inte useMemo — en flik som står öppen över midnatt ska inte
  // fortsätta markera gårdagen som "idag"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMonday = startOfWeek(today);
  const isCurrentWeek = weekStart.getTime() === todayMonday.getTime();
  // Bakåt spärras på (och före) innevarande vecka — som månadsvyns isPrevDisabled
  const isPrevDisabled = weekStart.getTime() <= todayMonday.getTime();

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const eventsByDay = useMemo(() => days.map((d) => eventsOnDay(events, d)), [days, events]);
  const weekHasEvents = eventsByDay.some((list) => list.length > 0);

  const rangeFmt = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' });
  const weekdayFmt = new Intl.DateTimeFormat(tag, { weekday: 'short' });
  const timeFmt = new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' });
  const weekLabel = ev.calendarWeekLabel.replace('{week}', String(isoWeek(weekStart)));
  const rangeLabel = `${rangeFmt.format(days[0])} – ${rangeFmt.format(days[6])}`;

  const toggleExpanded = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Subtil in-tonad vid veckobyte — enbart opacity/transform
  const weekMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: EASE_OUT_EXPO },
      };

  return (
    <div>
      {/* Veckonavigation */}
      <div
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-5 py-3"
        style={{ borderBottom: '1px solid var(--about-card-border)' }}
      >
        <div className="flex items-center gap-1">
          {/* aria-disabled i stället för disabled — knappen man står på ska inte
              tappa fokus när man navigerar tillbaka till innevarande vecka */}
          <button
            type="button"
            onClick={() => {
              if (isPrevDisabled) return;
              onWeekChange(addDays(weekStart, -7));
            }}
            aria-disabled={isPrevDisabled}
            aria-label={ev.calendarPrevWeek}
            className={`min-h-11 min-w-11 flex items-center justify-center rounded-xl transition-colors duration-200 ${focusCls} ${
              isPrevDisabled ? 'opacity-20 cursor-not-allowed' : hoverCls
            }`}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-blue)' }} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(addDays(weekStart, 7))}
            aria-label={ev.calendarNextWeek}
            className={`min-h-11 min-w-11 flex items-center justify-center rounded-xl transition-colors duration-200 ${focusCls} ${hoverCls}`}
          >
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-blue)' }} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (isCurrentWeek) return;
              onWeekChange(todayMonday);
            }}
            aria-disabled={isCurrentWeek}
            className={`ml-1 min-h-11 px-4 rounded-xl text-xs font-semibold transition-colors duration-200 ${focusCls} ${
              isCurrentWeek ? 'opacity-40 cursor-default' : hoverCls
            }`}
            style={{ color: BLUE_TEXT, border: '1px solid var(--about-card-border)' }}
          >
            {ev.calendarToday}
          </button>
        </div>

        {/* aria-live: veckobytet ska annonseras för skärmläsare */}
        <p aria-live="polite" className="text-sm font-semibold hero-text">
          <span>{weekLabel}</span>
          <span className="hero-text-subtle font-normal"> · {rangeLabel}</span>
        </p>
      </div>

      <motion.div key={weekStart.getTime()} {...weekMotion}>
        {/* Desktop (≥lg): sju kolumner med event-chips i dagsrutan. Under 1024 px
            blir kolumnerna för smala (~95 px) — där gäller agendan. */}
        <ol className="hidden lg:grid grid-cols-7 gap-2 p-3" aria-label={`${weekLabel}, ${rangeLabel}`}>
          {days.map((day, i) => {
            const dayEvents = eventsByDay[i];
            const key = dayKey(day);
            const isToday = day.getTime() === today.getTime();
            const isPast = day < today;
            const isExpanded = expanded.has(key);
            const visible = isExpanded ? dayEvents : dayEvents.slice(0, MAX_CHIPS);
            const hidden = dayEvents.length - MAX_CHIPS;
            const listId = `ludd-week-day-${key}`;

            return (
              <li
                key={key}
                aria-current={isToday ? 'date' : undefined}
                className="rounded-xl p-2 min-h-44 flex flex-col gap-1.5 min-w-0"
                style={{
                  background: isToday ? 'color-mix(in srgb, var(--text-blue) 10%, transparent)' : 'transparent',
                  border: isToday
                    ? '1px solid color-mix(in srgb, var(--text-blue) 55%, transparent)'
                    : '1px solid var(--about-card-border)',
                }}
              >
                <div className="flex items-baseline justify-between gap-1 px-0.5 pb-1">
                  <span
                    className="text-[0.6875rem] font-semibold uppercase tracking-widest"
                    style={{ color: isToday ? BLUE_TEXT : 'var(--hero-text-subtle)' }}
                  >
                    {isToday ? ev.calendarToday : weekdayFmt.format(day)}
                  </span>
                  <span
                    className="text-base tabular-nums leading-none"
                    style={{
                      color: isToday ? BLUE_TEXT : isPast ? 'var(--hero-text-subtle)' : 'var(--hero-text)',
                      fontWeight: isToday ? 800 : 600,
                    }}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {dayEvents.length > 0 && (
                  <ul id={listId} className="flex flex-col gap-1.5">
                    {visible.map((e) => (
                      <li key={e.id}>
                        <EventChip
                          e={e}
                          onOpen={onEventOpen}
                          linkSuffix={ev.readOnLuddChipSuffix}
                          className="block w-full text-left rounded-lg px-2 py-1.5 text-xs leading-snug"
                          interactiveCls={`transition-[filter,transform] duration-150 hover:brightness-125 active:scale-[0.98] motion-reduce:active:scale-100 ${focusCls}`}
                          style={{
                            background: isPast
                              ? 'color-mix(in srgb, var(--hero-text) 6%, transparent)'
                              : 'color-mix(in srgb, var(--text-blue) 14%, transparent)',
                            border: isPast
                              ? '1px solid var(--about-card-border)'
                              : '1px solid color-mix(in srgb, var(--text-blue) 28%, transparent)',
                            color: 'var(--hero-text)',
                          }}
                        >
                          <span
                            className="flex items-center gap-1 font-semibold tabular-nums"
                            style={{ color: isPast ? 'var(--hero-text-subtle)' : BLUE_TEXT }}
                          >
                            {timeFmt.format(new Date(e.date))}
                            {e.href && <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />}
                          </span>{' '}
                          {/* ↑ mellanslag: tillgängligt namn blir "18:00 Titel", inte "18:00Titel".
                              hyphens-auto: smala kolumner + långa svenska sammansättningar */}
                          <span className="line-clamp-2 wrap-break-word hyphens-auto">{e.title}</span>
                        </EventChip>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Visas bara i ≥lg-rutnätet (pekare/stor skärm) — min-h-8 (32 px)
                    ligger över WCAG 2.5.8:s 24 px; mobilagendan visar alla event */}
                {hidden > 0 && (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={listId}
                    onClick={() => toggleExpanded(key)}
                    className={`mt-auto self-start min-h-8 rounded-lg px-2 text-[0.6875rem] font-semibold transition-colors duration-200 ${focusCls} ${hoverCls}`}
                    style={{ color: BLUE_TEXT }}
                  >
                    {isExpanded ? ev.calendarShowFewer : ev.calendarMoreEvents.replace('{count}', String(hidden))}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobil/surfplatta (<lg): vertikal agenda — bara dagar med event, plus idag.
            Tom vecka → enbart statusraden nedan (ingen dubbel tomtext). */}
        <ol
          className={`${weekHasEvents ? 'lg:hidden' : 'hidden'} p-3 space-y-2`}
          aria-label={`${weekLabel}, ${rangeLabel}`}
        >
          {days.map((day, i) => {
            const dayEvents = eventsByDay[i];
            const isToday = day.getTime() === today.getTime();
            const isPast = day < today;
            if (dayEvents.length === 0 && !isToday) return null;
            return (
              <li
                key={dayKey(day)}
                aria-current={isToday ? 'date' : undefined}
                className="rounded-xl p-3"
                style={{
                  background: isToday ? 'color-mix(in srgb, var(--text-blue) 10%, transparent)' : 'transparent',
                  border: isToday
                    ? '1px solid color-mix(in srgb, var(--text-blue) 55%, transparent)'
                    : '1px solid var(--about-card-border)',
                }}
              >
                <p className="flex items-baseline gap-2 mb-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: isToday ? BLUE_TEXT : 'var(--hero-text-subtle)' }}
                  >
                    {weekdayFmt.format(day)}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: isToday ? BLUE_TEXT : 'var(--hero-text)' }}
                  >
                    {rangeFmt.format(day)}
                  </span>
                  {isToday && (
                    <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-widest" style={{ color: BLUE_TEXT }}>
                      {ev.calendarToday}
                    </span>
                  )}
                </p>
                {dayEvents.length === 0 ? (
                  <p className="text-xs hero-text-subtle">{ev.calendarNoEvents}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {dayEvents.map((e) => (
                      <li key={e.id}>
                        <EventChip
                          e={e}
                          onOpen={onEventOpen}
                          linkSuffix={ev.readOnLuddChipSuffix}
                          className="w-full min-h-11 text-left rounded-lg px-3 py-2 text-sm flex items-start gap-3"
                          interactiveCls={`transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100 ${focusCls}`}
                          style={{
                            background: isPast
                              ? 'color-mix(in srgb, var(--hero-text) 6%, transparent)'
                              : 'color-mix(in srgb, var(--text-blue) 12%, transparent)',
                            border: isPast
                              ? '1px solid var(--about-card-border)'
                              : '1px solid color-mix(in srgb, var(--text-blue) 26%, transparent)',
                          }}
                        >
                          <span
                            className="font-semibold tabular-nums shrink-0"
                            style={{ color: isPast ? 'var(--hero-text-subtle)' : BLUE_TEXT }}
                          >
                            {timeFmt.format(new Date(e.date))}
                          </span>{' '}
                          <span className="min-w-0 flex flex-col">
                            <span className="hero-text font-medium wrap-break-word">{e.title}</span>{' '}
                            {e.location && (
                              <span className="text-xs hero-text-subtle truncate">{e.location}</span>
                            )}
                          </span>
                          {e.href && (
                            <ExternalLink className="w-3.5 h-3.5 ml-auto mt-1 shrink-0" style={{ color: BLUE_TEXT }} aria-hidden="true" />
                          )}
                        </EventChip>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </motion.div>

      {/* Tom vecka — utanför den keyade diven så noden inte monteras om vid
          varje veckobyte; veckoetikettens aria-live annonserar själva bytet */}
      {!weekHasEvents && (
        <p className="text-center text-sm hero-text-muted px-3 pb-4 lg:pt-1">{ev.calendarNoEventsWeek}</p>
      )}
    </div>
  );
}
