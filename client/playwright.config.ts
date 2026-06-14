import { defineConfig, devices } from '@playwright/test';

/**
 * System / E2E tests (ADR-006 top of the pyramid).
 *
 * Run by the HUMAN TESTER at sprint close — NOT wired into per-commit CI.
 * Prerequisite once per machine: `npx playwright install` (downloads browsers).
 *
 * As real UI flows land, add specs under `e2e/` that drive the full stack
 * (Next.js frontend → NestJS backend → Postgres/Redis). Today only a smoke test
 * exists because the frontend is still the scaffold.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  // RNF-A.2: compatible con Chrome/Firefox/Safari (desktop + móvil). The human
  // tester runs the full matrix at sprint close; per-commit CI may scope to
  // chromium for speed. WebKit/Mobile Safari need system libs on Linux:
  // `sudo npx playwright install-deps` locally, or use the official Playwright
  // CI image (mcr.microsoft.com/playwright) which bundles them.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
  // Boots the frontend automatically for the test run.
  // Port 3001 avoids collision with the NestJS backend on :3000 (design S1).
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001/registro',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
