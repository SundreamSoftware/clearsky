import { expect, test } from '@playwright/test';
import { mockGiosApi } from './helpers/mockApi';

test.describe('Station Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
  });

  test('should search for a station by city', async ({ page }) => {
    await page.getByRole('combobox').fill('Warszawa');
    await expect(page.getByText('Warszawa - Centrum')).toBeVisible();
  });

  test('should search for a station by name', async ({ page }) => {
    await page.getByRole('combobox').fill('Nowa Huta');
    await expect(page.getByText('Kraków - Nowa Huta')).toBeVisible();
  });

  test('should show no results for unknown query', async ({ page }) => {
    await page.getByRole('combobox').fill('xyz999abc');
    await expect(page.getByText(/nie znaleziono/i)).toBeVisible();
  });
});
