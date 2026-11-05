import { test, expect, type Page } from '@playwright/test';
import { waitForAppReady, TEST_NOW, daysFromNow as atNoon, installTestClock } from './helpers';
import { isoWeek } from '../src/lib/weekRange';

/**
 * LUDD Campus Events — API:t mockas ALLTID via page.route så externa
 * driftstörningar aldrig ger röda tester. Fixture-datumen härleds ur TEST_NOW
 * och appens klocka sätts till samma tidpunkt, så utfallet är detsamma oavsett
 * körningsdatum (månads-/årsskifte, veckonummer). Simulera ett datum med
 * `TEST_NOW=2026-10-29 npx playwright test e2e/ludd.spec.ts`.
 */

test.beforeEach(async ({ page }) => {
  await installTestClock(page);
});

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const monthLabel = (d: Date) => d.toLocaleString('sv-SE', { month: 'long', year: 'numeric' });

const toSec = (d: Date) => Math.floor(d.getTime() / 1000);

/**
 * Verklig shape från events.ludd.ltu.se/api/events (nov 2026): place-objekt,
 * end_datetime, media, online_locations — och INGEN description. Beskrivningen
 * på "Mock Brädspelskväll" finns bara för att täcka grenen "har mer att visa".
 */
function luddItem(o: { id?: number; slug?: string; title: string; start: Date; hours?: number; place: string; tags?: string[]; description?: string }) {
  return {
    ...(o.id !== undefined ? { id: o.id } : {}),
    title: o.title,
    ...(o.slug !== undefined ? { slug: o.slug } : {}),
    start_datetime: toSec(o.start),
    end_datetime: toSec(o.start) + (o.hours ?? 2) * 3600,
    media: [],
    online_locations: '',
    tags: o.tags ?? [],
    place: { id: 1, name: o.place, address: 'Universitetsvägen 1', latitude: null, longitude: null },
    multidate: false,
    ...(o.description !== undefined ? { description: o.description } : {}),
  };
}

function luddFixture() {
  const today = atNoon(0);
  // Kan hamna i nästa månad (sista ~5 dagarna) — testerna navigerar dit via pickMonthDay
  const inFiveDays = atNoon(5);
  // Den 15:e nästa månad krockar aldrig med inFiveDays (som högst den 5:e i nästa månad)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15, 12, 0, 0);
  // Första framtida dag utan event — aldrig passerad (spärrad) och aldrig en fixturedag
  let emptyDay = atNoon(1);
  for (let i = 2; [today, inFiveDays, nextMonth].some((d) => sameDay(d, emptyDay)); i++) emptyDay = atNoon(i);
  return {
    dates: { today, inFiveDays, nextMonth, emptyDay },
    events: [
      luddItem({ id: 1, slug: 'mock-lan', title: 'Mock LAN-kväll', start: today, place: 'A-huset', tags: ['lan'] }),
      luddItem({ id: 2, slug: 'mock-bradspel', title: 'Mock Brädspelskväll', start: inFiveDays, place: 'Ljusgården', description: 'Testevent B' }),
      luddItem({ id: 3, slug: 'mock-sittning', title: 'Mock Sittning', start: nextMonth, place: 'STUK', tags: ['fest'] }),
    ],
  };
}

/** Veckovy är standard — månadsvyns tester väljer Månad i vy-togglen först. */
async function switchToMonthView(page: Page) {
  await page
    .getByRole('group', { name: /Kalendervy|Calendar view/ })
    .getByRole('button', { name: /^Månad$|^Month$/ })
    .click();
}

/**
 * Månadsvyn öppnar på TEST_NOW:s månad. Navigerar från `shown` till `date`s
 * månad och väljer dagen — returnerar den månad som nu visas.
 */
async function pickMonthDay(page: Page, date: Date, shown: Date, hasEvent: boolean): Promise<Date> {
  const diff = monthIndex(date) - monthIndex(shown);
  const nav = page.getByRole('button', { name: diff > 0 ? /Nästa månad/ : /Föregående månad/ });
  for (let i = 0; i < Math.abs(diff); i++) await nav.click();
  await expect(page.getByText(monthLabel(date))).toBeVisible();
  // Dagknappens namn: "3 november 2026[, event denna dag]"
  const day = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  const name = `${day}${hasEvent ? ', event denna dag' : ''}`;
  await page.getByRole('button', { name, exact: true }).click();
  return date;
}

