import { expect, test } from '@playwright/test';
import { mockGiosApi } from './helpers/mockApi';

test.describe('Station Details', () => {
  test.beforeEach(async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
  });

  test('should select a station via search and display details panel', async ({ page }) => {
    await page.getByRole('combobox').fill('Warszawa');
    await page.getByText('Warszawa - Centrum').click();
    await expect(page.locator('[data-testid="station-details-panel"]')).toBeVisible();
  });

  test('should display station name and city in details panel', async ({ page }) => {
    await page.getByRole('combobox').fill('Warszawa');
    await page.getByText('Warszawa - Centrum').click();
    await expect(page.getByText('Warszawa - Centrum')).toBeVisible();
    await expect(page.getByText('Warszawa, ul. Marszałkowska')).toBeVisible();
  });

  test('should display pollutant measurements', async ({ page }) => {
    await page.getByRole('combobox').fill('Warszawa');
    await page.getByText('Warszawa - Centrum').click();
    await expect(page.locator('[data-testid="pollutant-card"]')).toHaveCount(2);
  });

  test('should close panel when close button clicked', async ({ page }) => {
    await page.getByRole('combobox').fill('Warszawa');
    await page.getByText('Warszawa - Centrum').click();
    await expect(page.locator('[data-testid="station-details-panel"]')).toBeVisible();
    await page.getByLabel(/zamknij/i).click();
    await expect(page.locator('[data-testid="station-details-panel"]')).not.toBeVisible();
  });
});
