# Phase 08 — Tests

## Goal

Complete the full test suite: fill gaps in unit and component tests, and implement all Playwright E2E tests. After this phase the project has comprehensive test coverage that can run in CI.

---

## What Needs to Be Done

### 1. Unit Test Completeness Audit

Verify all unit tests from previous phases are implemented. Add any missing tests:

| File | Test File | Status |
|---|---|---|
| `airQualityScale.ts` | `airQualityScale.test.ts` | Should be done (Phase 02) |
| `stationFilters.ts` | `stationFilters.test.ts` | Should be done (Phase 02, 04) |
| `measurementFormatter.ts` | `measurementFormatter.test.ts` | Should be done (Phase 02) |
| `stationMapper.ts` | `stationMapper.test.ts` | Should be done (Phase 02) |
| `sensorMapper.ts` | `sensorMapper.test.ts` | Should be done (Phase 02) |
| `measurementMapper.ts` | `measurementMapper.test.ts` | Should be done (Phase 02) |
| `airQualityIndexMapper.ts` | `airQualityIndexMapper.test.ts` | Should be done (Phase 02) |
| `dateTime.ts` | `dateTime.test.ts` | Add in this phase |
| `number.ts` | `number.test.ts` | Add in this phase |

### 2. Additional Unit Tests

#### `dateTime.test.ts`
```ts
describe('formatDateTime', () => {
  it('formats ISO string to human-readable date and time', ...)
  it('handles GIOŚ date format "2024-05-04 12:00:00"', ...)
})

describe('formatDate', () => {
  it('formats to DD.MM.YYYY', ...)
})
```

#### `number.test.ts`
```ts
describe('formatNumber', () => {
  it('formats to 1 decimal by default', ...)
  it('formats to specified decimals', ...)
  it('handles zero', ...)
})
```

### 3. Component Test Completeness Audit

Verify all component tests from previous phases are implemented:

| Component | Test File |
|---|---|
| `AirQualityMap` | Phase 03 |
| `StationMarker` | Phase 03 |
| `StationSearch` | Phase 04 |
| `AirQualityBadge` | Phase 05 |
| `StationDetailsPanel` | Phase 05 |
| `PollutantChart` | Phase 06 |

Add any missing tests for `PollutantCard`:

#### `PollutantCard.spec.tsx`
```ts
describe('PollutantCard', () => {
  it('renders parameter name and value', ...)
  it('renders loading state when isLoading is true', ...)
  it('renders dash for null measurement', ...)
  it('applies selected styling when isSelected is true', ...)
  it('calls onSelect when clicked', ...)
})
```

### 4. E2E Tests with Playwright (`tests/e2e/`)

All E2E tests mock the GIOŚ API using Playwright's `page.route()` to intercept network requests.

#### Mock Data Fixtures (`tests/e2e/fixtures/`)

Create fixture files:

**`stations.json`** — minimal list of 3 test stations:
```json
[
  {
    "id": 1,
    "stationName": "Warszawa - Centrum",
    "gegrLat": "52.2297",
    "gegrLon": "21.0122",
    "city": { "id": 1, "name": "Warszawa", "commune": { "provinceName": "MAZOWIECKIE" } },
    "addressStreet": "ul. Marszałkowska"
  },
  {
    "id": 2,
    "stationName": "Kraków - Nowa Huta",
    "gegrLat": "50.0647",
    "gegrLon": "19.9450",
    "city": { "id": 2, "name": "Kraków", "commune": { "provinceName": "MAŁOPOLSKIE" } },
    "addressStreet": "ul. Bulwarowa"
  },
  {
    "id": 3,
    "stationName": "Gdańsk - Port",
    "gegrLat": "54.3520",
    "gegrLon": "18.6466",
    "city": { "id": 3, "name": "Gdańsk", "commune": { "provinceName": "POMORSKIE" } },
    "addressStreet": "ul. Portowa"
  }
]
```

**`sensors-1.json`** — sensors for station 1:
```json
[
  {
    "id": 101,
    "stationId": 1,
    "param": { "paramCode": "PM2.5", "paramName": "pył zawieszony PM2.5", "idParam": 69 }
  },
  {
    "id": 102,
    "stationId": 1,
    "param": { "paramCode": "PM10", "paramName": "pył zawieszony PM10", "idParam": 3 }
  }
]
```

**`measurements-101.json`** — measurements for sensor 101:
```json
{
  "key": "PM2.5",
  "values": [
    { "date": "2024-05-04 12:00:00", "value": 12.5 },
    { "date": "2024-05-04 11:00:00", "value": 11.2 },
    { "date": "2024-05-04 10:00:00", "value": 9.8 }
  ]
}
```

