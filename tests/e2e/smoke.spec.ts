import { expect, test } from '@playwright/test';
import { mockGiosApi } from './helpers/mockApi';

test('app loads and shows header', async ({ page }) => {
  await mockGiosApi(page);
  await page.goto('/');
  await expect(page.getByText(/clearsky/i)).toBeVisible();
});
