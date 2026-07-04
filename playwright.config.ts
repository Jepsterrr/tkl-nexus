import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-tester för TKL Nexus.
 *
 * Körs mot produktionsbygget (`next start`) — samma statiska output som
 * Firebase Hosting serverar, inklusive security headers från next.config.ts.
 *
 * OBS: Testerna är dev/CI-verktyg och deployas ALDRIG — firebase.json
 * (Web Frameworks) paketerar enbart Next-buildens output, och
 * @playwright/test är en devDependency.
 *
 * Kör:  npm run test:e2e        (headless)
 *       npm run test:e2e:ui     (interaktivt UI-läge)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 1 lokal retry — testerna går mot live Firestore; transienta fetch-timeouts
  // under parallell last ska inte ge falska röda
  retries: process.env.CI ? 2 : 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
