# Phase 02 — API Integration & Domain Layer

## Goal

Implement the complete data layer: HTTP client, GIOŚ API client, Zod schemas, DTOs, domain models, DTO-to-domain mappers, error handling, and TanStack Query hooks.

After this phase the developer can call the GIOŚ API and get typed, validated domain objects back through React hooks — with no raw API types leaking into the UI layer.

---

## What Needs to Be Done

### 1. HTTP Client (`src/shared/api/httpClient.ts`)

A thin wrapper around `axios` (or `fetch`) that:
- Accepts a base URL from environment variable
- Throws `ApiError` on non-2xx responses
- Includes a timeout (e.g. 10 seconds)
- Exports a `get<T>(url: string): Promise<T>` function

```ts
// Usage example
const data = await httpClient.get<StationDto[]>('/station/findAll');
```

### 2. ApiError (`src/shared/api/apiError.ts`)

```ts
export interface ApiError {
  message: string;
  statusCode: number | null;
  endpoint: string;
}

export class ApiRequestError extends Error implements ApiError {
  statusCode: number | null;
  endpoint: string;
  constructor(message: string, statusCode: number | null, endpoint: string) { ... }
}
```

### 3. GIOŚ Zod Schemas (`src/features/air-quality/api/gios.schemas.ts`)

Define Zod schemas that validate the raw GIOŚ API responses.

Required schemas:

#### Station
```ts
const StationCitySchema = z.object({
  id: z.number(),
  name: z.string(),
  commune: z.object({
    provinceName: z.string().nullable().optional(),
  }).optional(),
});

const StationDtoSchema = z.object({
  id: z.number(),
  stationName: z.string(),
  gegrLat: z.string(),
  gegrLon: z.string(),
  city: StationCitySchema.nullable().optional(),
  addressStreet: z.string().nullable().optional(),
});

const StationListDtoSchema = z.array(StationDtoSchema);
```

#### Sensor
```ts
const SensorParamSchema = z.object({
  paramCode: z.string(),
  paramName: z.string(),
  paramFormula: z.string().nullable().optional(),
  idParam: z.number(),
});

const SensorDtoSchema = z.object({
  id: z.number(),
  stationId: z.number(),
  param: SensorParamSchema,
});

const SensorListDtoSchema = z.array(SensorDtoSchema);
```

#### Measurement
```ts
const MeasurementValueSchema = z.object({
  date: z.string(),
  value: z.number().nullable(),
});

const MeasurementsDtoSchema = z.object({
  key: z.string(),
  values: z.array(MeasurementValueSchema),
});
```

#### AQI
```ts
const AqiLevelSchema = z.object({
  id: z.number().nullable(),
  indexLevelName: z.string().nullable(),
}).nullable();

const AqiDtoSchema = z.object({
  id: z.number(),
  stCalcDate: z.string().nullable(),
  stIndexLevel: AqiLevelSchema.optional(),
  stSourceDataDate: z.string().nullable().optional(),
});
```

### 4. DTOs (`src/features/air-quality/api/gios.dto.ts`)

Infer TypeScript types from the Zod schemas:
```ts
export type StationDto = z.infer<typeof StationDtoSchema>;
export type SensorDto = z.infer<typeof SensorDtoSchema>;
export type MeasurementsDto = z.infer<typeof MeasurementsDtoSchema>;
export type AqiDto = z.infer<typeof AqiDtoSchema>;
```

### 5. GIOŚ API Client (`src/features/air-quality/api/giosClient.ts`)

```ts
export const giosClient = {
  getStations(): Promise<StationDto[]>
  getSensors(stationId: number): Promise<SensorDto[]>
  getMeasurements(sensorId: number): Promise<MeasurementsDto>
  getAirQualityIndex(stationId: number): Promise<AqiDto>
}
```

Each method:
1. Calls `httpClient.get(endpoint)`
2. Validates with `.parse()` using the relevant Zod schema
3. Returns the validated DTO

### 6. Domain Models (`src/features/air-quality/model/`)

