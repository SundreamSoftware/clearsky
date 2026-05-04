# Phase 08 — Tests Implementation Prompt

You are a senior QA/frontend engineer completing the test suite for **ClearSky**, an air quality dashboard for Poland.

Phases 01–07 are complete. The application is functionally complete and polished.

## Your Task

Implement all remaining tests as described in `readme.md` in this folder. Ensure all previously specified tests from phases 02–07 are fully implemented and passing.

## Key Deliverables

1. Audit and fill gaps in unit tests (mappers, utils)
2. Audit and fill gaps in component tests
3. Create E2E fixture files (JSON mock data)
4. Create `mockApi.ts` helper for Playwright
5. Implement all 8 E2E test scenarios
6. Add `data-testid` attributes to all required components

## Test Files to Create

### New Unit Tests
- `src/shared/utils/dateTime.test.ts`
- `src/shared/utils/number.test.ts`
- `src/features/air-quality/components/PollutantCard.spec.tsx`

### E2E Fixtures
- `tests/e2e/fixtures/stations.json`
- `tests/e2e/fixtures/sensors-1.json`
- `tests/e2e/fixtures/measurements-101.json`
- `tests/e2e/fixtures/aqi-1.json`
- `tests/e2e/fixtures/aqi-empty.json`

### E2E Helpers
- `tests/e2e/helpers/mockApi.ts`

### E2E Test Files
- `tests/e2e/map.spec.ts`
- `tests/e2e/search.spec.ts`
- `tests/e2e/station-details.spec.ts`
- `tests/e2e/error-states.spec.ts`

## Critical Requirements

1. **ALL E2E tests must use `page.route()` to mock the GIOŚ API** — no real network calls in tests.
2. Every `data-testid` listed in the readme must be added to the correct component.
3. Component tests must mock hooks using `vi.mock()` — no real API calls.
4. Playwright config must use `webServer` to start the dev server automatically.
5. Tests must be deterministic — no timeouts or `waitFor` with arbitrary delays.

## Verification Steps

Run these commands in order:
1. `npm run test` — ALL unit and component tests must pass (0 failures)
2. `npm run test:coverage` — generate coverage report
3. `npm run test:e2e` — ALL E2E tests must pass (0 failures, 8 tests total)
4. `npm run build` — zero TypeScript errors

Report the output of each command. If any test fails, fix it before moving on.

## Notes on Playwright Test Strategy

Use `page.route()` BEFORE `page.goto()` — routes must be set up before navigation:
```ts
await mockGiosApi(page);  // set up routes first
await page.goto('/');     // then navigate
```

For station marker clicks in E2E tests, the markers need `data-testid="station-marker"`. Since CircleMarker is an SVG element, add the testid via:
```tsx
<CircleMarker
  {...props}
  pathOptions={{ ... }}
  eventHandlers={{ click: ... }}
>
  <Tooltip>{station.name}</Tooltip>
</CircleMarker>
```

If Leaflet CircleMarker doesn't support `data-testid` directly, use a `<div>` overlay or reconsider using a custom DivIcon for E2E-testability.
