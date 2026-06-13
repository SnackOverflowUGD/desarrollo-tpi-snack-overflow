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
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Boots the frontend automatically for the test run.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
