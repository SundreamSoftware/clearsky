# Phase 1 — Foundation Refactor

## Goal
Prepare the codebase for multiple API providers without breaking the existing GIOŚ integration.

## What to do

### 1. Create `createHttpClient.ts`
File: `src/shared/api/createHttpClient.ts`

A factory function that creates an axios-based HTTP client with a given `baseURL` and optional default headers. Attach the same error interceptor that currently lives in `httpClient.ts`.

```ts
export function createHttpClient(baseURL: string, headers?: Record<string, string>)
  : { get<T>(url: string): Promise<T> }
```

### 2. Update `httpClient.ts`
Refactor to use `createHttpClient` internally. Export stays the same so GIOŚ code is unaffected.

### 3. Migrate `Station.id` from `number` to `string`
- `station.types.ts`: change `id: number` → `id: string`
- Add `source: 'gios' | 'openaq'` and `country: string | null` fields
- `airQualityIndex.types.ts`: change `stationId: number` → `stationId: string`
- Update `stationMapper.ts`: `id: String(dto['Identyfikator stacji'])`, `source: 'gios'`, `country: 'PL'`
- Update `airQualityIndexMapper.ts`: `stationId: String(dto['AqIndex']['Identyfikator stacji pomiarowej'])`
- Update all hooks that use `stationId: number` → `stationId: string`
- Update `App.tsx`: `selectedStationId: number | null` → `string | null`
- Update `StationMarker`, `StationSearch`, `StationDetailsPanel` for string id
- Export `StationSource` type from `station.types.ts`

## Acceptance criteria
- `npm run build` passes with no TypeScript errors
- `npm test` passes (all 83 existing tests)
- `createHttpClient` is used by `httpClient.ts`
- `Station.id` is `string` everywhere in the codebase
