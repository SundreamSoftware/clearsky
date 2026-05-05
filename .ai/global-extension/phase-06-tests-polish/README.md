# Phase 6 — Tests, Polish, Deployment

## Goal
Ensure the full test suite passes, update documentation, and verify deployment still works.

## What to do

### Unit tests to add/update
- `openAqStationMapper.test.ts` — fixture from OpenAQ v3 location DTO
- `openAqMeasurementMapper.test.ts`
- `weatherMapper.test.ts` — both current and historical mappers
- `airQualityScale.test.ts` — add `pm25ToAqiLevel` and `usAqiToLevel` tests
- `openAqClient.test.ts` — Zod parse failure when API key is missing (graceful empty return)

### Component tests to add/update
- `WeatherPanel.spec.tsx` — renders 5 weather cards; shows loading state
- `PollutantChart.spec.tsx` — range selector buttons present; switching range calls correct handler

### E2E tests (Playwright)
- `weather-panel.spec.ts` — selecting a station shows weather section
- Update `station-details.spec.ts` if it exists to verify new weather section

### Documentation updates
- `README.md`: add `VITE_OPENAQ_API_KEY` to env vars section; add note about data sources; update architecture diagram description
- `.env.example`: confirm `VITE_OPENAQ_API_KEY` is present

### Deployment
- Dockerfile: `VITE_OPENAQ_API_KEY` must also be passed as `ARG`/`ENV` (same pattern as `VITE_GIOS_API_BASE_URL`)
- GitHub Actions: add `OPENAQ_API_KEY` as GitHub secret; pass as `--build-arg VITE_OPENAQ_API_KEY=${{ secrets.OPENAQ_API_KEY }}` in docker build step
- Nginx: Open-Meteo and OpenAQ are CORS-open; no new proxy rules needed

## Acceptance criteria
- All unit + component tests pass
- E2E suite passes
- `npm run build` clean
- README reflects new features and env vars
- Docker build passes with new ARG
