import { expect, type Page } from '@playwright/test';

/**
 * Vänta tills sidan är interaktivt redo.
 *
 * OBS: använd ALDRIG waitForLoadState('networkidle') i denna kodbas —
 * Firestore SDK håller long-polling-anslutningar öppna så nätverket
 * blir aldrig idle. Vänta på konkret UI istället.
 */
export async function waitForAppReady(page: Page, settleMs = 2000): Promise<void> {
  // Flera sidor har separata desktop/mobil-heros — matcha den synliga h1:an
  await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 15_000 });
  // Låt Firestore-data + entré-animationer landa
  await page.waitForTimeout(settleMs);
}
