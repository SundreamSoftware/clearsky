Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 3: Unified AQI Color Scale.

## Context
- Phases 1 and 2 are complete: `Station` has `source: 'gios' | 'openaq'`, OpenAQ stations load globally
- GIOŚ stations get their AQI level from `useAirQualityIndex` (returns 0–5)
- OpenAQ stations currently show gray markers (no AQI data fed yet)
- `airQualityScale.ts` has GIOŚ-specific levels 0–5

## What to implement

### 1. Update `src/features/air-quality/utils/airQualityScale.ts`
Add:
```ts
export function pm25ToAqiLevel(pm25: number): AqiLevel {
  if (pm25 <= 12) return 0;
  if (pm25 <= 35) return 1;
  if (pm25 <= 55) return 2;
  if (pm25 <= 150) return 3;
  if (pm25 <= 250) return 4;
  return 5;
}

export function usAqiToLevel(aqi: number): AqiLevel {
  if (aqi <= 50) return 0;
  if (aqi <= 100) return 1;
  if (aqi <= 150) return 2;
  if (aqi <= 200) return 3;
  if (aqi <= 300) return 4;
  return 5;
}
```

### 2. Create `src/features/air-quality/hooks/useOpenAqAqi.ts`
```ts
export function useOpenAqAqi(station: Station | null) {
  return useQuery({
    queryKey: ['aqindex', 'openaq', station?.id],
    queryFn: async () => {
      // Find the PM2.5 sensor from the station's sensor list
      // station.sensors is NOT on the domain model — call openAqClient.getLocationsByBbox or
      // use a separate sensors endpoint.
      // Simpler approach: station has sensors embedded in OpenAQ location DTO.
      // Store sensor IDs on the station or fetch from /v3/locations/{id}/sensors.
      // Then call openAqClient.getLatestMeasurements(pm25SensorId) → first result value
      // → pm25ToAqiLevel(value) → return { indexLevel, indexName, colour }
    },
    enabled: station !== null && station.source === 'openaq',
    staleTime: 5 * 60 * 1000,
  });
}
```

**Implementation note:** To avoid a second round-trip, extend the `Station` model with an optional `sensorIds?: { pm25?: number }` field populated in `openAqStationMapper.ts` from the embedded sensors array in the location DTO. Then `useOpenAqAqi` can directly call `getLatestMeasurements(station.sensorIds.pm25)`.

Update `openAqStationMapper.ts` to populate this field.
Update `station.types.ts` to add `sensorIds?: { pm25?: number }`.

### 3. Wire AQI into `App.tsx` / `StationDetailsPanel`
The `StationMarker` already accepts `aqiLevel: number | null`. Currently `App.tsx` passes `null` to all markers. 

For the **selected station only**, fetch AQI and pass it. For unselected stations, keep `null` (gray). This avoids N requests for all markers.

In `App.tsx`:
- `const { data: giosAqi } = useAirQualityIndex(selectedStation?.source === 'gios' ? selectedStation.id : null)`
- `const { data: openAqAqi } = useOpenAqAqi(selectedStation?.source === 'openaq' ? selectedStation : null)`
- Derive `selectedAqiLevel = giosAqi?.indexLevel ?? openAqAqi?.indexLevel ?? null`
- Pass to the marker: update `AirQualityMap` to accept `selectedAqiLevel: number | null` and apply it to the selected station's `StationMarker`

### 4. Update unit tests in `airQualityScale.test.ts`
Add tests:
- `pm25ToAqiLevel(10)` → `0`
- `pm25ToAqiLevel(20)` → `1`
- `pm25ToAqiLevel(45)` → `2`
- `pm25ToAqiLevel(100)` → `3`
- `pm25ToAqiLevel(200)` → `4`
- `pm25ToAqiLevel(300)` → `5`
- `usAqiToLevel(25)` → `0`
- `usAqiToLevel(75)` → `1`

## Constraints
- Do not fetch AQI for all map markers — only for the selected station
- Strict TypeScript throughout
- One commit per changed file
- Run `npm run build` and `npm test` after all changes
- Push to `SundreamSoftware/clearsky` main
