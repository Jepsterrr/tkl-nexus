import { test, expect, type Page } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * /corporate/post — tab-växling (ARIA tabs), valideringsfeedback vid ogiltig
 * submit (fel visas + fokus till första felfält — knappen är aldrig disabled),
 * och success-state efter inskick (mailto-navigering no-op:ar i headless).
 * Annons-fliken är statisk (inga Firestore-beroenden); Event-fliken hämtar
 * eventTypes från Firestore när den öppnas.
 */

test.describe('Företagsportalen /corporate/post', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/corporate/post');
    await waitForAppReady(page);
  });

  test('tabbar växlar med korrekt ARIA-state och piltangenter', async ({ page }) => {
    const oppTab = page.getByRole('tab', { name: /^(Annons|Listing)$/ });
    const eventTab = page.getByRole('tab', { name: /^Event$/ });

    await expect(oppTab).toHaveAttribute('aria-selected', 'true');

    await eventTab.click();
    await expect(eventTab).toHaveAttribute('aria-selected', 'true');
    await expect(oppTab).toHaveAttribute('aria-selected', 'false');

    // Piltangent-navigering (ARIA tabs-mönstret): Event → ArrowRight → Annons (wrap)
    await page.keyboard.press('ArrowRight');
    await expect(oppTab).toHaveAttribute('aria-selected', 'true');
    await expect(oppTab).toBeFocused();
  });

  test('exjobb visar "Studentens uppgift", jobb döljer den', async ({ page }) => {
    const type = page.locator('#opp-type');
    await type.selectOption('jobb');
    await expect(page.getByLabel(/Studentens uppgift|student's task/i)).toHaveCount(0);
    await type.selectOption('exjobb');
    await expect(page.getByLabel(/Studentens uppgift \(sv\)|student's task \(sv\)/i)).toBeVisible();
    await expect(page.getByLabel(/Studentens uppgift \(EN\)|student's task \(EN\)/i)).toBeVisible();
    await type.selectOption('sommarjobb');
    await expect(page.getByLabel(/Studentens uppgift|student's task/i)).toHaveCount(0);
  });

  test('select-etiketten är inget klickmål men namnger selecten', async ({ page }) => {
    const select = page.locator('#opp-type');
    // aria-labelledby (ej htmlFor) — tillgängligt namn bevaras
    await expect(page.getByRole('combobox', { name: /^(Typ|Type)\s*\*?$/ })).toHaveAttribute('id', 'opp-type');
    const label = page.locator('#opp-type-label');
    expect(await label.evaluate((el) => getComputedStyle(el).cursor)).not.toBe('pointer');
    expect(await select.evaluate((el) => getComputedStyle(el).cursor)).toBe('pointer');
    await label.click();
    await expect(select).not.toBeFocused();
  });

  async function fillLongListing(page: Page, text: string) {
    await page.locator('#contactName').fill('Test Testsson');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#opp-title').fill('Exjobb inom testautomation');
    await page.locator('#opp-company').fill('Testbolaget AB');
    await page.locator('#opp-type').selectOption('exjobb');
    await page.locator('#opp-location').fill('Luleå');
    await page.locator('#opp-deadline').fill('2030-12-31');
    await page.locator('#opp-desc').fill(text);
    await page.locator('#opp-req').fill(text);
    await page.locator('#opp-task').fill(text);
    await page.getByRole('button', { name: /Skicka förfrågan via e-post|Send request via email/ }).click();
  }

  test('lång annons: hela texten kopieras till urklipp och en varning visas', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const long = 'x'.repeat(2000);
    await fillLongListing(page, long);

    await expect(page.locator('#long-body-note')).toContainText(/Hela texten är kopierad|full text is copied/);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('Exjobb inom testautomation');
    expect(clip).toContain(long);
    expect(clip).toContain('studentTask (sv)');
    // Hela, okapade bodyn i urklippet — ingen kapningsmarkör
    expect(clip).not.toContain('TEXTEN KAPAD');
  });

  test('lång annons: avslagen urklippsskrivning visar "kunde inte kopiera"-noten', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
        configurable: true,
      });
    });
    await page.reload();
    await waitForAppReady(page);
    await fillLongListing(page, 'x'.repeat(2000));

    await expect(page.locator('#long-body-note')).toContainText(/kunde inte kopiera|could not copy/);
    await expect(page.locator('#long-body-status')).not.toContainText(/Hela texten är kopierad|full text is copied/);
  });

  test('kort annons: ingen urklippsvarning', async ({ page }) => {
    await page.locator('#contactName').fill('Test Testsson');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#opp-title').fill('Kort annons');
    await page.locator('#opp-company').fill('Testbolaget AB');
    await page.locator('#opp-type').selectOption('jobb');
    await page.locator('#opp-location').fill('Luleå');
    await page.locator('#opp-deadline').fill('2030-12-31');
    await page.getByRole('button', { name: /Skicka förfrågan via e-post|Send request via email/ }).click();
    await expect(page.getByText(/Förfrågan öppnad i din e-postklient|Request opened in your email client/)).toBeVisible();
    await expect(page.locator('#long-body-note')).toHaveCount(0);
  });

  test('ogiltig submit visar fel + fokuserar första felfält, giltig ger success', async ({ page }) => {
    const submit = page.getByRole('button', { name: /Skicka förfrågan via e-post|Send request via email/ });

    // Tom submit: inga mailto — alla obligatoriska fält felmarkeras och
    // fokus flyttas till första felfältet (WCAG 3.3.1).
    await submit.click();
    await expect(page.locator('#contactName')).toBeFocused();
    await expect(page.locator('#contactName')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#error-opp-deadline')).toBeVisible();

    // Fyll i alla obligatoriska Opportunity-fält utom deadline
    await page.locator('#contactName').fill('Test Testsson');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#opp-title').fill('Exjobb inom testautomation');
    await page.locator('#opp-company').fill('Testbolaget AB');
    await page.locator('#opp-type').selectOption('exjobb');
    await page.locator('#opp-location').fill('Luleå');

    // Deadline saknas fortfarande — submit fokuserar deadline-fältet
    await submit.click();
    await expect(page.locator('#opp-deadline')).toBeFocused();
    await page.locator('#opp-deadline').fill('2030-12-31');

    // Klick bygger mailto (blockeras tyst i headless) och visar success-state
    await submit.click();
    await expect(page.getByText(/Förfrågan öppnad i din e-postklient|Request opened in your email client/)).toBeVisible();
  });
});
