Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 2 of the global extension plan: OpenAQ Global Air Quality integration.

## Context
- Repository: SundreamSoftware/clearsky
- Phase 1 has been completed: `Station.id` is now `string`, `Station.source` and `Station.country` exist, `createHttpClient` factory exists
- The map currently shows ~300 Polish GIOŚ stations
- OpenAQ v3 API requires `X-API-Key` header; key from `VITE_OPENAQ_API_KEY` env var
- OpenAQ v3 base URL: `https://api.openaq.org/v3`

## OpenAQ v3 API response shapes

### `GET /v3/locations?bbox={minLon},{minLat},{maxLon},{maxLat}&limit=500`
```json
{
  "meta": { "found": 1200, "page": 1, "limit": 500 },
  "results": [
    {
      "id": 2178,
      "name": "Station name",
      "locality": "Berlin",
      "country": { "id": "DE", "name": "Germany" },
      "coordinates": { "latitude": 52.5, "longitude": 13.4 },
      "sensors": [{ "id": 5001, "name": "PM2.5", "parameter": { "name": "pm25", "displayName": "PM2.5", "units": "µg/m³" } }]
    }
  ]
}
```

### `GET /v3/sensors/{id}/measurements?limit=1&period_name=hour`
```json
{
  "results": [
    {
      "value": 12.5,
      "period": { "datetimeFrom": { "utc": "2024-05-04T11:00:00Z" }, "datetimeTo": { "utc": "2024-05-04T12:00:00Z" } },
      "parameter": { "name": "pm25", "displayName": "PM2.5", "units": "µg/m³" }
    }
  ]
}
```

## What to implement

### 1. `src/features/air-quality/api/openAq.schemas.ts`
Zod schemas for the two responses above. Make fields `.nullable().optional()` where appropriate.
Schema names: `OpenAqLocationPageSchema`, `OpenAqLocationSchema`, `OpenAqSensorSchema`, `OpenAqMeasurementPageSchema`, `OpenAqMeasurementSchema`.

### 2. `src/features/air-quality/api/openAq.dto.ts`
TypeScript types inferred with `z.infer<>` from the schemas.

### 3. `src/features/air-quality/api/openAqClient.ts`
Use `createHttpClient('https://api.openaq.org/v3', { 'X-API-Key': import.meta.env.VITE_OPENAQ_API_KEY })`.

Exports:
```ts
export const openAqClient = {
  async getLocationsByBbox(bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number }): Promise<OpenAqLocationDto[]>
  async getLatestMeasurements(sensorId: number): Promise<OpenAqMeasurementDto[]>
};
```

For `getLocationsByBbox`: fetch page 1 only (limit=500). Parse with `OpenAqLocationPageSchema`, return `results`.
If `VITE_OPENAQ_API_KEY` is undefined or empty, return an empty array (graceful degradation).

### 4. `src/features/air-quality/utils/openAqStationMapper.ts`
```ts
export function mapOpenAqLocationToStation(dto: OpenAqLocationDto): Station
export function mapOpenAqLocationsToStations(dtos: OpenAqLocationDto[]): Station[]
```
Mapping:
- `id: String(dto.id)`
- `name: dto.name`
- `city: dto.locality ?? dto.country.name`
- `address: ''`
- `latitude: dto.coordinates.latitude`
- `longitude: dto.coordinates.longitude`
- `voivodeship: null`
- `country: dto.country.id`
- `source: 'openaq'`

### 5. `src/features/air-quality/utils/openAqMeasurementMapper.ts`
```ts
export function mapOpenAqMeasurements(dtos: OpenAqMeasurementDto[], sensorId: number): Measurement[]
```

### 6. `src/features/air-quality/hooks/useGlobalStations.ts`
```ts
export type MapBounds = { minLon: number; minLat: number; maxLon: number; maxLat: number };

export function useGlobalStations(bounds: MapBounds | null) {
  return useQuery({
    queryKey: ['stations', 'openaq', bounds],
    queryFn: async () => {
      const dtos = await openAqClient.getLocationsByBbox(bounds!);
      return mapOpenAqLocationsToStations(dtos);
    },
    enabled: bounds !== null,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 7. Update `src/features/air-quality/components/AirQualityMap.tsx`
Add `onBoundsChange?: (bounds: MapBounds) => void` prop.
Inside `MapController`, use `useMapEvents` to listen to `moveend` and call `onBoundsChange` with current bounds.
Use `map.getBounds()` → convert to `MapBounds`.

### 8. Update `src/app/App.tsx`
- Import `useGlobalStations` and `MapBounds`
- Add `const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)`
- Add debounced `handleBoundsChange` (500ms, use `useRef` + `setTimeout` pattern)
- Pass to `AirQualityMap` as `onBoundsChange={handleBoundsChange}`
- Get `globalStations = useGlobalStations(mapBounds).data ?? []`
- Define Poland bounding box constant: `{ minLon: 14.1, minLat: 49.0, maxLon: 24.2, maxLat: 54.9 }`
- Filter: exclude OpenAQ stations that fall inside the Poland bbox (avoid duplicates with GIOŚ)
- Merge `[...giosStations, ...filteredGlobalStations]` and pass to map

### 9. Add `VITE_OPENAQ_API_KEY` to `.env.example`

## Constraints
- Graceful degradation: if OpenAQ key is missing, only GIOŚ stations show (no errors thrown to UI)
- Strict TypeScript throughout
- One commit per changed file
- Run `npm run build` and `npm test` after all changes
- Push to `SundreamSoftware/clearsky` main