async function openCampusTab(page: Page, events: unknown[]) {
  await page.route('https://events.ludd.ltu.se/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(events) }),
  );
  await page.goto('/events');
  await waitForAppReady(page);
  await page.getByRole('button', { name: /Campus Events/ }).click();
}

test.describe('LUDD Campus Events (mockat API)', () => {
  test.beforeEach(async ({ page }) => {
    await openCampusTab(page, luddFixture().events);
  });

  test('fliken visar kalender med dagens event förvalt', async ({ page }) => {
    const campusTab = page.getByRole('button', { name: /Campus Events/ });
    await expect(campusTab).toHaveAttribute('aria-pressed', 'true');
    await switchToMonthView(page);

    // Kalendern visar innevarande månad på svenska
    await expect(page.getByText(monthLabel(TEST_NOW))).toBeVisible();

    // Dagens datum är förvalt → dagens mockade event listas
    await expect(page.getByText('Mock LAN-kväll')).toBeVisible();
  });

  test('datumval filtrerar events, tomt datum visar tomt-state', async ({ page }) => {
    const { dates } = luddFixture();
    await switchToMonthView(page);

    // Välj dagen med event om 5 dagar (ev. i nästa månad) — eventdagar annonserar
    // ", event denna dag" i accessible name (skärmläsarstöd), tomma dagar enbart datumet.
    const shown = await pickMonthDay(page, dates.inFiveDays, TEST_NOW, true);
    await expect(page.getByText('Mock Brädspelskväll')).toBeVisible();
    await expect(page.getByText('Mock LAN-kväll')).toHaveCount(0);

    // Välj en dag utan event (kan ligga i en annan månad än den som visas)
    await pickMonthDay(page, dates.emptyDay, shown, false);
    await expect(page.getByText(/Inga events detta datum|No events on this date/)).toBeVisible();
  });

  test('månadsnavigering: prev disabled på innevarande månad, next fungerar', async ({ page }) => {
    await switchToMonthView(page);
    const prev = page.getByRole('button', { name: /Föregående månad/ });
    const next = page.getByRole('button', { name: /Nästa månad/ });

    await expect(prev).toBeDisabled();

    await next.click();
    await expect(page.getByText(monthLabel(new Date(TEST_NOW.getFullYear(), TEST_NOW.getMonth() + 1, 1)))).toBeVisible();
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

test.describe('Eventkortens CTA (mockat LUDD-API)', () => {
  const article = (page: Page, title: string) => page.getByRole('article').filter({ hasText: title });

  test('LUDD-event utan beskrivning: direktlänk "Läs på LUDD", ingen "Visa mer"', async ({ page }) => {
    await openCampusTab(page, luddFixture().events);
    await switchToMonthView(page);

    const card = article(page, 'Mock LAN-kväll');
    await expect(card).toBeVisible();
    await expect(card.getByText('A-huset')).toBeVisible();
    // Källetikett "LUDD" — inte sektionsfallbacken "Allmänt"
    await expect(card.getByText('LUDD', { exact: true })).toBeVisible();
    await expect(card.getByText(/^(Allmänt|General)$/)).toHaveCount(0);
    await expect(card.getByRole('button', { name: /Visa mer|View details/ })).toHaveCount(0);

    const link = card.getByRole('link', { name: /^Läs på LUDD: Mock LAN-kväll/ });
    await expect(link).toHaveAttribute('href', 'https://events.ludd.ltu.se/event/mock-lan');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);

    // Touchyta ≥44px (::before förlänger träffytan) — punkten 20px ovanför pillrets mitt träffar länken
    await link.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const box = (await link.boundingBox())!;
    const hit = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest('a')?.getAttribute('href') ?? null;
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 - 20 });
    expect(hit).toBe('https://events.ludd.ltu.se/event/mock-lan');

    // Klick öppnar ny flik — aldrig drawern (popupens LUDD-sida mockas också)
    await page.context().route('https://events.ludd.ltu.se/event/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>LUDD</title>' }),
    );
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ]);
    await popup.close();
    await expect(page.getByRole('dialog', { name: /Eventdetaljer|Event details/ })).toHaveCount(0);
  });

  test('event med beskrivning behåller "Visa mer" som öppnar drawern', async ({ page }) => {
    const { dates, events } = luddFixture();
    await openCampusTab(page, events);
    await switchToMonthView(page);
    await pickMonthDay(page, dates.inFiveDays, TEST_NOW, true);

    const card = article(page, 'Mock Brädspelskväll');
    await expect(card.getByRole('link', { name: /Läs på LUDD|Read on LUDD/ })).toHaveCount(0);
    await card.getByRole('button', { name: /^(Visa mer|View details): Mock Brädspelskväll$/ }).click();
    const drawer = page.getByRole('dialog', { name: /Eventdetaljer|Event details/ });
    await expect(drawer.getByText('Testevent B')).toBeVisible();
  });

  test('event utan beskrivning och utan länk visar ingen CTA alls', async ({ page }) => {
    // Utan id/slug/url finns ingen LUDD-sida att länka till — samma gren som ett
    // Nexus-event utan beskrivning (Firestore kan inte mockas här).
    const today = atNoon(0);
    await openCampusTab(page, [luddItem({ title: 'Mock Utan Länk', start: today, place: 'B-huset' })]);
    await switchToMonthView(page);

    const card = article(page, 'Mock Utan Länk');
    await expect(card).toBeVisible();
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card.getByRole('link')).toHaveCount(0);
  });
});

