'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string; // ISO-sträng
}

interface LuddCalendarProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDaySelect: (date: Date | null) => void;
}

const WEEK_DAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7; // Mån=0 … Sön=6
}

export function LuddCalendar({ events, selectedDate, onDaySelect }: LuddCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const thisMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );

  const [currentMonth, setCurrentMonth] = useState<Date>(thisMonthStart);

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

  const monthLabel = currentMonth.toLocaleString('sv-SE', { month: 'long', year: 'numeric' });

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
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
          disabled={isPrevDisabled}
          aria-label="Föregående månad"
          className="p-2 rounded-xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/8"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: '#60A5FA' }} />
        </button>

        <span className="text-sm font-semibold capitalize hero-text">{monthLabel}</span>

        <button
          onClick={() =>
            setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
          aria-label="Nästa månad"
          className="p-2 rounded-xl transition-all duration-200 hover:bg-white/8"
        >
          <ChevronRight className="w-4 h-4" style={{ color: '#60A5FA' }} />
        </button>
      </div>

      {/* Veckodagsrubriker */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold uppercase tracking-widest pb-2 hero-text-subtle"
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
              aria-label={day.toLocaleDateString('sv-SE')}
              className="relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 hover:bg-white/8 disabled:opacity-30 disabled:cursor-default disabled:pointer-events-none"
              style={{
                background: isSelected ? 'rgba(96,165,250,0.15)' : undefined,
                border: isSelected
                  ? '1px solid rgba(96,165,250,0.4)'
                  : '1px solid transparent',
              }}
            >
              <span
                className="text-sm leading-none"
                style={{
                  color: isSelected
                    ? '#60A5FA'
                    : isToday
                    ? '#93C5FD'
                    : 'var(--hero-text)',
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {day.getDate()}
              </span>

              {hasEvent && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: isSelected ? '#60A5FA' : 'rgba(255,255,255,0.45)' }}
                />
              )}

              {isToday && (
                <span
                  className="absolute inset-0.5 rounded-xl pointer-events-none"
                  style={{ border: '1px solid rgba(96,165,250,0.45)' }}
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
