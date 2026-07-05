import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * Hash-ankarlänkar genom custom inner-scroll-layouten.
 * body scrollar aldrig — ScrollContainer.onClickCapture + ScrollResetter
 * hanterar #ankare. Historiskt buggigt område; detta är regressionsvakten.
 */

test.describe('Hash-ankare', () => {
  test('Kontakt-CTA från startsidan scrollar till #kontakt på /about', async ({ page, isMobile }) => {
    await page.goto('/');
    await waitForAppReady(page);

    if (isMobile) {
      await page.getByRole('button', { name: /Öppna meny|Open menu/ }).click();
      await page.locator('#mobile-menu').getByRole('link', { name: /Kontakt|Contact/ }).click();
    } else {
      await page.getByRole('navigation').getByRole('link', { name: /Kontakt|Contact/ }).first().click();
    }

    await expect(page).toHaveURL(/\/about#kontakt/);
    // ScrollResetter scrollar med 80ms delay + smooth — vänta in att målet är i viewport
    await expect(page.locator('#kontakt')).toBeInViewport({ timeout: 10_000 });
  });

  test('direktnavigering till /about#kontakt scrollar vid sidladdning', async ({ page }) => {
    await page.goto('/about#kontakt');
    await waitForAppReady(page);
    await expect(page.locator('#kontakt')).toBeInViewport({ timeout: 10_000 });
  });
});
