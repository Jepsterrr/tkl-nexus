import { test, expect, type Page } from '@playwright/test';

/**
 * Språk- och tematoggle — kärn-UX som måste fungera på både desktop och mobil.
 * Desktop-kontrollerna kräver xl-breakpoint; på mobil öppnas hamburger-menyn.
 */

async function openControls(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: /Öppna meny|Open menu/ }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
  }
}

test.describe('Språktoggle', () => {
  test('SV → EN byter UI-språk, html-lang och persisterar', async ({ page, isMobile }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'sv');

    await openControls(page, isMobile);
    await page.getByRole('button', { name: /^Engelska$|English/ }).first().click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // aria-pressed flyttas till EN-knappen
    await expect(
      page.getByRole('button', { name: /English \(active\)/ }).first(),
    ).toHaveAttribute('aria-pressed', 'true');

    // Persistens via localStorage (tkl-locale)
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.evaluate(() => localStorage.getItem('tkl-locale'))).toBe('en');
  });
});

test.describe('Tematoggle', () => {
  test('light → dark sätter .dark på html och persisterar utan FOUC', async ({ page, isMobile }) => {
    await page.goto('/');
    // Default är light (blocking script i <head>)
    await expect(page.locator('html')).toHaveClass(/light/);

    await openControls(page, isMobile);
    await page.getByRole('button', { name: /^Mörkt$|^Dark$/ }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).not.toHaveClass(/light/);

    // Persistens: blocking script ska sätta .dark FÖRE hydration (ingen flash)
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('tkl-theme'))).toBe('dark');
  });

  test('system-läget följer prefers-color-scheme', async ({ page, isMobile }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await openControls(page, isMobile);
    await page.getByRole('button', { name: /^System$/ }).first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/light/);
  });
});