Create TypeScript interfaces as defined in the data model section of `plan.md`:
- `station.types.ts` → `Station`
- `sensor.types.ts` → `Sensor`
- `measurement.types.ts` → `Measurement`
- `airQualityIndex.types.ts` → `AirQualityIndex`
- `pollutant.types.ts` → `Pollutant`

### 7. Mappers (`src/features/air-quality/utils/`)

Each mapper is a **pure function** that converts a DTO to a domain model.

#### `stationMapper.ts`
```ts
export function mapStationDto(dto: StationDto): Station {
  return {
    id: dto.id,
    name: dto.stationName,
    city: dto.city?.name ?? 'Unknown',
    address: dto.addressStreet ?? '',
    latitude: parseFloat(dto.gegrLat),
    longitude: parseFloat(dto.gegrLon),
    voivodeship: dto.city?.commune?.provinceName ?? null,
  };
}

export function mapStationListDto(dtos: StationDto[]): Station[] {
  return dtos.map(mapStationDto);
}
```

#### `sensorMapper.ts`
```ts
export function mapSensorDto(dto: SensorDto): Sensor {
  return {
    id: dto.id,
    stationId: dto.stationId,
    parameterCode: dto.param.paramCode,
    parameterName: dto.param.paramName,
    unit: resolveUnit(dto.param.paramCode), // see note
  };
}
```

Note: GIOŚ API does not always return units — use a lookup map:
```ts
const UNIT_MAP: Record<string, string> = {
  'PM2.5': 'µg/m³',
  'PM10': 'µg/m³',
  'NO2': 'µg/m³',
  'O3': 'µg/m³',
  'SO2': 'µg/m³',
  'CO': 'mg/m³',
};
```

#### `measurementMapper.ts`
```ts
export function mapMeasurementsDto(dto: MeasurementsDto, sensorId: number): Measurement[] {
  return dto.values
    .filter(v => v.value !== null)
    .map(v => ({
      sensorId,
      date: v.date,
      value: v.value,
      unit: resolveUnitFromKey(dto.key),
    }));
}
```

#### `airQualityIndexMapper.ts`
```ts
export function mapAqiDto(dto: AqiDto): AirQualityIndex {
  return {
    stationId: dto.id,
    indexLevel: dto.stIndexLevel?.id ?? null,
    indexName: dto.stIndexLevel?.indexLevelName ?? null,
    calculatedAt: dto.stCalcDate,
    sourceDataDate: dto.stSourceDataDate ?? null,
  };
}
```

### 8. Air Quality Scale Utility (`src/features/air-quality/utils/airQualityScale.ts`)

```ts
export type AqiLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const AQI_SCALE: Record<AqiLevel, { name: string; colour: string }> = {
  0: { name: 'Bardzo dobry', colour: '#00C853' },
  1: { name: 'Dobry',        colour: '#64DD17' },
  2: { name: 'Umiarkowany',  colour: '#FFD600' },
  3: { name: 'Dostateczny',  colour: '#FF6D00' },
  4: { name: 'Zły',          colour: '#D50000' },
  5: { name: 'Bardzo zły',   colour: '#880E4F' },
};

export const UNKNOWN_AQI = { name: 'Brak danych', colour: '#9E9E9E' };

export function getAqiInfo(level: number | null): { name: string; colour: string } {
  if (level === null || !(level in AQI_SCALE)) return UNKNOWN_AQI;
  return AQI_SCALE[level as AqiLevel];
}
```

### 9. TanStack Query Hooks (`src/features/air-quality/hooks/`)

