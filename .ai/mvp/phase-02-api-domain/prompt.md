# Phase 02 — API & Domain Layer Implementation Prompt

You are a senior TypeScript engineer implementing the data layer for **ClearSky**, an air quality dashboard for Poland.

Phase 01 (scaffolding) is already complete. The project has the full folder structure, Tailwind, TanStack Query, Zod, and Axios installed.

## Your Task

Implement the complete data layer as described in `readme.md` in this folder. This includes:

1. HTTP client with error handling
2. Zod schemas for all GIOŚ API responses
3. TypeScript DTO types inferred from Zod schemas
4. GIOŚ API client using those schemas
5. Domain model TypeScript interfaces
6. DTO-to-domain mapper functions
7. TanStack Query hooks
8. Utility functions (AQI scale, station filter, measurement formatter, date/number utils)
9. All unit tests listed in the readme

## GIOŚ API Reference

Base URL: `https://api.gios.gov.pl/pjp-api/rest`

Endpoints:
- `GET /station/findAll` — returns array of station objects
- `GET /station/sensors/{stationId}` — returns array of sensor objects
- `GET /data/getData/{sensorId}` — returns `{ key: string, values: [{ date, value }] }`
- `GET /aqindex/getIndex/{stationId}` — returns AQI object

Sample station response item:
```json
{
  "id": 114,
  "stationName": "Warszawa-Komunikacyjna",
  "gegrLat": "52.219464",
  "gegrLon": "21.006232",
  "city": { "id": 1, "name": "Warszawa", "commune": { "provinceName": "MAZOWIECKIE" } },
  "addressStreet": "ul. Sikorskiego"
}
```

Sample AQI response:
```json
{
  "id": 114,
  "stCalcDate": "2024-05-04 12:00:00",
  "stIndexLevel": { "id": 1, "indexLevelName": "Dobry" },
  "stSourceDataDate": "2024-05-04 11:00:00"
}
```

## Hard Constraints

1. **Do NOT use raw DTO types in any component or hook return type** — always map to domain models first.
2. Use `z.safeParse()` defensively where array items may be malformed; log warnings but do not crash.
3. The `httpClient` must throw `ApiRequestError` (not generic `Error`) on non-2xx responses.
4. All mapper functions must be pure (no side effects, no API calls).
5. Hooks must use `enabled: false` guard when IDs are null (to avoid unnecessary requests).
6. `VITE_GIOS_API_BASE_URL` must be read from `import.meta.env`.

## File Locations

- `src/shared/api/httpClient.ts`
- `src/shared/api/apiError.ts`
- `src/features/air-quality/api/gios.schemas.ts`
- `src/features/air-quality/api/gios.dto.ts`
- `src/features/air-quality/api/giosClient.ts`
- `src/features/air-quality/model/*.types.ts`
- `src/features/air-quality/utils/stationMapper.ts`
- `src/features/air-quality/utils/sensorMapper.ts`
- `src/features/air-quality/utils/measurementMapper.ts`
- `src/features/air-quality/utils/airQualityIndexMapper.ts`
- `src/features/air-quality/utils/airQualityScale.ts`
- `src/features/air-quality/utils/stationFilters.ts`
- `src/features/air-quality/utils/measurementFormatter.ts`
- `src/shared/utils/dateTime.ts`
- `src/shared/utils/number.ts`
- `src/features/air-quality/hooks/useStations.ts`
- `src/features/air-quality/hooks/useStationSensors.ts`
- `src/features/air-quality/hooks/useSensorMeasurements.ts`
- `src/features/air-quality/hooks/useAirQualityIndex.ts`

## Test Files

Write all unit tests described in `readme.md`. Use Vitest `describe`/`it`/`expect`.

## Verification

After implementation:
1. Run `npm run test` — all unit tests must pass
2. Run `npm run build` — zero TypeScript errors
3. Manually verify: update `App.tsx` temporarily to call `useStations()` and `console.log` the result. Check the browser console shows mapped `Station[]` objects. Revert this temporary change after verification.
