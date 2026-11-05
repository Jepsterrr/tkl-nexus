import { test, expect } from '@playwright/test';
import { waitForAppReady, openCareerFilters, careerUrl } from './helpers';

/**
 * Filter-tabs och sökfält på /career och /events.
 * Deterministiska — asserterar på toggle-state och tomma states,
 * aldrig på Firestore-innehåll.
 */

test.describe('Career — filter och sök', () => {
  test('typfilter togglar aria-pressed', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    const group = scope.getByRole('group', { name: /Filtrera annonser|Filter opportunities/ });
    const all = group.getByRole('button', { name: /^(Alla|All)\s*\d*$/ });
    const exjobb = group.getByRole('button', { name: /^(Exjobb|Thesis)\s*\d*$/ });

    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await exjobb.click();
    await expect(exjobb).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
  });

  test('sökning utan träff visar query i tomt-state, rensa filter återställer', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    const input = scope.getByRole('textbox', { name: /^(Sök|Search)$/ });
    await input.fill('zzzxyzzy-finns-inte');
    await expect(
      page.getByText(/Inga träffar för "zzzxyzzy-finns-inte"|No results for "zzzxyzzy-finns-inte"/),
    ).toBeVisible();

    await scope.getByRole('button', { name: /^(Rensa alla filter|Clear all filters)$/ }).click();
    await expect(input).toHaveValue('');
    await expect(page.getByText(/Inga träffar för|No results for/)).toHaveCount(0);
  });

  test('rensa-sökning-knappen (X) tömmer fältet', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    const input = scope.getByRole('textbox', { name: /^(Sök|Search)$/ });
    await input.fill('zzzxyzzy-finns-inte');
    await scope.getByRole('button', { name: /^(Rensa sökning|Clear search)$/ }).click();
    await expect(input).toHaveValue('');
    await expect(page.getByText(/Inga träffar för|No results for/)).toHaveCount(0);
  });
});

test.describe('Events — filter och sök', () => {
  test('sektionsfilter togglar aria-pressed', async ({ page }) => {
    await page.goto('/events');
    await waitForAppReady(page);

    const group = page.getByRole('group', { name: /Filtrera events|Filter events/ });
    const all = group.getByRole('button', { name: /Alla sektioner|All sections/ });
    const data = group.getByRole('button', { name: /Datasektionen|Data Section/ });

    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await data.click();
    await expect(data).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
  });

  test('sökning utan träff visar tomt-state', async ({ page }) => {
    await page.goto('/events');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: /Sök på eventtitel|Search by event title/ });
    await input.fill('zzzxyzzy-finns-inte');

    await expect(page.getByText(/Inga kommande events|No upcoming events/)).toBeVisible();

    await page.getByRole('button', { name: /Rensa sökning|Clear search/ }).click();
    await expect(input).toHaveValue('');
  });
});

test.describe('Events — växlare och sökfält (layout/a11y)', () => {
  test('NEXUS/Campus-växlaren ryms utan klippning och sökfältet har synlig fokusring', async ({ page }) => {
    await page.goto('/events');
    await waitForAppReady(page);

    const nexus = page.getByRole('button', { name: /NEXUS Events/ });
    const campus = page.getByRole('button', { name: /Campus Events/ });
    const toggle = nexus.locator('..');
    // Innehållet får inte vara bredare än ytan (366 px i 358 px klipptes tidigare)
    const overflow = await toggle.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    for (const b of [nexus, campus]) {
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }

    // WCAG 2.4.7: tangentbordsfokus ger en synlig ring (box-shadow från ring-2)
    const input = page.getByRole('textbox', { name: /Sök på eventtitel|Search by event title/ });
    await input.focus();
    const shadow = await input.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');

    // Rensa-krysset: 44×44 träffyta och type="button"
    await input.fill('abc');
    const clear = page.getByRole('button', { name: /Rensa sökning|Clear search/ });
    await expect(clear).toHaveAttribute('type', 'button');
    const cb = (await clear.boundingBox())!;
    expect(Math.round(cb.width)).toBeGreaterThanOrEqual(44);
    expect(Math.round(cb.height)).toBeGreaterThanOrEqual(44);
  });
});
