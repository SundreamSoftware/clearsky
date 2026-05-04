# Phase 05 — Station Details Panel Implementation Prompt

You are a senior React/TypeScript engineer implementing the station details panel for **ClearSky**, an air quality dashboard for Poland.

Phases 01–04 are complete. The map shows stations, search is functional, and clicking a marker sets `selectedStationId` in App state.

## Your Task

Implement the station details panel as described in `readme.md` in this folder.

## Key Deliverables

1. `StationDetailsPanel` — full panel with AQI, pollutants, sensor selector
2. `AirQualityBadge` — coloured pill showing AQI level name
3. `PollutantCard` — card showing pollutant name + latest measurement value
4. `SensorMeasurementsTable` — optional table of raw measurements
5. Connect panel to `App.tsx` with station and sensor state
6. All component tests with mocked hooks

## Data Fetching Inside Panel

`StationDetailsPanel` calls these hooks internally (NOT from App.tsx):
```ts
const { data: aqi, isLoading: aqiLoading, error: aqiError } = useAirQualityIndex(station?.id ?? null);
const { data: sensors = [], isLoading: sensorsLoading } = useStationSensors(station?.id ?? null);
```

For each sensor in the sensors list, `PollutantCard` calls:
```ts
const { data: measurements = [], isLoading } = useSensorMeasurements(sensor.id);
```

This is acceptable for MVP — one request per sensor, typically 3–6 sensors per station.

## Layout Requirements

Desktop (lg breakpoint):
- Fixed right panel: `w-96` or `w-[400px]`, full height, overflow-y-scroll
- Map takes remaining width

Mobile:
- Panel slides up from bottom: `fixed bottom-0 left-0 right-0`
- Height: `h-2/3` with overflow-y-scroll
- Drag handle at top (decorative `div` with `w-8 h-1 bg-gray-300 rounded mx-auto my-2`)

## Error Boundary

Wrap `StationDetailsPanel` in a `React.ErrorBoundary` in `App.tsx` so a crash in the panel does not break the map.

## Mock Pattern for Tests

```ts
vi.mock('@/features/air-quality/hooks/useAirQualityIndex', () => ({
  useAirQualityIndex: vi.fn(),
}));
// Then in each test:
(useAirQualityIndex as any).mockReturnValue({
  data: { indexLevel: 1, indexName: 'Dobry', stationId: 1, ... },
  isLoading: false,
  error: null,
});
```

## Constraints

1. Do NOT pass raw DTOs to any component — only domain models.
2. Loading state must be shown PER section (AQI section and Pollutants section independently).
3. The panel must NOT use `useStations()` — it receives the `station` prop from App.
4. `AirQualityBadge` must be a pure presentational component (no hooks, no API calls).
5. `PollutantCard` must be a pure presentational component.

## Verification

1. `npm run dev` — click any station marker → panel opens with station name and city
2. After a few seconds: AQI badge appears and pollutant cards show values
3. `npm run test` — all new tests pass
4. `npm run build` — zero errors
5. Manual: close panel → map returns to full width
6. Manual: select different station → panel updates with new data
