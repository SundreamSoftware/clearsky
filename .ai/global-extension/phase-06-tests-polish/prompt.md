Act as a senior TypeScript frontend engineer working on the ClearSky air quality dashboard.

Your task is to implement Phase 6: Tests, Polish, and Deployment updates.

## Context
- Phases 1–5 complete: global stations, weather panel, historical charts
- Current test count before this phase: target 83+ passing
- Deployment uses Dockerfile with `ARG VITE_GIOS_API_BASE_URL=/api` pattern

## What to implement

### 1. Unit tests — add missing coverage

`src/features/air-quality/utils/openAqStationMapper.test.ts`:
- Fixture: a valid OpenAQ v3 location DTO
- Test: `id` is a string, `source` is `'openaq'`, `country` is set, coords parsed

`src/features/air-quality/utils/openAqMeasurementMapper.test.ts`:
- Fixture: a valid OpenAQ measurement DTO
- Test: value, date, unit mapped correctly

`src/features/weather/utils/weatherMapper.test.ts`:
- Fixture: a valid `OpenMeteoCurrentDto`
- Test: all 5 weather fields mapped; `fetchedAt` is the `current.time` value

`src/features/air-quality/utils/airQualityScale.test.ts`:
- If not already done in Phase 3, add:
  - `pm25ToAqiLevel` tests for all 6 bands
  - `usAqiToLevel` tests for all 6 bands

### 2. Component tests

`src/features/weather/components/WeatherPanel.spec.tsx`:
```tsx
it('renders all 5 weather metric cards', () => {
  const weather = { temperature: 20, humidity: 60, pressure: 1013, windSpeed: 10, windDirection: 180, ... };
  render(<WeatherPanel weather={weather} />);
  expect(screen.getByText(/temperature/i)).toBeInTheDocument();
  // ... etc
});
it('shows Open-Meteo attribution link', () => { ... });
```

`src/features/air-quality/components/PollutantChart.spec.tsx`:
- Add test: range toggle buttons '24h' and '7d' are present
- Add test: clicking '7d' changes active state

### 3. Update `Dockerfile`
Add `VITE_OPENAQ_API_KEY` ARG/ENV:
```dockerfile
ARG VITE_GIOS_API_BASE_URL=/api
ARG VITE_OPENAQ_API_KEY
ENV VITE_GIOS_API_BASE_URL=$VITE_GIOS_API_BASE_URL
ENV VITE_OPENAQ_API_KEY=$VITE_OPENAQ_API_KEY
```

### 4. Update `.github/workflows/deploy.yml`
In the `docker build` command, add:
```yaml
--build-arg VITE_OPENAQ_API_KEY=${{ secrets.OPENAQ_API_KEY }}
```

### 5. Update `.env.example`
Add:
```
# OpenAQ v3 API key — register free at https://explore.openaq.org
# Without this key, only Polish (GIOŚ) stations will be shown
VITE_OPENAQ_API_KEY=
```

### 6. Update `README.md`
- Add `VITE_OPENAQ_API_KEY` to the Environment Variables section
- Add a Data Sources section listing GIOŚ, OpenAQ, and Open-Meteo with links
- Update feature list to include: global stations, weather panel, historical charts
- Add note: "Deploying without an OpenAQ API key will show only Polish stations"

## Constraints
- Do not break existing tests
- Strict TypeScript
- One commit per changed file
- Run `npm run build` then `npm test` (all tests must pass)
- Push to `SundreamSoftware/clearsky` main
