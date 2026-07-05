import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * Filter-tabs och sökfält på /career och /events.
 * Deterministiska — asserterar på toggle-state och tomma states,
 * aldrig på Firestore-innehåll.
 */

test.describe('Career — filter och sök', () => {
  test('filter-tabs togglar aria-pressed', async ({ page }) => {
    await page.goto('/career');
    await waitForAppReady(page);

    const group = page.getByRole('group', { name: /Filtrera annonser|Filter opportunities/ });
    const all = group.getByRole('button', { name: /Alla Annonser|All Opportunities/ });
    const exjobb = group.getByRole('button', { name: /^Exjobb$|^Thesis$/ });

    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await exjobb.click();
    await expect(exjobb).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
  });

  test('sökning utan träff visar query i tomt-state, rensa-knappen återställer', async ({ page }) => {
    await page.goto('/career');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: /Sök på titel|Search by title/ });
    await input.fill('zzzxyzzy-finns-inte');

    // searchNoResults innehåller den exakta querien
    await expect(page.getByText(/Inga träffar för "zzzxyzzy-finns-inte"|No results for "zzzxyzzy-finns-inte"/)).toBeVisible();

    // Rensa-knappen (X) visas bara när sökfältet har text
    await page.getByRole('button', { name: /Rensa sökning|Clear search/ }).click();
    await expect(input).toHaveValue('');
    await expect(page.getByText(/Inga träffar för/)).toHaveCount(0);
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
