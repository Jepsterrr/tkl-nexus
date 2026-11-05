import { test, expect } from '@playwright/test';
import { waitForAppReady, openCareerFilters } from './helpers';

/**
 * /career — verktygsrad och mobilens filter-sheet.
 * Datoberoende: ett seedat filter (?type=exjobb) gör Filter-knappen synlig även
 * när live-`career` är tom; tomt-state-testet hoppas över om annonser finns.
 */

const FILTER_BTN = /^Filters?(\s\(\d+\))?$/;
const SHOW_RESULTS = /^(Visa \d+ annons(er)?|Show \d+ listings?)$/;

test.describe('Career — verktygsrad utan annonser', () => {
  test('0 annonser och inga filter: inget "Visar 0 av 0" och ingen Filter-knapp', async ({ page }) => {
    await page.goto('/career');
    await waitForAppReady(page, 4000);
    const empty = page.getByText(/Lugnt just nu|Quiet for now/);
    test.skip((await empty.count()) === 0, 'Publicerade annonser finns — tomt-statet går inte att testa');

    await expect(page.getByText(/Visar \d+ av \d+|Showing \d+ of \d+/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: FILTER_BTN })).toHaveCount(0);
  });

  test('aktivt filter: Filter-knappen visas (mobil) även utan annonser', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Filter-knappen finns bara under lg');
    await page.goto('/career?type=exjobb');
    await waitForAppReady(page);
    await expect(page.getByRole('button', { name: FILTER_BTN })).toBeVisible();
  });
});

test.describe('Career — filter-sheet (mobil)', () => {
  test.skip(({ isMobile }) => !isMobile, 'Bottom-sheeten används bara under lg');

  test('"Visa N annonser" ligger fast i sheetens botten medan filtren scrollar', async ({ page }) => {
    await page.goto('/career?type=exjobb');
    await waitForAppReady(page);
    const sheet = await openCareerFilters(page, true);
    const show = sheet.getByRole('button', { name: SHOW_RESULTS });
    const vh = page.viewportSize()!.height;

    // Vänta ut sheetens inglidning (0,28 s) — mät först när positionen är stabil
    let lastY = -1;
    await expect.poll(async () => {
      const y = (await show.boundingBox())!.y;
      const stable = Math.abs(y - lastY) < 0.5;
      lastY = y;
      return stable;
    }, { intervals: [100] }).toBe(true);

    // Synlig direkt, utan att scrolla, och nära skärmens nederkant
    await expect(show).toBeInViewport();
    const before = (await show.boundingBox())!;
    expect(before.y + before.height).toBeLessThanOrEqual(vh);
    expect(vh - (before.y + before.height)).toBeLessThan(48);

    // Scrolla filtrens yta till botten — knappen står kvar på samma plats
    await sheet.getByRole('combobox', { name: /^(Ort|Location)$/ }).scrollIntoViewIfNeeded();
    await sheet.evaluate((el) => {
      const scroller = [...el.querySelectorAll<HTMLElement>('div')].find((d) => getComputedStyle(d).overflowY === 'auto');
      scroller?.scrollTo(0, scroller.scrollHeight);
    });
    const after = (await show.boundingBox())!;
    expect(Math.abs(after.y - before.y)).toBeLessThan(2);
    await expect(show).toBeInViewport();

    await show.click();
    await expect(sheet).toBeHidden();
  });

  test('stängs sheeten av resize till ≥1024px hamnar fokus på listans rubrik, inte på body', async ({ page }) => {
    await page.goto('/career?type=exjobb');
    await waitForAppReady(page);
    const sheet = await openCareerFilters(page, true);
    await expect(sheet).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(sheet).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? document.activeElement?.tagName)).toBe('career-listings-heading');
  });
});
