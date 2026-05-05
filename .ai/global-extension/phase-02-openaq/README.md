# Phase 2 — OpenAQ Global Air Quality

## Goal
Add worldwide air quality stations using the OpenAQ v3 API with viewport-based loading.

## What to do

### New files
- `src/features/air-quality/api/openAq.schemas.ts` — Zod schemas for OpenAQ v3 responses
- `src/features/air-quality/api/openAq.dto.ts` — TypeScript types inferred from schemas
- `src/features/air-quality/api/openAqClient.ts` — HTTP client for OpenAQ v3
- `src/features/air-quality/utils/openAqStationMapper.ts` — maps OpenAQ location DTO → Station
- `src/features/air-quality/utils/openAqMeasurementMapper.ts` — maps OpenAQ measurement DTO → Measurement
- `src/features/air-quality/hooks/useGlobalStations.ts` — TanStack Query hook, bbox param

### OpenAQ v3 key endpoints
- `GET /v3/locations?bbox={minLon},{minLat},{maxLon},{maxLat}&limit=500&page=1`
- `GET /v3/locations/{id}/sensors`
- `GET /v3/sensors/{id}/measurements?limit=100&period_name=hour`

### Station mapping
OpenAQ location → `Station` domain model:
- `id: String(location.id)` (note: OpenAQ uses numeric IDs)
- `source: 'openaq'`
- `country: location.country.code`
- `city: location.locality ?? location.country.name`
- `latitude/longitude` from `location.coordinates`

### `useGlobalStations(bounds)` hook
- `bounds: { minLon, minLat, maxLon, maxLat } | null`
- `enabled: bounds !== null`
- `staleTime: 5 * 60 * 1000`
- `queryKey: ['stations', 'openaq', bounds]`

### Map integration
- `AirQualityMap` gets an `onBoundsChange` callback
- `App.tsx` stores `mapBounds` in state; passes to `useGlobalStations`
- Debounce bounds changes 500ms to avoid request storms
- Merge GIOŚ + OpenAQ stations array; GIOŚ stations take precedence in Poland (filter OpenAQ stations that are within Poland bounding box: lat 49–54.9, lon 14–24.2 to avoid duplicates)

### Environment variable
Add `VITE_OPENAQ_API_KEY` to `.env.example`

## Acceptance criteria
- Global stations visible outside Poland when map viewport moves
- Poland shows GIOŚ stations (OpenAQ stations filtered out in PL bbox)
- `npm run build` clean, `npm test` passes
