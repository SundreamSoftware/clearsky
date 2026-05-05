# Phase 4 — Weather Integration

## Goal
Show current weather data (temperature, humidity, pressure, wind) for any selected station using the free Open-Meteo API.

## What to do

### New feature directory
`src/features/weather/`

### Files
- `api/openMeteo.schemas.ts` — Zod schemas
- `api/openMeteo.dto.ts` — TypeScript types
- `api/openMeteoClient.ts` — HTTP client
- `model/weather.types.ts` — domain model
- `utils/weatherMapper.ts` — DTO → domain
- `hooks/useWeather.ts` — TanStack Query hook
- `components/WeatherCard.tsx` — single metric card
- `components/WeatherPanel.tsx` — grid of WeatherCard components

### Open-Meteo endpoint
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m
  &wind_speed_unit=kmh
  &forecast_days=1
```

### `Weather` domain model
```ts
export interface Weather {
  latitude: number;
  longitude: number;
  temperature: number;       // °C
  humidity: number;          // %
  pressure: number;          // hPa
  windSpeed: number;         // km/h
  windDirection: number;     // degrees
  fetchedAt: string;         // ISO timestamp
}
```

### `WeatherPanel` component
- Shows 5 `WeatherCard` components in a responsive grid
- Shows loading state when fetching
- Shows error state if fetch fails
- Has a subtle "Weather data: Open-Meteo" attribution link

### Integration
Add `<WeatherPanel>` to `StationDetailsPanel.tsx` below the pollutant cards section.

## Acceptance criteria
- Selecting any station shows weather panel
- All 5 metrics render with correct units
- Loading and error states work
- Open-Meteo attribution visible
- `npm run build` clean, `npm test` passes
