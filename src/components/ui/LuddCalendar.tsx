'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { dayKey as toDayKey, startOfWeek } from '@/lib/weekRange';
import { LuddWeekView, type WeekCalendarEvent } from './LuddWeekView';

type CalendarEvent = WeekCalendarEvent;

export type LuddCalendarView = 'week' | 'month';

interface LuddCalendarProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDaySelect: (date: Date | null) => void;
  /** Vecka (standard) eller månad — styrs av föräldern som döljer "valt datum"-listan i veckovy */
  view: LuddCalendarView;
  onViewChange: (view: LuddCalendarView) => void;
  /** Öppnar eventets drawer (veckovyns chips) */
  onEventOpen: (id: string, trigger: HTMLButtonElement) => void;
}

const LOCALE_TAGS = { sv: 'sv-SE', en: 'en-GB' } as const;
const VIEWS: readonly LuddCalendarView[] = ['week', 'month'];

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7; // Mån=0 … Sön=6
}

const hoverCls = 'hover:bg-[color-mix(in_srgb,var(--hero-text)_8%,transparent)]';
const focusCls = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)';

export function LuddCalendar({
  events,
  selectedDate,
  onDaySelect,
  view,
  onViewChange,
  onEventOpen,
}: LuddCalendarProps) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const localeTag = LOCALE_TAGS[locale];

  // Beräknas per render (inte useMemo) — en flik som står öppen över
  // midnatt ska inte fortsätta markera gårdagen som "idag".
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [currentMonth, setCurrentMonth] = useState<Date>(thisMonthStart);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

  const weekDays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTag, { weekday: 'short' });
    // 2024-01-01 är en måndag — ger Mån…Sön i rätt ordning oavsett locale
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i, 12))));
  }, [localeTag]);

  const dayLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(localeTag, { day: 'numeric', month: 'long', year: 'numeric' }),
    [localeTag],
  );

  const eventDayKeys = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(toDayKey(new Date(e.date))));
    return set;
  }, [events]);

  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startPad = mondayIndex(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }
  while (days.length % 7 !== 0) days.push(null);

  const isPrevDisabled =
    currentMonth.getFullYear() === thisMonthStart.getFullYear() &&
    currentMonth.getMonth() === thisMonthStart.getMonth();

  const monthLabel = currentMonth.toLocaleString(localeTag, { month: 'long', year: 'numeric' });

  return (
    <div
      className={`w-full mx-auto rounded-2xl overflow-hidden mb-8 ${view === 'week' ? 'max-w-5xl' : 'max-w-2xl'}`}
      style={{
        background: 'var(--about-card-bg)',
        border: '1px solid var(--about-card-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Vy-toggle (vecka är standard) */}
      <div className="flex px-3 sm:px-5 pt-3 pb-3" style={{ borderBottom: '1px solid var(--about-card-border)' }}>
        <div
          role="group"
          aria-label={ev.calendarViewLabel}
          className="inline-flex gap-1 p-1 rounded-xl"
          style={{ background: 'color-mix(in srgb, var(--hero-text) 5%, transparent)' }}
        >
          {VIEWS.map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={active}
                onClick={() => onViewChange(v)}
                className={`min-h-11 px-4 rounded-lg text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue) ${
                  active ? '' : hoverCls
                }`}
                style={{
                  // undefined (inte 'transparent') när inaktiv — inline-bakgrund skulle annars slå ut hover-klassen
                  background: active ? 'color-mix(in srgb, var(--text-blue) 16%, transparent)' : undefined,
                  // text-blue-strong: text-blue på blå tint gav 3,4:1 i mörkt tema
                  color: active ? 'var(--text-blue-strong)' : 'var(--hero-text-muted)',
                  border: active
                    ? '1px solid color-mix(in srgb, var(--text-blue) 40%, transparent)'
                    : '1px solid transparent',
                }}
              >
                {v === 'week' ? ev.calendarViewWeek : ev.calendarViewMonth}
              </button>
            );
          })}
        </div>
      </div>

      {view === 'week' ? (
        <LuddWeekView
          events={events}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onEventOpen={onEventOpen}
        />
      ) : (
        <>
          {/* Månadsnavigation */}
          <div
            className="flex items-center justify-between px-3 sm:px-5 py-2"
            style={{ borderBottom: '1px solid var(--about-card-border)' }}
          >
            {/* aria-disabled i stället för disabled — knappen man står på ska inte
                tappa fokus när man navigerar tillbaka till innevarande månad */}
            <button
              type="button"
              onClick={() => {
                if (isPrevDisabled) return;
                setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
              }}
              aria-disabled={isPrevDisabled}
              aria-label={ev.calendarPrevMonth}
              className={`min-h-11 min-w-11 flex items-center justify-center rounded-xl transition-all duration-200 ${focusCls} ${
                isPrevDisabled ? 'opacity-20 cursor-not-allowed' : hoverCls
              }`}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-blue)' }} aria-hidden="true" />
            </button>

            {/* aria-live: månadsbytet ska annonseras för skärmläsare */}
            <span aria-live="polite" className="text-sm font-semibold capitalize hero-text">{monthLabel}</span>

            <button
              type="button"
              onClick={() =>
                setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
              }
              aria-label={ev.calendarNextMonth}
              className={`min-h-11 min-w-11 flex items-center justify-center rounded-xl transition-all duration-200 ${focusCls} ${hoverCls}`}
            >
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-blue)' }} aria-hidden="true" />
            </button>
          </div>

          {/* Veckodagsrubriker */}
          <div className="grid grid-cols-7 px-2 sm:px-3 pt-3">
            {weekDays.map((d) => (
              <div
                key={d}
                className="text-center text-[0.6875rem] font-semibold uppercase tracking-widest pb-2 hero-text-subtle"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Dagceller */}
          <div className="grid grid-cols-7 gap-y-1 px-2 sm:px-3 pb-4">
            {days.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;

              const dayKey = toDayKey(day);
              const hasEvent = eventDayKeys.has(dayKey);
              const isToday = day.getTime() === today.getTime();
              const isSelected =
                selectedDate !== null &&
                day.toDateString() === selectedDate.toDateString();
              const isPast = day < today;

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => onDaySelect(isSelected ? null : day)}
                  disabled={isPast}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  // "3 november 2026" — innehåller den synliga dagssiffran som eget ord
                  // (WCAG 2.5.3 Label in Name; "2026-11-03" gav "03" ≠ "3") och läses naturligt
                  aria-label={`${dayLabelFmt.format(day)}${hasEvent ? `, ${ev.calendarDayHasEvents}` : ''}`}
                  // min-h-11: 44 px träffyta (py-3 gav 40 px på mobil); bredden är ≥44 från 360 px
                  className={`relative flex flex-col items-center justify-center min-h-11 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default disabled:pointer-events-none ${focusCls} ${hoverCls}`}
                  style={{
                    background: isSelected
                      ? 'color-mix(in srgb, var(--text-blue) 15%, transparent)'
                      : undefined,
                    border: isSelected
                      ? '1px solid color-mix(in srgb, var(--text-blue) 40%, transparent)'
                      : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-sm leading-none"
                    style={{
                      color: isSelected || isToday ? 'var(--text-blue)' : 'var(--hero-text)',
                      fontWeight: isToday || isSelected ? 700 : 400,
                    }}
                  >
                    {day.getDate()}
                  </span>

                  {hasEvent && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{
                        background: isSelected ? 'var(--text-blue)' : 'var(--hero-text-subtle)',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {isToday && (
                    <span
                      className="absolute inset-0.5 rounded-xl pointer-events-none"
                      style={{ border: '1px solid color-mix(in srgb, var(--text-blue) 45%, transparent)' }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
