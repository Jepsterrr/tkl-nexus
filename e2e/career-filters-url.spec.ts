import { test, expect } from '@playwright/test';
import { waitForAppReady, openCareerFilters, careerUrl } from './helpers';

/**
 * /career — URL-synkade filter (?type=&org=&company=&location=&q=).
 * Datoberoende: live-`career` kan vara tom, så testerna asserterar på
 * filtermekanik (aria-pressed, URL, chips, tomt-state), aldrig på annonsinnehåll.
 * På mobil nås panelen via "Filter"-knappen (bottom-sheet), på desktop är den en sidopanel.
 */

const CHIP_LIST = /^(Aktiva filter|Active filters)$/;
const REMOVE = (label: RegExp) => new RegExp(`^(Ta bort filter|Remove filter): (${label.source})$`);

test.describe('Career — URL-synkade filter', () => {
  test('förvalda filter läses från URL och visas som chips', async ({ page }) => {
    await page.goto('/career?type=exjobb&org=public');
    await waitForAppReady(page);

    const chips = page.getByRole('list', { name: CHIP_LIST });
    await expect(chips.getByRole('button', { name: REMOVE(/Exjobb|Thesis/) })).toBeVisible();
    await expect(chips.getByRole('button', { name: REMOVE(/Myndighet & institut|Public body & institute/) })).toBeVisible();
  });

  test('förvalda filter speglas i panelen (aria-pressed, fält, select)', async ({ page, isMobile }) => {
    await page.goto('/career?type=exjobb&org=public&company=Acme&q=radar');
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    const typeGroup = scope.getByRole('group', { name: /Filtrera annonser|Filter opportunities/ });
    await expect(typeGroup.getByRole('button', { name: /^(Exjobb|Thesis)\s*\d*$/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(typeGroup.getByRole('button', { name: /^(Alla|All)\s*\d*$/ })).toHaveAttribute('aria-pressed', 'false');

    const orgGroup = scope.getByRole('group', { name: /^(Organisation)$/ });
    await expect(orgGroup.getByRole('button', { name: /^(Myndighet & institut|Public body & institute)\s*\d*$/ })).toHaveAttribute('aria-pressed', 'true');

    await expect(scope.getByRole('textbox', { name: /^(Sök|Search)$/ })).toHaveValue('radar');
    // Arbetsgivare som saknas i datan läggs ändå till som alternativ så att delade länkar visar valet
    await expect(scope.getByRole('combobox', { name: /^(Arbetsgivare|Employer)$/ })).toHaveValue('Acme');
  });

  test('ogiltiga värden i URL ignoreras', async ({ page }) => {
    await page.goto('/career?type=bogus&org=nope');
    await waitForAppReady(page);
    await expect(page.getByRole('list', { name: CHIP_LIST })).toHaveCount(0);
  });

  test('ändrat filter skriver till URL utan ny historikpost', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const before = await page.evaluate(() => history.length);

    const scope = await openCareerFilters(page, !!isMobile);
    await scope
      .getByRole('group', { name: /Filtrera annonser|Filter opportunities/ })
      .getByRole('button', { name: /^(Sommarjobb|Summer jobs)\s*\d*$/ })
      .click();

    await expect(page).toHaveURL(/type=sommarjobb/);
    expect(await page.evaluate(() => history.length)).toBe(before);
  });

  test('organisationsfilter skriver org till URL och "Alla" tar bort den', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile, 'type=jobb'));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);
    const orgGroup = scope.getByRole('group', { name: /^(Organisation)$/ });

    await orgGroup.getByRole('button', { name: /^(Myndighet & institut|Public body & institute)\s*\d*$/ }).click();
    await expect(page).toHaveURL(/org=public/);

    await orgGroup.getByRole('button', { name: /^(Alla|All)\s*\d*$/ }).click();
    await expect(page).not.toHaveURL(/org=/);
  });

  test('chip tar bort filtret och URL-parametern', async ({ page }) => {
    await page.goto('/career?type=exjobb');
    await waitForAppReady(page);

    await page.getByRole('list', { name: CHIP_LIST }).getByRole('button', { name: REMOVE(/Exjobb|Thesis/) }).click();
    await expect(page).not.toHaveURL(/type=/);
    await expect(page.getByRole('list', { name: CHIP_LIST })).toHaveCount(0);
  });

  test('fritext skrivs till URL:en (q) och ger en filterchip', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    await scope.getByRole('textbox', { name: /^(Sök|Search)$/ }).fill('zzzxyzzy');
    // Mobil har även seed-chipet (org) — räkna bara fritextens
    await expect(page.getByRole('list', { name: CHIP_LIST }).getByRole('button', { name: REMOVE(/.zzzxyzzy./) })).toHaveCount(1);
    await expect(page).toHaveURL(/[?&]q=zzzxyzzy/);
  });

  test('fritext spolas till URL:en direkt när sökfältet tappar fokus (före debouncen)', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);
    const search = scope.getByRole('textbox', { name: /^(Sök|Search)$/ });

    // Skriv och blurra i samma tick — utan flush vid blur skulle URL:en först uppdateras efter 250 ms
    const q = await search.evaluate((el) => {
      const input = el as HTMLInputElement;
      input.focus();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, 'blurq');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return new Promise<string | null>((resolve) =>
        // React uppdaterar state synkront för input-event; blur i nästa microtask
        queueMicrotask(() => {
          input.blur();
          resolve(new URL(window.location.href).searchParams.get('q'));
        }),
      );
    });
    expect(q).toBe('blurq');
  });

  test('"Rensa alla filter" nollställer filter, chips och URL', async ({ page, isMobile }) => {
    await page.goto('/career?type=exjobb&org=public&company=Acme&location=Lule%C3%A5&q=radar');
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    await scope.getByRole('button', { name: /^(Rensa alla filter|Clear all filters)$/ }).click();

    await expect(page).toHaveURL((u) => u.search === '');
    await expect(page.getByRole('list', { name: CHIP_LIST })).toHaveCount(0);
    await expect(scope.getByRole('textbox', { name: /^(Sök|Search)$/ })).toHaveValue('');
  });

  test('övriga query-parametrar (?id=) bevaras när filter ändras', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career?id=finns-inte', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);

    await scope
      .getByRole('group', { name: /Filtrera annonser|Filter opportunities/ })
      .getByRole('button', { name: /^(Praktik|Internships)\s*\d*$/ })
      .click();

    await expect(page).toHaveURL(/type=praktik/);
    await expect(page).toHaveURL(/id=finns-inte/);
  });

  test('bakåt/framåt synkar filtren mot URL:en', async ({ page }) => {
    await page.goto('/career');
    await waitForAppReady(page);

    // Ny historikpost (som drawern gör med pushState) — back → /career, forward → filtrerad vy
    await page.evaluate(() => history.pushState(history.state, '', '/career?type=exjobb'));
    await page.goBack();
    await expect(page).toHaveURL((u) => u.search === '');
    await page.goForward();
    await expect(page).toHaveURL(/type=exjobb/);
    await expect(
      page.getByRole('list', { name: CHIP_LIST }).getByRole('button', { name: REMOVE(/Exjobb|Thesis/) }),
    ).toBeVisible();
  });

  test('bakåt rensar väntande q-skrivning (ingen gammal q skrivs över URL:en)', async ({ page, isMobile }) => {
    await page.goto(careerUrl('/career', !!isMobile));
    await waitForAppReady(page);
    const scope = await openCareerFilters(page, !!isMobile);
    const search = scope.getByRole('textbox', { name: /^(Sök|Search)$/ });
    const handle = await search.elementHandle();

    await page.evaluate((next) => history.pushState(history.state, '', next), careerUrl('/career?type=jobb', !!isMobile));

    // Skriv och gå bakåt i samma tick — den debouncade URL-skrivningen (250 ms) är då fortfarande väntande
    await page.evaluate((input) => {
      const el = input as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, 'gammalt-q');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      history.back();
    }, handle);

    // Ingen observerbar händelse att vänta på (felet är att något INTE ska hända) —
    // vänta förbi debouncen (250 ms) med marginal: URL:en ska fortfarande sakna q och fältet vara tomt
    await page.waitForTimeout(700);
    await expect(page).toHaveURL((u) => !u.searchParams.has('q'));
    await expect(search).toHaveValue('');
  });
});
