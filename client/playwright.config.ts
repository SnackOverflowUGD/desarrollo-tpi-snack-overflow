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
  // RNF-A.2: compatible con Chrome/Firefox/Safari (desktop + móvil). The full
  // matrix is GREEN (35/35) on Chromium, Firefox, WebKit, Mobile Chrome and
  // Mobile Safari. Per-commit CI may scope to chromium for speed; the human
  // tester runs the 5-project matrix at sprint close.
  //
  // WebKit/Mobile Safari need system libs on Linux. On the official Playwright
  // CI image (mcr.microsoft.com/playwright) they're bundled. On a rolling
  // Ubuntu (e.g. questing 25.10) `playwright install-deps` FAILS — it pins
  // package names (libicu74, libxml2, libavif16, libmanette-0.2-0, libwoff1)
  // that the distro renamed/bumped. Fix once per machine (the noble libs use a
  // DISTINCT soname, so they coexist with the system's newer ones):
  //   sudo apt-get install libwoff1 libmanette-0.2-0 libavif16
  //   # libicu74 + libxml2(.so.2) from the noble pool:
  //   #   archive.ubuntu.com/ubuntu/pool/main/{i/icu,libx/libxml2}/...
  //   PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright install
  // Then run the matrix WITH that same env var set (the validation gate checks
  // the pinned package names, not the actually-resolvable sonames):
  //   PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright test --workers=1
  // Use --workers=1: the flow is stateful (one contratación walked by two
  // actors) and re-seed per project gives each browser an isolated cliente.
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
