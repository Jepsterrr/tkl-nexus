import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * Deals — vytoggle med persistens, klick-för-kopiera, drawer.
 * Datadrivet: skippas när `deals`-kollektionen saknar publicerade dokument
 * (vytoggeln renderas bara när data finns).
 */

test.describe('Deals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/students/deals');
    await waitForAppReady(page, 4000);
  });

  test('vytoggle ikon/detalj växlar och persisterar i localStorage', async ({ page }) => {
    const toggle = page.getByRole('group', { name: /Välj visningsläge|Choose view mode/ });
    test.skip(!(await toggle.isVisible().catch(() => false)), 'Inga publicerade deals i Firestore');

    const iconBtn = toggle.getByRole('button', { name: /Ikoner|Icons/ });
    const detailBtn = toggle.getByRole('button', { name: /Detaljer|Details/ });

    await expect(iconBtn).toHaveAttribute('aria-pressed', 'true');

    await detailBtn.click();
    await expect(detailBtn).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('tkl-deals-view'))).toBe('detail');

    // Persistens efter reload — utan hydration-mismatch
    await page.reload();
    await waitForAppReady(page, 4000);
    await expect(
      page.getByRole('group', { name: /Välj visningsläge|Choose view mode/ })
        .getByRole('button', { name: /Detaljer|Details/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('klick-för-kopiera lägger rabattkoden i clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard-permissions kräver Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const toggle = page.getByRole('group', { name: /Välj visningsläge|Choose view mode/ });
    test.skip(!(await toggle.isVisible().catch(() => false)), 'Inga publicerade deals i Firestore');

    // Detaljvyn har kopieringsknappen
    await toggle.getByRole('button', { name: /Detaljer|Details/ }).click();

    const copyBtn = page.getByRole('button', { name: /^(Kopiera rabattkod:|Copy discount code:)/ }).first();
    test.skip(!(await copyBtn.isVisible().catch(() => false)), 'Ingen deal med rabattkod publicerad');

    const label = await copyBtn.getAttribute('aria-label');
    const code = label!.replace(/^(Kopiera rabattkod:|Copy discount code:)\s*/, '');

    await copyBtn.click();
    await expect(page.getByText(/Kopierat!|Copied!/).first()).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  });

  test('deal-drawern öppnas, synkar URL och stängs med Escape', async ({ page }) => {
    const toggle = page.getByRole('group', { name: /Välj visningsläge|Choose view mode/ });
    test.skip(!(await toggle.isVisible().catch(() => false)), 'Inga publicerade deals i Firestore');

    // Ikonvyn: hela kortet är en knapp som öppnar drawern
    const viewBtns = page.getByRole('button', { name: /Visa mer|View details/ });
    if (await viewBtns.count() === 0) {
      // Ikonvy — klicka första deal-ikonen (aria-labelled kort-knapp)
      await toggle.getByRole('button', { name: /Detaljer|Details/ }).click();
    }
    await page.getByRole('button', { name: /Visa mer|View details/ }).first().click();

    const drawer = page.getByRole('dialog', { name: /Erbjudandedetaljer|Offer details/ });
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(/\?id=.+/);
    await expect(drawer.getByRole('button', { name: /Stäng|Close/ })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(page).not.toHaveURL(/\?id=/);
  });
});
