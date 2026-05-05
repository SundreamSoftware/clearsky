# ClearSky — Global Extension Plan

## 1. Current State Assumptions

- React + TypeScript + Vite SPA, deployed via Docker + Nginx at `clearsky.sundreamsoftware.pl`
- GIOŚ integration fully working: ~300 Polish stations, paginated v1 API, Zod-validated, mapped to domain models
- Domain models: `Station`, `Sensor`, `Measurement`, `AirQualityIndex`, `Pollutant`
- Single `httpClient` (axios instance) tied to `VITE_GIOS_API_BASE_URL`
- AQI color scale exists (`airQualityScale.ts`) but uses Polish names only
- No weather data, no global stations, no historical range selector
- 83 unit + component tests passing; Playwright E2E suite exists

---

## 2. Target Scope

**MVP additions (this plan):**
- Global air quality map using OpenAQ v3
- Keep GIOŚ for Poland (more granular, national-specific index)
- Unified AQI color scale (green → yellow → orange → red → purple → gray)
- Weather data panel per selected station: temperature, humidity, pressure, wind speed, wind direction
- Historical air quality chart: 24h / 7d range selector
- Historical weather chart: 24h / 7d range selector

**Out of scope for this plan:**
- Authentication / user accounts
- Favorites, comparisons, rankings (future)
- Dark mode (future)
- PWA, SEO optimizations (future)
- Paid APIs

---

## 3. Recommended APIs

| Purpose | API | Auth | Cost |
|---|---|---|---|
| Poland AQ | GIOŚ v1 (`api.gios.gov.pl/pjp-api/v1/rest`) | None | Free |
| Global AQ | OpenAQ v3 (`api.openaq.org/v3`) | API key (free, registration required) | Free tier |
| Weather (current + forecast) | Open-Meteo (`api.open-meteo.com/v1/forecast`) | None | Free |
| Weather (historical) | Open-Meteo Archive (`archive-api.open-meteo.com/v1/archive`) | None | Free |

**Note on OpenAQ v3 API key:**
- Register at https://explore.openaq.org to obtain a free API key
- Passed as `X-API-Key` request header
- Rate limit: 60 requests/minute on free tier
- Key stored in `VITE_OPENAQ_API_KEY` env var

**Note on viewport-based loading:**
OpenAQ has thousands of global stations. Load only stations within the current map viewport using bbox queries:
`GET /v3/locations?bbox={minLon},{minLat},{maxLon},{maxLat}&limit=500`
Re-fetch when map viewport changes (debounced ~500ms).

---

## 4. Updated Domain Model

### `station.types.ts` — add `source` and `country`
```ts
export type StationSource = 'gios' | 'openaq';

export interface Station {
  id: string;          // CHANGED: string to accommodate OpenAQ numeric IDs and GIOŚ numeric IDs uniformly
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  voivodeship: string | null;  // kept, null for non-Polish stations
  country: string | null;      // NEW: ISO country code or name
  source: StationSource;       // NEW: discriminant
}
```

> **Breaking change:** `id` changes from `number` to `string`. All usages (`selectedStationId`, hooks, `queryKey`, mapper) must be updated.

### `weather.types.ts` — new
```ts
export interface Weather {
  latitude: number;
  longitude: number;
  temperature: number;      // °C
  humidity: number;         // %
  pressure: number;         // hPa
  windSpeed: number;        // km/h
  windDirection: number;    // degrees 0-360
  fetchedAt: string;        // ISO timestamp
}

export interface HourlyWeather {
  time: string;             // ISO timestamp
  temperature: number;
  humidity: number;
  windSpeed: number;
}
```

### `airQualityIndex.types.ts` — add `source`
```ts
export interface AirQualityIndex {
  stationId: string;         // CHANGED: string
  indexLevel: number | null; // 0-5 unified scale
  indexName: string | null;
  calculatedAt: string | null;
  sourceDataDate: string | null;
  source: StationSource;     // NEW
}
```

