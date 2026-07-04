import { test, expect } from '@playwright/test';

/**
 * Security headers — verifierar next.config.ts-headers via `next start`.
 * OBS: I produktion serveras headers av firebase.json (statisk hosting kör
 * aldrig headers()). Filerna SKA vara i synk — detta test fångar regressioner
 * i next.config.ts; firebase.json-pariteten granskas i code review.
 */

test.describe('Security headers (next start-spegling av firebase.json)', () => {
  test('alla säkerhetsheaders är satta på startsidan', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['permissions-policy']).toContain('camera=()');

    const csp = headers['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
    // Exakt Worker-URL — aldrig wildcard *.workers.dev
    expect(csp).toContain('https://tkl-cloudinary-delete.tklnexus.workers.dev');
    expect(csp).not.toContain('*.workers.dev');
  });

  test('inga posthog-scripts laddas när analytics är avstängd', async ({ page }) => {
    const posthogRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('posthog')) posthogRequests.push(req.url());
    });
    await page.goto('/');
    // networkidle fungerar inte (Firestore long-polling) — ge sidan tid att ladda allt JS
    await expect(page.locator('h1:visible').first()).toBeVisible();
    await page.waitForTimeout(4000);
    expect(posthogRequests, 'ANALYTICS_ENABLED=false → noll posthog-trafik').toEqual([]);

    // Cookie-bannern ska inte heller visas — det finns inget att samtycka till
    await expect(page.getByRole('dialog', { name: /cookie|kakor/i })).toHaveCount(0);
  });
});
