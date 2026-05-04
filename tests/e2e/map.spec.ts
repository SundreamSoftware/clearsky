import { expect, test } from '@playwright/test';
import { mockGiosApi } from './helpers/mockApi';

test.describe('Map', () => {
  test.beforeEach(async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
  });

  test('should display the map', async ({ page }) => {
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
  });

  test('should load stations on the map', async ({ page }) => {
    await expect(page.getByText('ClearSky')).toBeVisible();
    await page.getByRole('combobox').fill('Warszawa');
    await expect(page.getByText('Warszawa - Centrum')).toBeVisible();
  });
});
