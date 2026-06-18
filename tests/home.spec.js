import { expect, test } from '@playwright/test';

test('home page renders content', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#root')).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);
});
