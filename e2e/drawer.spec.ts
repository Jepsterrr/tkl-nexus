import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers';

/**
 * Drawer-mönstret på /career — URL-synk (?id=), Escape-stängning, fokus.
 * Datadrivet: om inga publicerade annonser finns hoppas testet över
 * (tomt Firestore får inte ge röda tester).
 */

test.describe('Career-drawer', () => {
  test('öppnar via kort, synkar URL, stängs med Escape', async ({ page }) => {
    await page.goto('/career');

    const viewButtons = page.getByRole('button', { name: /^Visa mer:/ });
    await waitForAppReady(page, 4000);

    const count = await viewButtons.count();
    test.skip(count === 0, 'Inga publicerade annonser i Firestore — inget att testa');

    await viewButtons.first().click();

    const drawer = page.getByRole('dialog', { name: /Jobbdetaljer|Job details/ });
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(/\?id=.+/);

    // Fokus ska landa på stäng-knappen (a11y-kontraktet)
    const closeBtn = drawer.getByRole('button', { name: /Stäng|Close/ });
    await expect(closeBtn).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(page).not.toHaveURL(/\?id=/);
  });

  test('direktlänk med ?id= öppnar drawern vid sidladdning', async ({ page }) => {
    await page.goto('/career');
    await waitForAppReady(page, 4000);

    const viewButtons = page.getByRole('button', { name: /^Visa mer:/ });
    const count = await viewButtons.count();
    test.skip(count === 0, 'Inga publicerade annonser i Firestore — inget att testa');

    // Plocka ett riktigt id via UI:t, ladda sedan sidan direkt med ?id=
    await viewButtons.first().click();
    await expect(page).toHaveURL(/\?id=.+/);
    const url = page.url();

    await page.goto(url);
    await expect(
      page.getByRole('dialog', { name: /Jobbdetaljer|Job details/ }),
    ).toBeVisible();
  });
});

test.describe('Event-drawer', () => {
  test('öppnas via kort, synkar URL, stängs med Escape', async ({ page }) => {
    await page.goto('/events');
    await waitForAppReady(page, 4000);

    const viewButtons = page.getByRole('button', { name: /Visa mer:|View details:/ });
    const count = await viewButtons.count();
    test.skip(count === 0, 'Inga publicerade events i Firestore — inget att testa');

    await viewButtons.first().click();
    const drawer = page.getByRole('dialog', { name: /Eventdetaljer|Event details/ });
    await expect(drawer).toBeVisible();
    await expect(page).toHaveURL(/\?id=.+/);

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(page).not.toHaveURL(/\?id=/);
  });
});
