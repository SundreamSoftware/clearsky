# Phase 3 — Unified AQI Color Scale

## Goal
Extend `airQualityScale.ts` to support OpenAQ stations (which don't have a pre-computed index), derive AQI level from PM2.5 sensor data, and feed it to map markers for all stations.

## What to do

### Update `airQualityScale.ts`
Add two new functions:
- `pm25ToAqiLevel(pm25: number): AqiLevel` — maps µg/m³ thresholds to 0–5 level
- `usAqiToLevel(aqi: number): AqiLevel` — maps US AQI 0–500 to 0–5 level

PM2.5 thresholds:
- 0–12 → 0, 12–35 → 1, 35–55 → 2, 55–150 → 3, 150–250 → 4, 250+ → 5

### New hook `useOpenAqAqi.ts`
File: `src/features/air-quality/hooks/useOpenAqAqi.ts`

For a selected OpenAQ station, fetch the latest PM2.5 measurement and derive AQI level:
- Find PM2.5 sensor from station sensors (via `openAqClient`)
- Fetch latest measurement value
- Map through `pm25ToAqiLevel`
- Return `{ indexLevel, indexName, colour }`

### Update `StationDetailsPanel` (or `App.tsx`)
When a station is selected and `station.source === 'openaq'`, use `useOpenAqAqi` instead of `useAirQualityIndex`.

### Map marker colors
`StationMarker` already accepts `aqiLevel: number | null`. The parent needs to feed the correct value:
- For GIOŚ stations: use `useAirQualityIndex` (existing)
- For OpenAQ stations: use `useOpenAqAqi` when selected; unselected markers start as gray until data loads

## Acceptance criteria
- GIOŚ station markers color by GIOŚ index level
- OpenAQ station markers color by PM2.5-derived level when data is available
- Gray when no data
- `pm25ToAqiLevel` has unit tests
- `npm run build` clean, `npm test` passes
