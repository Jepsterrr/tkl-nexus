import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';
import { DEALS_ENABLED } from '../src/lib/features';

/**
 * Grundläggande navigering — sidor renderar, navbar fungerar, 404 hanteras.
 * Testerna asserterar på UI-mekanik, aldrig på Firestore-innehåll
 * (datat ändras av admins och får inte göra testerna röda).
 */

test.describe('Navigering', () => {
  test('startsidan renderar hero och navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TKL NEXUS/);
    await expect(page.getByRole('navigation').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('alla publika rutter svarar och renderar h1', async ({ page }) => {
    const routes = [
      '/students',
      '/students/deals',
      '/corporate',
      '/corporate/post',
      '/corporate/services',
      '/events',
      '/career',
      '/about',
      '/privacy',
    ];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} ska svara 200`).toBe(200);
      // h1:visible — flera sidor har separata desktop/mobil-heros där den ena är display:none
      await expect(page.locator('h1:visible').first(), `${route} ska ha en synlig h1`).toBeVisible();
    }
  });

  test('okänd rutt visar 404-sidan med CTA hem', async ({ page }) => {
    await page.goto('/denna-sida-finns-inte');
    await expect(page.getByText(/Sidan kunde inte hittas|Page not found/)).toBeVisible();
    await page.getByRole('link', { name: /Till startsidan|Back to home/ }).click();
    await expect(page).toHaveURL('/');
  });

  test('skip-länk finns för tangentbordsanvändare', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('a.skip-nav');
    await expect(skip).toHaveAttribute('href', '#main-content');
  });

  test('Deals är dolt: ingen länk pekar mot /students/deals', async ({ page }) => {
    test.skip(DEALS_ENABLED, 'Deals är aktiverat');
    for (const route of ['/', '/students', '/corporate', '/about']) {
      await page.goto(route);
      // RootNetwork laddas klientsida (dynamic, ssr:false) — vänta tills den monterats
      await waitForAppReady(page);
      await expect(page.locator('a[href*="/students/deals"]'), `${route}`).toHaveCount(0);
    }
  });

  test('Studenter- och Företag-dropdown saknar Events respektive Kontakt', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop-dropdown');
    await page.goto('/');
    await waitForAppReady(page);
    const nav = page.getByRole('navigation').first();

    // Dropdown-panelen är den direkta föräldern till barnlänkarna och renderas bara när den är öppen.
    await nav.getByRole('link', { name: /^(STUDENTER|STUDENTS)$/i }).hover();
    const studentsPanel = nav.locator('a[href="/career"]').first().locator('..');
    await expect(studentsPanel.locator('a')).toHaveCount(DEALS_ENABLED ? 2 : 1); // Karriär (+ Deals om aktiverat); Events borta
    await expect(studentsPanel.locator('a[href="/events"]')).toHaveCount(0);

    await nav.getByRole('link', { name: /^(FÖRETAG|COMPANIES)$/i }).hover();
    const corporatePanel = nav.locator('a[href="/corporate/post"]').first().locator('..');
    await expect(corporatePanel.locator('a')).toHaveCount(2); // Annonsera + Tjänster (Kontakt borta)
    await expect(corporatePanel.locator('a[href="/about#kontakt"]')).toHaveCount(0);
  });
});
