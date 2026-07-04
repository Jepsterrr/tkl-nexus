import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForAppReady } from './helpers';

/**
 * Automatiserad a11y-smoke med axe-core på nyckelsidor.
 * Gate: inga critical/serious-violations (WCAG 2.1 AA-taggar).
 * Axe fångar ~30-40 % av WCAG — manuell granskning krävs fortfarande
 * för fokusordning, skärmläsarflöden och kognitiv belastning.
 */

const PAGES = ['/', '/students', '/corporate', '/events', '/career', '/students/deals', '/about'];

for (const path of PAGES) {
  test(`axe: ${path} har inga critical/serious-violations`, async ({ page }) => {
    await page.goto(path);
    await waitForAppReady(page, 3000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      blocking,
      blocking
        .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} noder`)
        .join('\n'),
    ).toEqual([]);
  });
}

test('axe: dark mode har inga critical/serious-violations på startsidan', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: /Öppna meny|Open menu/ }).click();
  }
  await page.getByRole('button', { name: /^Mörkt$|^Dark$/ }).first().click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  // Ladda om så vyn är ren (mobilmenyn stängd) — temat persisterar via localStorage
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await waitForAppReady(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(
    blocking,
    blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join('\n'),
  ).toEqual([]);
});
