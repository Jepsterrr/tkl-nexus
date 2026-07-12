import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * /corporate/post — tab-växling (ARIA tabs), valideringsfeedback vid ogiltig
 * submit (fel visas + fokus till första felfält — knappen är aldrig disabled),
 * och success-state efter inskick (mailto-navigering no-op:ar i headless).
 * Opportunity-fliken är helt statisk — inga Firestore-beroenden.
 */

test.describe('Företagsportalen /corporate/post', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/corporate/post');
    await waitForAppReady(page);
  });

  test('tabbar växlar med korrekt ARIA-state och piltangenter', async ({ page }) => {
    const oppTab = page.getByRole('tab', { name: /Jobb & Exjobb|Jobs & Thesis/ });
    const dealTab = page.getByRole('tab', { name: /^Deal$/ });

    await expect(oppTab).toHaveAttribute('aria-selected', 'true');

    await dealTab.click();
    await expect(dealTab).toHaveAttribute('aria-selected', 'true');
    await expect(oppTab).toHaveAttribute('aria-selected', 'false');

    // Piltangent-navigering (ARIA tabs-mönstret): Deal → ArrowRight → Opportunity (wrap)
    await page.keyboard.press('ArrowRight');
    await expect(oppTab).toHaveAttribute('aria-selected', 'true');
    await expect(oppTab).toBeFocused();
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
