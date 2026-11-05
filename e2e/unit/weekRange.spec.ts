import { test, expect } from '@playwright/test';
import { startOfWeek, addDays, weekDays, isoWeek, eventsOnDay, dayKey } from '../../src/lib/weekRange';

test.describe('weekRange', () => {
  test('startOfWeek ger måndag kl 00:00 (lokal tid)', () => {
    // 2026-10-29 är en torsdag → måndag 2026-10-26
    const s = startOfWeek(new Date(2026, 9, 29, 15, 30));
    expect([s.getFullYear(), s.getMonth(), s.getDate(), s.getHours()]).toEqual([2026, 9, 26, 0]);
    // söndag hör till veckan som började måndagen innan
    expect(startOfWeek(new Date(2026, 10, 1)).getDate()).toBe(26);
    // måndag är sin egen veckostart
    expect(startOfWeek(new Date(2026, 9, 26)).getDate()).toBe(26);
  });

  test('addDays klarar månadsskifte', () => {
    const d = addDays(new Date(2026, 9, 30), 3);
    expect([d.getMonth(), d.getDate()]).toEqual([10, 2]);
  });

  test('weekDays ger sju på varandra följande dagar från måndag', () => {
    const days = weekDays(new Date(2026, 9, 29));
    expect(days).toHaveLength(7);
    expect(days[0].getDate()).toBe(26);
    expect(days[6].getDate()).toBe(1);
    expect(days[6].getMonth()).toBe(10);
  });

  test('isoWeek följer ISO 8601', () => {
    expect(isoWeek(new Date(2026, 9, 29))).toBe(44);
    expect(isoWeek(new Date(2024, 11, 30))).toBe(1); // mån 2024-12-30 → 2025-W01
    expect(isoWeek(new Date(2021, 0, 3))).toBe(53); // sön 2021-01-03 → 2020-W53
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);
  });

  test('isoWeek mot oberoende, hårdkodade ISO-veckor', () => {
    // Kontrollvärden ur ISO 8601-kalendern — inte härledda via isoWeek
    const known: [number, number, number, number][] = [
      [2026, 10, 2, 45], // mån 2 nov 2026
      [2026, 11, 31, 53], // tors 31 dec 2026 → 2026 har 53 veckor (börjar på torsdag)
      [2027, 0, 3, 53], // sön 3 jan 2027 → 2026-W53
      [2027, 0, 4, 1], // mån 4 jan 2027 → 2027-W01
      [2025, 11, 29, 1], // mån 29 dec 2025 → 2026-W01
      [2020, 11, 31, 53], // tors 31 dec 2020 → 2020-W53
    ];
    for (const [y, m, d, w] of known) expect(isoWeek(new Date(y, m, d)), `${y}-${m + 1}-${d}`).toBe(w);
  });

  test('startOfWeek över årsskiftet', () => {
    // fre 2027-01-01 → måndag 2026-12-28
    const s = startOfWeek(new Date(2027, 0, 1, 10));
    expect([s.getFullYear(), s.getMonth(), s.getDate(), s.getHours()]).toEqual([2026, 11, 28, 0]);
  });

  test('addDays och weekDays över sommartidsbytet (2026-03-29 i Europe/Stockholm)', () => {
    // Lokala komponenter → tidszonsoberoende: dygnet med 23 h får inte ge
    // "28 mars 23:00" eller hoppa över en dag
    const d = addDays(new Date(2026, 2, 28), 1);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 2, 29, 0, 0]);
    const after = addDays(new Date(2026, 2, 29), 1);
    expect([after.getMonth(), after.getDate(), after.getHours()]).toEqual([2, 30, 0]);
    // Veckan mån 23 – sön 29 mars innehåller bytet
    const days = weekDays(new Date(2026, 2, 29, 12));
    expect(days.map((x) => x.getDate())).toEqual([23, 24, 25, 26, 27, 28, 29]);
    expect(days.every((x) => x.getHours() === 0)).toBe(true);
    // Veckan efter börjar mån 30 mars kl 00:00
    const next = addDays(days[0], 7);
    expect([next.getMonth(), next.getDate(), next.getHours()]).toEqual([2, 30, 0]);
  });

  test('dayKey är stabil per lokal kalenderdag (månad 0-indexerad)', () => {
    expect(dayKey(new Date(2026, 10, 2, 0, 0))).toBe('2026-10-2');
    expect(dayKey(new Date(2026, 10, 2, 23, 59))).toBe('2026-10-2');
    expect(dayKey(new Date(2026, 10, 3))).not.toBe(dayKey(new Date(2026, 10, 2)));
  });

  test('eventsOnDay matchar lokal kalenderdag och sorterar på tid', () => {
    const events = [
      { id: 'b', date: new Date(2026, 9, 29, 18, 0).toISOString() },
      { id: 'a', date: new Date(2026, 9, 29, 9, 0).toISOString() },
      { id: 'c', date: new Date(2026, 9, 30, 9, 0).toISOString() },
    ];
    expect(eventsOnDay(events, new Date(2026, 9, 29)).map((e) => e.id)).toEqual(['a', 'b']);
    expect(eventsOnDay(events, new Date(2026, 9, 31))).toEqual([]);
  });
});
