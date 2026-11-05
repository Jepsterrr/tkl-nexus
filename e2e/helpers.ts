import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Vänta tills sidan är interaktivt redo.
 *
 * OBS: använd ALDRIG waitForLoadState('networkidle') i denna kodbas —
 * Firestore SDK håller long-polling-anslutningar öppna så nätverket
 * blir aldrig idle. Vänta på konkret UI istället.
 */
export async function waitForAppReady(page: Page, settleMs = 2000): Promise<void> {
  // Flera sidor har separata desktop/mobil-heros — matcha den synliga h1:an
  await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 15_000 });
  // Låt Firestore-data + entré-animationer landa
  await page.waitForTimeout(settleMs);
}

/**
 * Testernas gemensamma "nu" — styr både fixturedatum (Node) och appens klocka
 * (webbläsaren, via `installTestClock`) så datumberoende tester blir deterministiska.
 *
 * `TEST_NOW=2026-10-29` (eller full ISO-tid) simulerar ett datum; utan variabel
 * används dagens datum. Tiden normaliseras alltid till 12:00 lokal tid så att en
 * körning nära midnatt aldrig hinner byta dygn mitt i ett test.
 */
export const TEST_NOW: Date = (() => {
  const raw = process.env.TEST_NOW;
  const d = raw ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw) : new Date();
  if (Number.isNaN(d.getTime())) throw new Error(`Ogiltigt TEST_NOW: ${raw}`);
  d.setHours(12, 0, 0, 0);
  return d;
})();

/** TEST_NOW förskjutet ett antal dygn, kl. 12:00 lokal tid (DST-säkert via setDate). */
export function daysFromNow(days: number): Date {
  const d = new Date(TEST_NOW);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

/**
 * Sätter webbläsarens Date till TEST_NOW (tiden flyter vidare därifrån). Måste
 * anropas före `page.goto` — klockan överlever omladdning och navigering.
 */
export async function installTestClock(page: Page): Promise<void> {
  await page.clock.setSystemTime(TEST_NOW);
}

/**
 * Filtrenas container på /career:sidopanelen (`complementary`) på desktop,
 * bottom-sheeten (`dialog`) på mobil — där sheeten först öppnas via "Filter"-knappen.
 * Locatorn är vald så att den bara matchar den synliga ytan (aldrig dubbletter
 * av reset-knappen etc. från tomt-state eller den dolda panelen).
 */
/**
 * På mobil visas Filter-knappen bara när det finns annonser ELLER aktiva filter
 * ("Visar 0 av 0" + filter till tomma val är brus). Live-`career` kan vara tom,
 * så mobiltester som behöver sheeten seedar ett neutralt filter (org=company)
 * som inte påverkar det testet asserterar. Desktop (sidopanel) får URL:en orörd.
 */
export function careerUrl(path: string, isMobile: boolean, seed = 'org=company'): string {
  if (!isMobile) return path;
  return path + (path.includes('?') ? '&' : '?') + seed;
}

export async function openCareerFilters(page: Page, isMobile: boolean): Promise<Locator> {
  if (!isMobile) return page.getByRole('complementary', { name: /^Filters?$/ });
  await page.getByRole('button', { name: /^Filters?(\s\(\d+\))?$/ }).click();
  // Namngiven (aria-labelledby mot sheetens titel) så att CookieConsent-dialogen inte krockar
  const dialog = page.getByRole('dialog', { name: /^Filters?$/ });
  await expect(dialog).toBeVisible();
  return dialog;
}
