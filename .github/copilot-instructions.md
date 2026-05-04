# ClearSky – Copilot Instructions

## Commands

```bash
npm run dev          # start dev server at http://localhost:5173
npm run build        # tsc --noEmit then vite build (both must pass)
npm run lint         # eslint src --ext .ts,.tsx
npm run format       # prettier --write src

npm test             # vitest run (all unit + component tests, no watch)
npm run test:watch   # vitest in watch mode
npx vitest run src/features/air-quality/utils/airQualityScale.test.ts  # single file
npx vitest run -t "formats measurement value"  # single test by name

npm run test:e2e     # playwright test (auto-starts dev server via webServer config)
npm run test:e2e:ui  # playwright with interactive UI
npx playwright test tests/e2e/search.spec.ts  # single E2E file
```

`npm run build` is the canonical type-check — run it before committing.

## Architecture

### Request flow

```
Browser → /api/* (same-origin)
  → Vite dev proxy (development)        → api.gios.gov.pl/pjp-api/rest
  → Nginx /api/ proxy (production)      → api.gios.gov.pl/pjp-api/rest
```

`VITE_GIOS_API_BASE_URL` is baked at build time (Vite build-time env var, not runtime). It is always set to `/api` in production builds. Changing it requires a rebuild.

### Data pipeline per station selection

```
giosClient (Zod validated DTO)
  → mapper (DTO → domain model)
  → TanStack Query hook (cached)
  → UI component
```

Raw GIOŚ API types are never used in UI components. Always go through the mapper layer.

### Dual layout (desktop vs mobile)

`App.tsx` renders `StationDetailsPanel` in two contexts:
- **Desktop** (`lg:`): static `w-96` right column beside the map
- **Mobile**: `fixed bottom-0 h-2/3` bottom sheet overlay

Both use the same component. Layout switching is done entirely with Tailwind responsive prefixes in `App.tsx`.

### Map internals

`AirQualityMap` contains a private `MapController` component that calls `useMap()` — this hook only works inside `<MapContainer>`. `MapController` must never be moved outside `AirQualityMap.tsx`. Station markers use `<CircleMarker>` (SVG path), not default Leaflet icons, to avoid Vite bundler icon path issues. AQI colour is applied via `pathOptions.fillColor`.

### `StationDetailsPanel` inner component

`PollutantCardWithData` is a non-exported inner component defined at the bottom of `StationDetailsPanel.tsx`. It owns the per-sensor data fetch (`useSensorMeasurements`) so each pollutant card fetches independently. Do not lift this into a separate file.

## Key conventions

### Dynamic colours use inline `style`, not Tailwind classes

AQI badge and marker colours are computed at runtime from `airQualityScale.ts`. Tailwind purges unused dynamic class names, so dynamic colour values must use `style={{ backgroundColor: colour, color: textColour }}`, never template literals like `bg-[${colour}]`.

### Zod schemas live in `gios.schemas.ts`, types inferred from them in `gios.dto.ts`

DTO types are `z.infer<typeof Schema>`. Never write DTO types by hand; derive them. Domain model types in `model/*.types.ts` are handwritten and independent of Zod.

### TanStack Query cache times by data volatility

| Hook | `staleTime` |
|---|---|
| `useStations` | 10 min |
| `useAirQualityIndex` | 5 min (global default) |
| `useSensorMeasurements` | 5 min (global default) |

Override with explicit `staleTime` in the hook when the data freshness requirement differs.

### `enabled` guard pattern for dependent queries

```ts
useQuery({ queryKey: [..., id], queryFn: ..., enabled: id !== null })
```

All hooks that take a nullable ID use this pattern. Do not skip the guard.

### AQI levels

`AqiLevel` is `0 | 1 | 2 | 3 | 4 | 5`. `getAqiInfo(null)` returns `UNKNOWN_AQI` (grey). AQI is **not** fetched on map load — only when a station is selected, to avoid 500+ parallel requests.

### `onMouseDown` in `StationList`

List items in the search dropdown use `onMouseDown` (not `onClick`) to prevent the input losing focus before the selection registers. Don't change this to `onClick`.

### Leaflet CSS import

`import 'leaflet/dist/leaflet.css'` and the icon fix (`leafletIcons.ts`) are imported as side-effects in `main.tsx`. They must remain there.

### `data-testid` attributes

Present on: `map-container`, `station-details-panel`, `pollutant-card`, `loading-state`, `error-state`, `empty-state`. Used by both component tests and E2E tests — do not remove them.

## Testing

### Unit/component tests (Vitest + jsdom)

Tests live alongside source in `src/**/*.test.ts` and `src/**/*.spec.tsx`. `react-leaflet` is fully mocked in any test that imports map components — see `AirQualityMap.test.tsx` for the mock pattern. `recharts` is mocked in chart tests.

### E2E tests (Playwright)

All tests use `mockGiosApi(page)` from `tests/e2e/helpers/mockApi.ts` to intercept GIOŚ API calls via `page.route('**/endpoint', ...)`. No real network calls are made. Fixtures are in `tests/e2e/fixtures/`. The `webServer` config in `playwright.config.ts` starts `npm run dev` automatically.

## Deployment

```
clearsky.sundreamsoftware.pl → Nginx (TLS) → 127.0.0.1:5010 → Docker: clearsky-web
```

- `nginx.container.conf` — inside the container (SPA routing + `/api` proxy + `/health`)
- `nginx.server.conf` — on the host (HTTPS termination + reverse proxy to :5010)
- Health check: `GET /health` returns `200 OK`
- CI/CD: `.github/workflows/deploy.yml` — tests → build → GHCR push → SSH deploy + retry health check
- Required GitHub secrets: `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`
