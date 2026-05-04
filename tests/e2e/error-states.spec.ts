import { expect, test } from '@playwright/test';
import { mockGiosApi, mockGiosApiError } from './helpers/mockApi';

test.describe('Error States', () => {
  test('should handle API error state for stations', async ({ page }) => {
    await mockGiosApiError(page);
    await page.goto('/');
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
  });

  test('should handle station without measurements', async ({ page }) => {
    await mockGiosApi(page);
    await page.route('**/data/getData/**', (route) =>
      route.fulfill({ json: { key: 'PM2.5', values: [] } }),
    );
    await page.goto('/');
    await page.getByRole('combobox').fill('Warszawa');
    await page.getByText('Warszawa - Centrum').click();
    await expect(page.locator('[data-testid="pollutant-card"]')).toHaveCount(2);
    await page.locator('[data-testid="pollutant-card"]').first().click();
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});