---

## 5. API Provider Architecture

Each provider is isolated. The shared HTTP layer becomes a factory.

```
src/
  shared/
    api/
      createHttpClient.ts         NEW — factory fn: (baseURL, headers?) → httpClient
      httpClient.ts               UPDATED — uses createHttpClient for GIOŚ; kept as named export
      apiError.ts                 unchanged

  features/
    air-quality/
      api/
        giosClient.ts             unchanged
        gios.schemas.ts           unchanged
        gios.dto.ts               unchanged
        openAqClient.ts           NEW
        openAq.schemas.ts         NEW
        openAq.dto.ts             NEW

    weather/
      api/
        openMeteoClient.ts        NEW
        openMeteo.schemas.ts      NEW
        openMeteo.dto.ts          NEW
      model/
        weather.types.ts          NEW
      utils/
        weatherMapper.ts          NEW
      hooks/
        useWeather.ts             NEW
        useHistoricalWeather.ts   NEW
      components/
        WeatherPanel.tsx          NEW
        WeatherCard.tsx           NEW
        WeatherHistoryChart.tsx   NEW
```

### `createHttpClient.ts`
```ts
export function createHttpClient(baseURL: string, headers?: Record<string, string>) {
  const instance = axios.create({ baseURL, timeout: 10_000, headers });
  // attach error interceptor (same logic as current httpClient)
  return { get<T>(url: string): Promise<T> { ... } };
}
```

### `openAqClient.ts`
```ts
const client = createHttpClient('https://api.openaq.org/v3', {
  'X-API-Key': import.meta.env.VITE_OPENAQ_API_KEY,
});

export const openAqClient = {
  async getLocationsByBbox(bbox: BBox): Promise<OpenAqLocationDto[]>
  async getSensors(locationId: number): Promise<OpenAqSensorDto[]>
  async getMeasurements(sensorId: number, dateFrom: string, dateTo: string): Promise<OpenAqMeasurementDto[]>
};
```

### `openMeteoClient.ts`
```ts
const forecastClient = createHttpClient('https://api.open-meteo.com/v1');
const archiveClient  = createHttpClient('https://archive-api.open-meteo.com/v1');

export const openMeteoClient = {
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherDto>
  async getHourlyForecast(lat: number, lon: number): Promise<HourlyWeatherDto>
  async getHistoricalWeather(lat: number, lon: number, dateFrom: string, dateTo: string): Promise<HourlyWeatherDto>
};
```

**CORS for OpenAQ and Open-Meteo:**
- Open-Meteo: CORS is open, direct browser calls work fine
- OpenAQ: CORS is open for browser calls; no proxy needed
- GIOŚ: still requires proxy (`/api/*`)

---

## 6. Air Quality Color Scale

Extend `airQualityScale.ts` to support a universal 6-band scale that works for both GIOŚ and OpenAQ:

| Level | Label | Color | GIOŚ index | US AQI equiv |
|---|---|---|---|---|
| 0 | Very Good | `#00C853` (green) | 0 | 0–50 |
| 1 | Good | `#64DD17` (light green) | 1 | 51–100 |
| 2 | Moderate | `#FFD600` (yellow) | 2 | 101–150 |
| 3 | Poor | `#FF6D00` (orange) | 3 | 151–200 |
| 4 | Bad | `#D50000` (red) | 4 | 201–300 |
| 5 | Hazardous | `#880E4F` (purple) | 5 | 301+ |

For OpenAQ, derive level from PM2.5 µg/m³ (most widely available sensor):
- 0–12: level 0
- 12–35: level 1
- 35–55: level 2
- 55–150: level 3
- 150–250: level 4
- 250+: level 5

Add `pm25ToAqiLevel(pm25: number): AqiLevel` to `airQualityScale.ts`.
Add `usAqiToLevel(aqi: number): AqiLevel` for US AQI if available.

