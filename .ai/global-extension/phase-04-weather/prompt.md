Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 4: Weather Integration using the Open-Meteo API.

## Context
- Phases 1–3 complete: global stations visible, AQI colors working
- Open-Meteo is completely free, no API key needed, CORS is open (direct browser calls work)
- Two base URLs: forecast at `https://api.open-meteo.com/v1`, archive at `https://archive-api.open-meteo.com/v1`

## What to implement

### 1. `src/features/weather/model/weather.types.ts`
```ts
export interface Weather {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  fetchedAt: string;
}
```

### 2. `src/features/weather/api/openMeteo.schemas.ts`
Zod schema for the Open-Meteo forecast response:
```json
{
  "latitude": 52.0,
  "longitude": 21.0,
  "current_units": {
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "surface_pressure": "hPa",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°"
  },
  "current": {
    "time": "2024-05-04T12:00",
    "temperature_2m": 19.5,
    "relative_humidity_2m": 63,
    "surface_pressure": 997.2,
    "wind_speed_10m": 5.8,
    "wind_direction_10m": 171
  }
}
```
Schema name: `OpenMeteoCurrentSchema`. All `current` fields as `z.number()`.

### 3. `src/features/weather/api/openMeteo.dto.ts`
Type inferred from schema.

### 4. `src/features/weather/api/openMeteoClient.ts`
```ts
import { createHttpClient } from '@/shared/api/createHttpClient';
import { OpenMeteoCurrentSchema } from './openMeteo.schemas';

const forecastClient = createHttpClient('https://api.open-meteo.com/v1');

export const openMeteoClient = {
  async getCurrentWeather(lat: number, lon: number): Promise<OpenMeteoCurrentDto> {
    const params = `forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&forecast_days=1`;
    const raw = await forecastClient.get<unknown>(params);
    return OpenMeteoCurrentSchema.parse(raw);
  }
};
```

### 5. `src/features/weather/utils/weatherMapper.ts`
```ts
export function mapOpenMeteoCurrentDto(dto: OpenMeteoCurrentDto): Weather {
  return {
    latitude: dto.latitude,
    longitude: dto.longitude,
    temperature: dto.current.temperature_2m,
    humidity: dto.current.relative_humidity_2m,
    pressure: dto.current.surface_pressure,
    windSpeed: dto.current.wind_speed_10m,
    windDirection: dto.current.wind_direction_10m,
    fetchedAt: dto.current.time,
  };
}
```

### 6. `src/features/weather/hooks/useWeather.ts`
```ts
export function useWeather(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      const dto = await openMeteoClient.getCurrentWeather(lat!, lon!);
      return mapOpenMeteoCurrentDto(dto);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 15 * 60 * 1000,
  });
}
```

### 7. `src/features/weather/components/WeatherCard.tsx`
A simple card showing:
- An icon or emoji for the metric type (use plain Unicode: 🌡️ 💧 🔽 💨 🧭)
- Label (e.g. "Temperature")
- Value with unit (e.g. "19.5 °C")

Props: `{ label: string; value: string; icon: string }`
Styled with Tailwind: white card, rounded, shadow-sm, padding.

### 8. `src/features/weather/components/WeatherPanel.tsx`
Renders 5 `WeatherCard` components in a responsive grid (2 cols on mobile, 3 on desktop).
Accepts `weather: Weather`.
Shows a subtle `<a href="https://open-meteo.com" target="_blank">Weather: Open-Meteo</a>` attribution at the bottom in `text-xs text-gray-400`.

### 9. Update `src/features/air-quality/components/StationDetailsPanel.tsx`
- Import `useWeather` and `WeatherPanel`
- Call `useWeather(station.latitude, station.longitude)`
- After the pollutant cards section, add:
  - Section heading "Warunki pogodowe" (Weather conditions)
  - `<WeatherPanel weather={data} />` (only when `data` is defined)
  - Loading state: small spinner or `<LoadingState>` during fetch
  - If weather fetch fails, silently omit section (non-critical)

### 10. Add unit test `src/features/weather/utils/weatherMapper.test.ts`
Test `mapOpenMeteoCurrentDto` with a valid fixture DTO.

## Constraints
- Open-Meteo is direct (no proxy needed) — do NOT route through `/api/`
- Weather is non-critical: if it fails, the AQ panel still works
- Strict TypeScript
- One commit per changed file
- Run `npm run build` and `npm test` after all changes
- Push to `SundreamSoftware/clearsky` main
