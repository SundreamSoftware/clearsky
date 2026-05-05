# Phase 5 — Historical Data

## Goal
Add time range selectors to the air quality chart and a new weather history chart, showing 24h or 7-day trends.

## What to do

### Air quality history
- Update `PollutantChart.tsx` to accept `range: '24h' | '7d'` prop
- Add tab/toggle UI inside chart component
- For GIOŚ: existing `useSensorMeasurements` returns ~24 data points; show as-is for 24h; for 7d, show whatever is available with a note
- For OpenAQ: call `openAqClient.getMeasurements(sensorId, dateFrom, dateTo)` using the range
- `useSensorMeasurements` hook should accept `range` param and adjust query accordingly

### Weather history
New hook: `src/features/weather/hooks/useHistoricalWeather.ts`
- Open-Meteo archive endpoint: `https://archive-api.open-meteo.com/v1/archive`
- `?latitude=&longitude=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
- Add `archiveClient` to `openMeteoClient.ts`

New component: `src/features/weather/components/WeatherHistoryChart.tsx`
- Recharts `<LineChart>` pattern (same as `PollutantChart`)
- Shows `temperature_2m` by default
- Metric selector: temperature / humidity / wind speed tabs
- Range: 24h / 7d toggle

### Integration in `StationDetailsPanel`
After `WeatherPanel` add a collapsible/expandable `WeatherHistoryChart` section.

## Acceptance criteria
- PollutantChart shows 24h / 7d toggle
- WeatherHistoryChart renders with historical data
- Loading and empty states work for both
- `npm run build` clean, `npm test` passes
