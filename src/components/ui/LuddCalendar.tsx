'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface CalendarEvent {
  id: string;
  date: string; // ISO-sträng
}

interface LuddCalendarProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDaySelect: (date: Date | null) => void;
}

const LOCALE_TAGS = { sv: 'sv-SE', en: 'en-GB' } as const;

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7; // Mån=0 … Sön=6
}

const hoverCls = 'hover:bg-[color-mix(in_srgb,var(--hero-text)_8%,transparent)]';

export function LuddCalendar({ events, selectedDate, onDaySelect }: LuddCalendarProps) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const localeTag = LOCALE_TAGS[locale];

  // Beräknas per render (inte useMemo) — en flik som står öppen över
  // midnatt ska inte fortsätta markera gårdagen som "idag".
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [currentMonth, setCurrentMonth] = useState<Date>(thisMonthStart);

  const weekDays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTag, { weekday: 'short' });
    // 2024-01-01 är en måndag — ger Mån…Sön i rätt ordning oavsett locale
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i, 12))));
  }, [localeTag]);

  const eventDayKeys = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const d = new Date(e.date);
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
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
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden mb-8"
      style={{
        background: 'var(--about-card-bg)',
        border: '1px solid var(--about-card-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Månadsnavigation */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--about-card-border)' }}
      >
        <button
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
          disabled={isPrevDisabled}
          aria-label={ev.calendarPrevMonth}
          className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${hoverCls}`}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-blue)' }} />
        </button>

        <span className="text-sm font-semibold capitalize hero-text">{monthLabel}</span>

        <button
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
          aria-label={ev.calendarNextMonth}
          className={`p-2 rounded-xl transition-all duration-200 ${hoverCls}`}
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-blue)' }} />
        </button>
      </div>

      {/* Veckodagsrubriker */}
      <div className="grid grid-cols-7 px-3 pt-3">
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
      <div className="grid grid-cols-7 gap-y-1 px-3 pb-4">
        {days.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;

          const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const hasEvent = eventDayKeys.has(dayKey);
          const isToday = day.getTime() === today.getTime();
          const isSelected =
            selectedDate !== null &&
            day.toDateString() === selectedDate.toDateString();
          const isPast = day < today;

          return (
            <button
              key={dayKey}
              onClick={() => onDaySelect(isSelected ? null : day)}
              disabled={isPast}
              aria-pressed={isSelected}
              aria-label={day.toLocaleDateString(localeTag)}
              className={`relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default disabled:pointer-events-none ${hoverCls}`}
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
    </div>
  );
}
