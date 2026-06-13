import { expect, test } from '@playwright/test';

/**
 * Smoke test — proves the Playwright harness + webServer wiring work end to end.
 * Replace/extend with real user-journey specs (register, search, hire a provider)
 * as the UI is built. Naming: one spec file per user journey under e2e/.
 */
test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
