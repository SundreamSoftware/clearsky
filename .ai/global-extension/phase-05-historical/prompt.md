Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 5: Historical Data views with range selectors.

## Context
- Phases 1–4 complete: global AQ map, weather panel working
- `PollutantChart.tsx` currently renders whatever measurements `useSensorMeasurements` returns
- Open-Meteo archive: `https://archive-api.open-meteo.com/v1/archive` (different base URL!)
- OpenAQ measurements endpoint supports date_from/date_to params

## What to implement

### 1. Add `range: '24h' | '7d'` to `PollutantChart`
Update `PollutantChart.tsx`:
- Add `range` prop (default `'24h'`)
- Add internal state `const [range, setRange] = useState<'24h' | '7d'>('24h')`
- Render two pill/tab buttons above chart: "24h" | "7d"
- Pass `range` down to the hook via a callback or lift to parent

**Or:** keep range state in `StationDetailsPanel` and pass it as prop to both the chart and hook.

Prefer: lift state to `StationDetailsPanel` — it already manages `selectedSensorId`.

### 2. Update `useSensorMeasurements` to accept `range`
```ts
export function useSensorMeasurements(sensorId: number | null, paramCode = '', range: '24h' | '7d' = '24h')
```
Add `range` to `queryKey`. For GIOŚ: the API returns 24 data points regardless — use them for both ranges (no API change needed for GIOŚ). For OpenAQ stations, this will be extended in a future update.

### 3. Add weather history support to `openMeteoClient.ts`
Add `archiveClient = createHttpClient('https://archive-api.open-meteo.com/v1')`.

Add schema `OpenMeteoHourlySchema` for the archive response:
```json
{
  "latitude": 52.0, "longitude": 21.0,
  "hourly_units": { "time": "iso8601", "temperature_2m": "°C", ... },
  "hourly": {
    "time": ["2024-05-03T00:00", ...],
    "temperature_2m": [15.2, ...],
    "relative_humidity_2m": [70, ...],
    "wind_speed_10m": [8.0, ...]
  }
}
```

Add to `openMeteoClient`:
```ts
async getHistoricalWeather(lat: number, lon: number, startDate: string, endDate: string): Promise<OpenMeteoHourlyDto>
```

### 4. `src/features/weather/hooks/useHistoricalWeather.ts`
```ts
export function useHistoricalWeather(lat: number | null, lon: number | null, range: '24h' | '7d') {
  // compute startDate/endDate from range (use current date minus 1 or 7 days)
  // Note: Open-Meteo archive requires dates in the past; use yesterday as end date
  return useQuery({
    queryKey: ['weather-history', lat, lon, range],
    queryFn: async () => { ... },
    enabled: lat !== null && lon !== null,
    staleTime: 30 * 60 * 1000,
  });
}
```

Return type: `{ time: string[]; temperature: number[]; humidity: number[]; windSpeed: number[] }`

### 5. `src/features/weather/utils/weatherMapper.ts`
Add `mapOpenMeteoHourlyDto(dto: OpenMeteoHourlyDto)` that returns the structured hourly object.

### 6. `src/features/weather/components/WeatherHistoryChart.tsx`
- Props: `{ lat: number; lon: number; range: '24h' | '7d' }`
- Calls `useHistoricalWeather` internally
- Renders a Recharts `<LineChart>` with `<XAxis>`, `<YAxis>`, `<Line>` for temperature
- Shows tab buttons to switch between temperature / humidity / wind speed
- Loading state, empty state
- Reuse the `formatDate` utility for x-axis labels

### 7. Update `StationDetailsPanel.tsx`
- Add range state: `const [chartRange, setChartRange] = useState<'24h' | '7d'>('24h')`
- Pass `range={chartRange}` to `PollutantChart` (or existing chart handling)
- Add range toggle buttons above charts (shared for both AQ and weather history)
- Add `<WeatherHistoryChart>` after `<WeatherPanel>`

### 8. Add unit test `weatherMapper.test.ts`
Add test for `mapOpenMeteoHourlyDto` with a fixture.

## Constraints
- Archive endpoint and forecast endpoint have different base URLs — must use separate axios instances
- If archive request fails (e.g., date out of range), show empty state gracefully
- Strict TypeScript
- One commit per changed file
- Run `npm run build` and `npm test` after all changes
- Push to `SundreamSoftware/clearsky` main
