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

### Data sources

| Source | Coverage | Proxy path |
|---|---|---|
| GIOŚ | Poland air quality (official, ~700 stations) | `/api/*` → `api.gios.gov.pl/pjp-api/v1/rest` |
| WAQI | Global air quality (11,000+ stations, bounds-based) | `/waqi-api/*` → `api.waqi.info` |
| Open-Meteo | Global weather (no auth) | Direct browser fetch (no proxy needed) |

### Request flow

```
Browser → /api/*      → Vite proxy (dev) / Nginx (prod) → api.gios.gov.pl
Browser → /waqi-api/* → Vite proxy (dev) / Nginx (prod) → api.waqi.info
Browser → open-meteo  → direct (CORS-permissive API)
```

**WAQI token injection**: The token is appended server-side as `?token=…` — never in the browser bundle. In dev, `vite.config.ts` `proxyReq` handler injects `VITE_WAQI_TOKEN`; in prod, the Dockerfile `CMD` generates `/etc/nginx/waqi-token.conf` from the `WAQI_TOKEN` env var and nginx includes it. The nginx WAQI location requires `resolver 8.8.8.8 valid=300s ipv6=off;` because `proxy_pass` uses a variable (`$waqi_token`).

`VITE_GIOS_API_BASE_URL` is baked at build time. It is always `/api` in production. Changing it requires a rebuild.

### Data pipeline per station selection

```
API client (Zod-validated DTO)
  → mapper (DTO → Station / domain model)
  → TanStack Query hook (cached)
  → UI component
```

Raw API types are never used in UI components. Always go through the mapper layer.

### Station model and dual-source rendering

`Station.source` is `'gios' | 'waqi'`. This drives different rendering logic throughout the app:

- **WAQI stations**: `aqiLevel` is pre-computed in the bounds response (`mapWaqiBoundsStationToStation`). `WaqiStationMarker` reads `station.aqiLevel` directly — no extra fetch on marker render.
- **GIOŚ stations**: `aqiLevel` is `undefined`; `GiosStationMarker` calls `useAirQualityIndex(station.id)` per marker.
- **WAQI AQI is not fetched on map load** for GIOŚ stations — only on selection — to avoid 500+ parallel requests.
- `country` is `null` for WAQI stations (WAQI bounds API doesn't return country codes). The tier-1 country filter treats `null` as "worldwide".
- `voivodeship` is `null` for WAQI stations. The tier-2 voivodeship filter only shows GIOŚ.

### `App.tsx` station pipeline

```
giosStations (useStations)
  + globalStations (useGlobalStations(mapBounds))
      → filter out isInPoland() — avoids GIOŚ/WAQI duplicates
  → allStations
      → filterByCountry(selectedCountry)   — tier-1 filter
      → filter by voivodeship              — tier-2 filter (Poland only)
  → displayedStations → map markers + search
```

`isInPoland()` uses a hardcoded bbox (`14.1–24.2°E, 49.0–54.9°N`). WAQI stations inside Poland are never shown because GIOŚ provides better data for that region.

`clampMapBounds()` normalises Leaflet bounds to `[−180, 180] / [−90, 90]` before passing to `useGlobalStations`. Leaflet produces out-of-range longitudes (e.g. 397°) when the user zooms out past the dateline.

### WAQI bounds-based loading

`useGlobalStations(mapBounds)` queries WAQI only for the current map viewport (debounced 500ms after `moveend`). Stations outside the current view are not loaded until the user pans/zooms there. The map starts centred on Europe (`[50°N, 10°E]`, zoom 4) so the first query covers most of the continent.

### Two-tier filter bar

`StationFilterBar` provides:
- **Tier 1**: country select (null = all worldwide). Derived from `station.country` of loaded stations. WAQI stations appear here only when they have a non-null country, which currently never happens — they always fall into "Cały świat".
- **Tier 2**: voivodeship chips — visible only when Poland is selected. Uses `groupByVoivodeship` + `avgAqiLevelForGroup` from `stationFilters.ts`.

Selecting a country or voivodeship clears `selectedStationId`.

### Weather feature

`src/features/weather/` mirrors the air-quality feature structure. `WeatherPanel` is rendered inside `StationDetailsPanel` when a station is selected. It fetches current + 7-day historical weather from Open-Meteo using the station's lat/lon. Open-Meteo is CORS-permissive so no proxy is needed.

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

### Zod schemas live in `*.schemas.ts`, types inferred from them in `*.dto.ts`

This applies to both `gios.schemas.ts / gios.dto.ts` and `waqi.schemas.ts / waqi.dto.ts`. DTO types are `z.infer<typeof Schema>`. Never write DTO types by hand; derive them. Domain model types in `model/*.types.ts` are handwritten and independent of Zod.

### TanStack Query cache times by data volatility

| Hook | `staleTime` |
|---|---|
| `useStations` | 10 min |
| `useGlobalStations` | 5 min |
| `useAirQualityIndex` | 5 min (global default) |
| `useSensorMeasurements` | 5 min (global default) |

Override with explicit `staleTime` in the hook when the data freshness requirement differs.

### `enabled` guard pattern for dependent queries

```ts
useQuery({ queryKey: [..., id], queryFn: ..., enabled: id !== null })
```

All hooks that take a nullable ID use this pattern. Do not skip the guard.

### AQI levels

`AqiLevel` is `0 | 1 | 2 | 3 | 4 | 5`. `getAqiInfo(null)` returns `UNKNOWN_AQI` (grey). AQI is **not** fetched on map load for GIOŚ stations — only when a station is selected. WAQI stations carry their AQI from the bounds query.

### `onMouseDown` in `StationList`

List items in the search dropdown use `onMouseDown` (not `onClick`) to prevent the input losing focus before the selection registers. Don't change this to `onClick`.

### Leaflet CSS import

`import 'leaflet/dist/leaflet.css'` and the icon fix (`leafletIcons.ts`) are imported as side-effects in `main.tsx`. They must remain there.

### `data-testid` attributes

Present on: `map-container`, `station-details-panel`, `pollutant-card`, `loading-state`, `error-state`, `empty-state`. Used by both component tests and E2E tests — do not remove them.

### Dev-only debug logging

`import.meta.env.DEV`-guarded `console.debug` calls exist in `App.tsx` (station counts per source, bounds) and `waqiClient.ts` (outgoing URL, response count). Do not remove or promote to `console.log`.

## Testing

### Unit/component tests (Vitest + jsdom)

Tests live alongside source in `src/**/*.test.ts` and `src/**/*.spec.tsx`. `react-leaflet` is fully mocked in any test that imports map components — see `AirQualityMap.spec.tsx` for the mock pattern. `recharts` is mocked in chart tests.

### E2E tests (Playwright)

All tests use `mockGiosApi(page)` from `tests/e2e/helpers/mockApi.ts` to intercept GIOŚ API calls via `page.route('**/endpoint', ...)`. No real network calls are made. Fixtures are in `tests/e2e/fixtures/`. The `webServer` config in `playwright.config.ts` starts `npm run dev` automatically.

## Deployment

```
clearsky.sundreamsoftware.pl → Nginx (TLS) → 127.0.0.1:5010 → Docker: clearsky-web
```

- `nginx.container.conf` — inside the container (SPA routing + `/api` proxy + `/waqi-api` proxy + `/health`)
- `nginx.server.conf` — on the host (HTTPS termination + reverse proxy to :5010)
- Health check: `GET /health` returns `200 OK`
- CI/CD: `.github/workflows/deploy.yml` — tests → build → GHCR push → SSH deploy + retry health check

### Required GitHub secrets

| Secret | Description |
|---|---|
| `SERVER_HOST` | Server IP or hostname |
| `SERVER_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Private key for SSH access |
| `WAQI_TOKEN` | WAQI API token — injected into container at runtime via `waqi-token.conf` |

### Local environment (`.env.local`)

| Variable | Description |
|---|---|
| `VITE_GIOS_API_BASE_URL` | Always `/api` (proxied) |
| `VITE_WAQI_TOKEN` | WAQI token for dev proxy — get free token at aqicn.org/data-platform/token |