test.describe('LUDD veckovy (mockat API)', () => {
  test('veckovy är standard, bläddrar vecka, Idag och spärrad bakåt', async ({ page }) => {
    await openCampusTab(page, luddFixture().events);

    const view = page.getByRole('group', { name: /Kalendervy|Calendar view/ });
    await expect(view.getByRole('button', { name: /^Vecka$|^Week$/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(view.getByRole('button', { name: /^Månad$|^Month$/ })).toHaveAttribute('aria-pressed', 'false');

    const thisWeek = isoWeek(TEST_NOW);
    const nextWeek = isoWeek(atNoon(7));
    await expect(page.getByText(new RegExp(`^Vecka ${thisWeek}$`))).toBeVisible();

    const prev = page.getByRole('button', { name: /Föregående vecka|Previous week/ });
    const today = page.getByRole('button', { name: /^Idag$|^Today$/ });
    await expect(prev).toBeDisabled();
    await expect(today).toBeDisabled();

    await page.getByRole('button', { name: /Nästa vecka|Next week/ }).click();
    await expect(page.getByText(new RegExp(`^Vecka ${nextWeek}$`))).toBeVisible();
    await expect(prev).toBeEnabled();
    await expect(today).toBeEnabled();

    // "Idag" tar tillbaka till innevarande vecka och spärras igen
    await today.click();
    await expect(page.getByText(new RegExp(`^Vecka ${thisWeek}$`))).toBeVisible();
    await expect(today).toBeDisabled();
    await expect(prev).toBeDisabled();

    // Spärrad bakåt-knapp är no-op även vid klick (aria-disabled, inte disabled)
    await prev.click({ force: true });
    await expect(page.getByText(new RegExp(`^Vecka ${thisWeek}$`))).toBeVisible();
  });

  test('chip utan beskrivning är en direktlänk till LUDD (ny flik) — ingen drawer', async ({ page }) => {
    await openCampusTab(page, luddFixture().events);

    // Tillgängligt namn = synlig text först ("tid titel [plats]") + "– läs på LUDD (öppnas i ny flik)"
    const chip = page.getByRole('link', { name: /^12:00 Mock LAN-kväll\b.*– läs på LUDD \(öppnas i ny flik\)$/ });
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('href', 'https://events.ludd.ltu.se/event/mock-lan');
    await expect(chip).toHaveAttribute('target', '_blank');
    await expect(chip).toHaveAttribute('rel', /noopener/);
    await expect(page.getByRole('button', { name: /^12:00 Mock LAN-kväll/ })).toHaveCount(0);

    // "Valt datum"-listan hör till månadsvyn — i veckovy finns bara chipet
    await expect(page.getByText('Mock LAN-kväll').filter({ visible: true })).toHaveCount(1);

    await page.context().route('https://events.ludd.ltu.se/event/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>LUDD</title>' }),
    );
    const [popup] = await Promise.all([page.waitForEvent('popup'), chip.click()]);
    await popup.close();
    await expect(page.getByRole('dialog', { name: /Eventdetaljer|Event details/ })).toHaveCount(0);
    await expect(page).not.toHaveURL(/\?id=/);
  });

  test('chip utan beskrivning och utan länk är inte klickbart', async ({ page }) => {
    await openCampusTab(page, [luddItem({ title: 'Mock Utan Länk', start: atNoon(0), place: 'B-huset' })]);
    await expect(page.getByText('Mock Utan Länk').filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mock Utan Länk/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Mock Utan Länk/ })).toHaveCount(0);
  });

  test('chip med beskrivning öppnar EventDrawer med ?id= — omladdning och bakåt/framåt hittar LUDD-eventet', async ({ page }) => {
    const afternoon = atNoon(0);
    afternoon.setHours(15, 0, 0, 0);
    const events = [
      ...luddFixture().events,
      luddItem({ id: 4, slug: 'mock-forelasning', title: 'Mock Föreläsning', start: afternoon, place: 'A-huset', description: 'Om rymdteknik' }),
    ];
    await openCampusTab(page, events);

    const chip = page.getByRole('button', { name: /^15:00 Mock Föreläsning/ });
    await expect(chip).toBeVisible();
    await chip.click();

    const drawer = page.getByRole('dialog', { name: /Eventdetaljer|Event details/ });
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(/\?id=ludd-4/);
    await expect(drawer.getByText('Om rymdteknik')).toBeVisible();
    // Verklig API-shape: plats från place.name, sluttid från end_datetime
    await expect(drawer.getByText('A-huset')).toBeVisible();
    await expect(drawer.getByText(/15:00\s*–\s*17:00/)).toBeVisible();
    // Källetikett i drawern — inte "Allmänt"
    await expect(drawer.getByText('LUDD', { exact: true })).toBeVisible();
    const cta = drawer.getByRole('link', { name: /^Läs på LUDD|^Read on LUDD/ });
    await expect(cta).toHaveAttribute('href', 'https://events.ludd.ltu.se/event/mock-forelasning');

    // Omladdning: LUDD-id:t finns inte i Firestore — sidan växlar till Campus-vyn och
    // öppnar drawern när LUDD-listan hämtats
    await page.reload();
    await expect(drawer).toBeVisible({ timeout: 15_000 });
    await expect(drawer.getByText('Om rymdteknik')).toBeVisible();
    await expect(page.getByRole('button', { name: /Campus Events/ })).toHaveAttribute('aria-pressed', 'true');

    await page.goBack();
    await expect(drawer).toBeHidden();
    await page.goForward();
    await expect(page).toHaveURL(/\?id=ludd-4/);
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Om rymdteknik')).toBeVisible();
  });

  test('okänt LUDD-id i URL:en rensas när listan hämtats (ingen drawer)', async ({ page }) => {
    await page.route('https://events.ludd.ltu.se/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(luddFixture().events) }),
    );
    await page.goto('/events?id=ludd-999');
    await waitForAppReady(page);
    await expect(page.getByRole('button', { name: /Campus Events/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page).not.toHaveURL(/id=/);
    await expect(page.getByRole('dialog', { name: /Eventdetaljer|Event details/ })).toHaveCount(0);
  });

  test('dag med fler än tre event: "+n till" fäller ut (desktop), agendan visar alla (mobil)', async ({ page, isMobile }) => {
    const busyDay = [8, 10, 12, 14, 16].map((h, i) => {
      const start = atNoon(0);
      start.setHours(h, 0, 0, 0);
      return luddItem({ id: 100 + i, slug: `mock-pass-${i + 1}`, title: `Mock Pass ${i + 1}`, start, hours: 1, place: 'A-huset' });
    });
    await openCampusTab(page, busyDay);
    // Passen saknar beskrivning → chipsen är direktlänkar till LUDD (inte drawer-knappar)

    if (isMobile) {
      for (const e of busyDay) await expect(page.getByRole('link', { name: new RegExp(e.title) })).toBeVisible();
      return;
    }

    await expect(page.getByRole('link', { name: /Mock Pass 3/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mock Pass 4/ })).toHaveCount(0);

    const more = page.getByRole('button', { name: /^\+2 till$|^\+2 more$/ });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.click();

    await expect(page.getByRole('link', { name: /Mock Pass 5/ })).toBeVisible();
    const fewer = page.getByRole('button', { name: /^Visa färre$|^Show fewer$/ });
    await expect(fewer).toHaveAttribute('aria-expanded', 'true');
    await fewer.click();
    await expect(page.getByRole('link', { name: /Mock Pass 4/ })).toHaveCount(0);
  });
});