**`aqi-1.json`** — AQI for station 1:
```json
{
  "id": 1,
  "stCalcDate": "2024-05-04 12:00:00",
  "stIndexLevel": { "id": 1, "indexLevelName": "Dobry" },
  "stSourceDataDate": "2024-05-04 11:00:00"
}
```

**`aqi-empty.json`** — AQI with no data:
```json
{
  "id": 2,
  "stCalcDate": null,
  "stIndexLevel": null,
  "stSourceDataDate": null
}
```

#### API Mocking Helper (`tests/e2e/helpers/mockApi.ts`)

```ts
import { Page } from '@playwright/test';
import stations from '../fixtures/stations.json';
import sensors1 from '../fixtures/sensors-1.json';
import measurements101 from '../fixtures/measurements-101.json';
import aqi1 from '../fixtures/aqi-1.json';

export async function mockGiosApi(page: Page) {
  const base = 'https://api.gios.gov.pl/pjp-api/rest';
  await page.route(`${base}/station/findAll`, route =>
    route.fulfill({ json: stations })
  );
  await page.route(`${base}/station/sensors/1`, route =>
    route.fulfill({ json: sensors1 })
  );
  await page.route(`${base}/data/getData/101`, route =>
    route.fulfill({ json: measurements101 })
  );
  await page.route(`${base}/aqindex/getIndex/1`, route =>
    route.fulfill({ json: aqi1 })
  );
}

export async function mockGiosApiError(page: Page) {
  const base = 'https://api.gios.gov.pl/pjp-api/rest';
  await page.route(`${base}/station/findAll`, route =>
    route.fulfill({ status: 500, json: { message: 'Server Error' } })
  );
}
```

#### E2E Test Files

**`tests/e2e/map.spec.ts`**
```ts
test.describe('Map', () => {
  test.beforeEach(async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
  });

  test('should display the map', async ({ page }) => {
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
  });

  test('should load stations', async ({ page }) => {
    await expect(page.locator('[data-testid="station-marker"]')).toHaveCount(3);
  });
});
```

**`tests/e2e/search.spec.ts`**
```ts
test.describe('Station Search', () => {
  test('should search for a station by city', async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
    await page.getByRole('searchbox').fill('Warszawa');
    await expect(page.getByText('Warszawa - Centrum')).toBeVisible();
  });
});
```

**`tests/e2e/station-details.spec.ts`**
```ts
test.describe('Station Details', () => {
  test.beforeEach(async ({ page }) => {
    await mockGiosApi(page);
    await page.goto('/');
  });

  test('should select a station marker', async ({ page }) => {
    await page.locator('[data-testid="station-marker"]').first().click();
    await expect(page.locator('[data-testid="station-details-panel"]')).toBeVisible();
  });

  test('should display station details', async ({ page }) => {
    await page.locator('[data-testid="station-marker"]').first().click();
    await expect(page.getByText('Warszawa - Centrum')).toBeVisible();
    await expect(page.getByText('Warszawa')).toBeVisible();
  });

  test('should display pollutant measurements', async ({ page }) => {
    await page.locator('[data-testid="station-marker"]').first().click();
    await expect(page.locator('[data-testid="pollutant-card"]')).toHaveCount(2);
  });
});
```

**`tests/e2e/error-states.spec.ts`**
```ts
test.describe('Error States', () => {
  test('should handle API error state', async ({ page }) => {
    await mockGiosApiError(page);
    await page.goto('/');
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
  });

  test('should handle station without measurements', async ({ page }) => {
    await mockGiosApi(page);
    // Override measurements to return empty
    await page.route('**/data/getData/**', route =>
      route.fulfill({ json: { key: 'PM2.5', values: [] } })
    );
    await page.goto('/');
    await page.locator('[data-testid="station-marker"]').first().click();
    await page.locator('[data-testid="pollutant-card"]').first().click();
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});
```

### 5. Add `data-testid` Attributes

Ensure these `data-testid` attributes are added to components (where not already present):

| Component | `data-testid` |
|---|---|
| Map container div | `map-container` |
| Each `StationMarker` | `station-marker` |
| `StationDetailsPanel` root | `station-details-panel` |
| Each `PollutantCard` | `pollutant-card` |
| `ErrorState` root | `error-state` |
| `EmptyState` root | `empty-state` |
| `LoadingState` root | `loading-state` |

---

## Running Tests in CI

Playwright in CI requires browsers to be installed:
```yaml
- run: npx playwright install --with-deps chromium
```

Run tests against the dev server:
```yaml
- run: npm run test:e2e
```

---

## Acceptance Criteria for Phase 08

- [ ] All unit tests pass (`npm run test`)
- [ ] All component tests pass
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No skipped tests
- [ ] Test coverage report generated (`npm run test:coverage`)
- [ ] Playwright tests run against mocked API (no real network calls)
- [ ] CI can run all tests headlessly
- [ ] Zero TypeScript errors in test files
