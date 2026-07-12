import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * LUDD Campus Events — API:t mockas ALLTID via page.route så externa
 * driftstörningar aldrig ger röda tester. Fixture-datumen genereras
 * relativt dagens datum så testerna aldrig blir stale.
 */

function atNoon(daysFromToday: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(12, 0, 0, 0);
  return d;
}

function luddFixture() {
  const today = atNoon(0);
  const inFiveDays = atNoon(5);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 3, 12, 0, 0);
  const toSec = (d: Date) => Math.floor(d.getTime() / 1000);
  return {
    dates: { today, inFiveDays, nextMonth },
    events: [
      { id: 1, title: 'Mock LAN-kväll', description: 'Testevent A', start_datetime: toSec(today), place_name: 'A-huset', tags: ['lan'], slug: 'mock-lan' },
      { id: 2, title: 'Mock Brädspelskväll', description: 'Testevent B', start_datetime: toSec(inFiveDays), place_name: 'Ljusgården', tags: [], slug: 'mock-bradspel' },
      { id: 3, title: 'Mock Sittning', description: 'Testevent C', start_datetime: toSec(nextMonth), place_name: 'STUK', tags: ['fest'], slug: 'mock-sittning' },
    ],
  };
}

test.describe('LUDD Campus Events (mockat API)', () => {
  test.beforeEach(async ({ page }) => {
    const { events } = luddFixture();
    await page.route('https://events.ludd.ltu.se/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(events) }),
    );
    await page.goto('/events');
    await waitForAppReady(page);
    await page.getByRole('button', { name: /Campus Events/ }).click();
  });

  test('fliken visar kalender med dagens event förvalt', async ({ page }) => {
    const campusTab = page.getByRole('button', { name: /Campus Events/ });
    await expect(campusTab).toHaveAttribute('aria-pressed', 'true');

    // Kalendern visar innevarande månad på svenska
    const monthLabel = new Date().toLocaleString('sv-SE', { month: 'long', year: 'numeric' });
    await expect(page.getByText(monthLabel)).toBeVisible();

    // Dagens datum är förvalt → dagens mockade event listas
    await expect(page.getByText('Mock LAN-kväll')).toBeVisible();
  });

  test('datumval filtrerar events, tomt datum visar tomt-state', async ({ page }) => {
    const { dates } = luddFixture();

    // Välj dagen med event om 5 dagar — eventdagar annonserar ", event denna
    // dag" i accessible name (skärmläsarstöd), tomma dagar enbart datumet.
    await page.getByRole('button', { name: `${dates.inFiveDays.toLocaleDateString('sv-SE')}, event denna dag`, exact: true }).click();
    await expect(page.getByText('Mock Brädspelskväll')).toBeVisible();
    await expect(page.getByText('Mock LAN-kväll')).toHaveCount(0);

    // Välj en dag utan event (imorgon eller +2 om kollision med fixture)
    const emptyDay = atNoon(1).getDate() === dates.inFiveDays.getDate() ? atNoon(2) : atNoon(1);
    await page.getByRole('button', { name: emptyDay.toLocaleDateString('sv-SE'), exact: true }).click();
    await expect(page.getByText(/Inga events detta datum|No events on this date/)).toBeVisible();
  });

  test('månadsnavigering: prev disabled på innevarande månad, next fungerar', async ({ page }) => {
    const prev = page.getByRole('button', { name: /Föregående månad/ });
    const next = page.getByRole('button', { name: /Nästa månad/ });

    await expect(prev).toBeDisabled();

    await next.click();
    const d = new Date();
    const nextMonthLabel = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      .toLocaleString('sv-SE', { month: 'long', year: 'numeric' });
    await expect(page.getByText(nextMonthLabel)).toBeVisible();
    await expect(prev).toBeEnabled();

    await prev.click();
    await expect(prev).toBeDisabled();
  });

  test('API-fel visar felmeddelande med retry', async ({ page }) => {
    // Skriv över mocken med ett felsvar och gå om till fliken
    await page.unrouteAll();
    await page.route('https://events.ludd.ltu.se/**', (route) => route.abort('failed'));

    await page.goto('/events');
    await waitForAppReady(page);
    await page.getByRole('button', { name: /Campus Events/ }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/kunde inte|could not|misslyckades|failed/i).first()).toBeVisible();
  });
});
