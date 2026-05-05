Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 1 of the global extension plan: Foundation Refactor.

## Context
- Repository: SundreamSoftware/clearsky
- Stack: React 18, TypeScript (strict), Vite, TanStack Query, Zod, Tailwind, React Leaflet, Vitest
- The codebase has a single axios client in `src/shared/api/httpClient.ts` tied to one baseURL
- The `Station` domain model uses `id: number`
- There are 83 passing unit + component tests

## What to implement

### 1. Create `src/shared/api/createHttpClient.ts`
A factory function:
```ts
export function createHttpClient(baseURL: string, headers?: Record<string, string>)
  : { get<T>(url: string): Promise<T> }
```
Move the axios instance creation and error interceptor (currently in httpClient.ts) into this factory. The interceptor should throw `ApiRequestError` on non-2xx responses.

### 2. Refactor `src/shared/api/httpClient.ts`
Use `createHttpClient(import.meta.env.VITE_GIOS_API_BASE_URL, {})` internally. Keep the same exported shape so all existing GIOŚ code is unaffected.

### 3. Update domain models
- `src/features/air-quality/model/station.types.ts`:
  - Change `id: number` → `id: string`
  - Add `source: StationSource` where `StationSource = 'gios' | 'openaq'`
  - Add `country: string | null`
- `src/features/air-quality/model/airQualityIndex.types.ts`:
  - Change `stationId: number` → `stationId: string`

### 4. Update mappers
- `src/features/air-quality/utils/stationMapper.ts`:
  - `id: String(dto['Identyfikator stacji'])`
  - `source: 'gios'`
  - `country: 'PL'`
- `src/features/air-quality/utils/airQualityIndexMapper.ts`:
  - `stationId: String(dto['AqIndex']['Identyfikator stacji pomiarowej'])`

### 5. Fix all TypeScript usages
Update every file that references `station.id`, `selectedStationId`, or `stationId` as number:
- `src/app/App.tsx`: `selectedStationId: string | null`
- All hooks: `useAirQualityIndex`, `useStationSensors`, `useSensorMeasurements` — update param types
- `src/features/air-quality/components/StationMarker.tsx`, `StationSearch.tsx`, `StationDetailsPanel.tsx`, `AirQualityMap.tsx`

### 6. Update unit tests
- `stationMapper.test.ts`: expect `id` to be `'114'` (string), check `source === 'gios'`
- `airQualityIndexMapper.test.ts`: expect `stationId` to be a string

## Constraints
- Do NOT add OpenAQ or weather code yet — that's Phase 2+
- Do NOT change component UI logic
- Do NOT change the GIOŚ API client behavior
- Preserve strict TypeScript — no `any`, no type assertions unless genuinely needed
- One commit per changed file, conventional commit messages
- After all changes: run `npm run build` (must be clean) then `npm test` (must pass)
- Push to `SundreamSoftware/clearsky` main