---

## 7. Weather Data Integration Plan

**Source:** Open-Meteo `forecast` endpoint — completely free, no auth, CORS-open.

**API call:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m
  &hourly=temperature_2m,relative_humidity_2m,wind_speed_10m
  &forecast_days=1
  &wind_speed_unit=kmh
```

**Hook:** `useWeather(lat, lon)` — enabled when a station is selected; cached 15 minutes.

**Component:** `WeatherPanel` — shown inside `StationDetailsPanel` below pollutant cards.

---

## 8. Historical Data Integration Plan

### Air quality history
- **Source:** OpenAQ sensors measurements endpoint with date range
- **For GIOŚ stations:** GIOŚ only returns 24–48 data points in a single call; use existing measurement data with a "last 24h" label
- **Range selector:** 24h (default) | 7d
- **Component:** update existing `PollutantChart` to accept `range: '24h' | '7d'` prop and render appropriate data

### Weather history
- **Source:** Open-Meteo archive (`archive-api.open-meteo.com/v1/archive`)
- `?latitude=&longitude=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&hourly=temperature_2m,...`
- **Range selector:** 24h | 7d
- **Component:** `WeatherHistoryChart` — reuse Recharts `<LineChart>` pattern from `PollutantChart`

---

## 9. UI/UX Changes

| Area | Change |
|---|---|
| Map | Show both GIOŚ + OpenAQ stations; OpenAQ loaded per viewport; "Poland" badge on GIOŚ markers |
| Map markers | Color from unified AQI scale (already partially done; ensure OpenAQ data feeds it) |
| StationDetailsPanel | Add `WeatherPanel` section below pollutant cards |
| PollutantChart | Add 24h / 7d range toggle tabs |
| Header | Add global/Poland toggle or note about data sources |
| Env example | Add `VITE_OPENAQ_API_KEY` |

---

## 10. Component Changes

| Component | Change |
|---|---|
| `StationMarker` | `station.id` is now `string`; color already driven by `aqiLevel` — no logic change |
| `StationSearch` | `station.id` is now `string`; add `station.country` badge for non-Polish stations |
| `StationDetailsPanel` | Add `<WeatherPanel>` section; pass `station.latitude/longitude` |
| `PollutantChart` | Add range selector (24h / 7d); accept `range` prop |
| `AirQualityMap` | Accept OpenAQ stations; debounced `onBoundsChange` callback for viewport loading |
| `App.tsx` | Wire `useGlobalStations(bounds)` hook; merge with `useStations()` for Poland |

New components:
- `WeatherPanel` — shows current weather cards
- `WeatherCard` — single weather metric (temp, humidity, etc.)
- `WeatherHistoryChart` — 24h/7d line chart for weather

---

## 11. State Management and Caching Strategy

| Data | Query key | Stale time | Notes |
|---|---|---|---|
| GIOŚ stations | `['stations', 'gios']` | 10 min | All ~300 stations at app load |
| OpenAQ stations (viewport) | `['stations', 'openaq', bbox]` | 5 min | Refetch on significant viewport change |
| GIOŚ AQI | `['aqindex', 'gios', stationId]` | 5 min | On station select only |
| OpenAQ sensors | `['sensors', 'openaq', locationId]` | 10 min | On station select |
| OpenAQ measurements | `['measurements', 'openaq', sensorId, range]` | 5 min | On sensor select |
| Current weather | `['weather', lat, lon]` | 15 min | On station select |
| Historical weather | `['weather-history', lat, lon, dateFrom, dateTo]` | 30 min | On range change |

---

## 12. Testing Strategy

### Unit tests (Vitest)
- `openAqStationMapper.test.ts` — maps OpenAQ location DTO → Station
- `openAqMeasurementMapper.test.ts` — maps OpenAQ measurement DTO → Measurement
- `weatherMapper.test.ts` — maps Open-Meteo DTO → Weather
- `airQualityScale.test.ts` — add `pm25ToAqiLevel` tests
- `openAqClient.test.ts` — Zod parse fails on wrong shape (same pattern as giosClient.test.ts)

### Component tests (React Testing Library)
- `WeatherPanel.spec.tsx` — renders weather data; shows loading state
- `PollutantChart.spec.tsx` — update to test range selector tabs

### E2E (Playwright)
- `global-stations.spec.ts` — map loads global stations when viewport is outside Poland
- `weather-panel.spec.ts` — selecting a station shows weather data

---

## 13. Implementation Phases

### Phase 1 — Foundation refactor
- `createHttpClient.ts` factory
- Update `httpClient.ts` to use factory
- `Station.id: number → string` migration (all usages)
- Add `source` + `country` to Station model
- Update GIOŚ mapper to set `source: 'gios'`

### Phase 2 — OpenAQ global air quality
- OpenAQ Zod schemas + DTOs + client
- `openAqStationMapper.ts` + `openAqMeasurementMapper.ts`
- `useGlobalStations(bbox)` hook (viewport-based)
- Merge GIOŚ + OpenAQ stations in `App.tsx`
- Map `onBoundsChange` callback

### Phase 3 — Unified AQI color scale
- Add `pm25ToAqiLevel` and `usAqiToLevel` to `airQualityScale.ts`
- `useOpenAqAqi(locationId)` hook — derives AQI level from latest PM2.5 sensor
- Feed AQI level to `StationMarker` for OpenAQ stations

### Phase 4 — Weather integration
- `openMeteoClient.ts` + schemas + DTOs
- `weatherMapper.ts`
- `useWeather(lat, lon)` hook
- `WeatherCard.tsx` + `WeatherPanel.tsx`
- Wire into `StationDetailsPanel`

### Phase 5 — Historical data
- `useHistoricalWeather(lat, lon, range)` hook
- `WeatherHistoryChart.tsx`
- Update `PollutantChart` with 24h / 7d range tabs
- Wire OpenAQ historical measurements into range selector

### Phase 6 — Tests, polish, deployment
- Unit tests for new mappers and scale functions
- Component tests for `WeatherPanel` and updated `PollutantChart`
- E2E tests
- Update `README.md` with new env vars and architecture
- Update `.env.example` with `VITE_OPENAQ_API_KEY`
- Docker/Nginx: Open-Meteo + OpenAQ need no proxy (CORS open); confirm in deployment

---

## 14. Acceptance Criteria

- [ ] Map shows OpenAQ stations globally when viewport is outside Poland
- [ ] Map shows GIOŚ stations when in Poland view (they may overlap with OpenAQ PL stations — prefer GIOŚ for Poland)
- [ ] Station markers are colored by AQI level using the 6-color scale
- [ ] Unknown/missing AQI renders gray
- [ ] Selecting any station shows weather panel with: temperature, humidity, pressure, wind speed, wind direction
- [ ] Pollutant chart has 24h / 7d range selector
- [ ] Weather history chart has 24h / 7d range selector
- [ ] All new mappers have unit tests
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm test` passes (83+ tests)

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| OpenAQ API key required | Document in README + `.env.example`; app degrades gracefully if key is missing (shows only GIOŚ stations) |
| OpenAQ rate limiting (60 req/min) | Debounce viewport changes (500ms); aggressive TanStack Query caching |
| Thousands of OpenAQ stations in viewport | `limit=500` per bbox query; cluster markers at low zoom levels (optional, Phase 6 future) |
| `Station.id: number → string` breaking change | Do the migration atomically in Phase 1; TypeScript will catch all usages |
| Open-Meteo archive vs forecast base URLs differ | Two separate axios instances in `openMeteoClient.ts` |
| GIOŚ + OpenAQ duplicate stations in Poland | Filter: when both cover same area, show GIOŚ stations only within Poland bounding box |