Configure the `QueryClient` in `src/app/providers.tsx` with global defaults:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});
```

#### `useStations.ts`
```ts
export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const dtos = await giosClient.getStations();
      return mapStationListDto(dtos);
    },
    staleTime: 10 * 60 * 1000,
  });
}
```

#### `useStationSensors.ts`
```ts
export function useStationSensors(stationId: number | null) {
  return useQuery({
    queryKey: ['sensors', stationId],
    queryFn: async () => {
      const dtos = await giosClient.getSensors(stationId!);
      return mapSensorListDto(dtos, stationId!);
    },
    enabled: stationId !== null,
    staleTime: 10 * 60 * 1000,
  });
}
```

#### `useSensorMeasurements.ts`
```ts
export function useSensorMeasurements(sensorId: number | null) {
  return useQuery({
    queryKey: ['measurements', sensorId],
    queryFn: async () => {
      const dto = await giosClient.getMeasurements(sensorId!);
      return mapMeasurementsDto(dto, sensorId!);
    },
    enabled: sensorId !== null,
    staleTime: 2 * 60 * 1000,
  });
}
```

#### `useAirQualityIndex.ts`
```ts
export function useAirQualityIndex(stationId: number | null) {
  return useQuery({
    queryKey: ['aqindex', stationId],
    queryFn: async () => {
      const dto = await giosClient.getAirQualityIndex(stationId!);
      return mapAqiDto(dto);
    },
    enabled: stationId !== null,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 10. Other Utilities

#### `src/features/air-quality/utils/measurementFormatter.ts`
```ts
export function formatMeasurementValue(value: number | null, unit: string): string
export function formatDate(isoString: string): string
```

#### `src/features/air-quality/utils/stationFilters.ts`
```ts
export function filterStations(stations: Station[], query: string): Station[]
```

Case-insensitive, matches `station.name` and `station.city`.

#### `src/shared/utils/dateTime.ts`
```ts
export function formatDateTime(isoString: string): string // uses date-fns
export function formatDate(isoString: string): string
```

#### `src/shared/utils/number.ts`
```ts
export function formatNumber(value: number, decimals?: number): string
```

---

## Tests to Write in This Phase

### Unit Tests

All test files go in `src/features/air-quality/utils/` alongside the source files (or in `tests/unit/`).

#### `airQualityScale.test.ts`
```ts
describe('getAqiInfo', () => {
  it('returns correct colour for level 0', ...)
  it('returns correct colour for level 5', ...)
  it('returns UNKNOWN_AQI for null', ...)
  it('returns UNKNOWN_AQI for out-of-range value', ...)
})
```

#### `stationFilters.test.ts`
```ts
describe('filterStations', () => {
  it('filters by city name (case-insensitive)', ...)
  it('filters by station name', ...)
  it('returns all stations when query is empty', ...)
  it('returns empty array when no match', ...)
})
```

#### `measurementFormatter.test.ts`
```ts
describe('formatMeasurementValue', () => {
  it('formats value with unit', ...)
  it('returns dash for null value', ...)
})
```

#### `stationMapper.test.ts`
```ts
describe('mapStationDto', () => {
  it('maps id correctly', ...)
  it('parses latitude as float', ...)
  it('parses longitude as float', ...)
  it('uses city name from dto', ...)
  it('falls back to empty string for missing address', ...)
  it('extracts voivodeship from commune.provinceName', ...)
  it('sets voivodeship to null when commune is missing', ...)
})
```

#### `sensorMapper.test.ts`
```ts
describe('mapSensorDto', () => {
  it('maps id and stationId', ...)
  it('resolves unit from paramCode', ...)
  it('falls back to empty string for unknown paramCode', ...)
})
```

#### `measurementMapper.test.ts`
```ts
describe('mapMeasurementsDto', () => {
  it('maps non-null values', ...)
  it('filters out null values', ...)
  it('sets sensorId correctly', ...)
})
```

#### `airQualityIndexMapper.test.ts`
```ts
describe('mapAqiDto', () => {
  it('maps indexLevel from stIndexLevel.id', ...)
  it('sets indexLevel to null when stIndexLevel is null', ...)
  it('maps indexName from stIndexLevel.indexLevelName', ...)
  it('maps calculatedAt from stCalcDate', ...)
})
```

---

## Acceptance Criteria for Phase 02

- [ ] `httpClient.get()` can fetch from GIOŚ API in a browser (verify with dev tools)
- [ ] All Zod schemas validate real GIOŚ API responses without errors
- [ ] All mappers produce correct domain objects (verified by unit tests)
- [ ] All four hooks are usable and return typed data
- [ ] `npm run test` passes all unit tests for this phase
- [ ] Zero TypeScript errors
- [ ] No raw DTO types used outside the `api/` directory
