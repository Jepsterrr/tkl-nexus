/**
 * Ren veckologik för kalendern (måndag som veckostart, lokal tid).
 * Inga `@/`-importer — modulen körs även som enhetstest i Playwright.
 */

/** Måndag 00:00 (lokal tid) för veckan som innehåller `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** `date` (trunkerad till 00:00 lokal tid) plus `n` kalenderdagar — DST-säkert. */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

/** De sju dagarna (mån–sön) i veckan som innehåller `date`. */
export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** ISO 8601-veckonummer. */
export function isoWeek(date: Date): number {
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Stabil nyckel för en lokal kalenderdag, t.ex. "2026-10-29" för 29 nov (månad 0-indexerad). */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Event vars startdatum infaller på `day` (lokal tid), sorterade på starttid. */
export function eventsOnDay<T extends { date: string }>(events: T[], day: Date): T[] {
  return events
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
