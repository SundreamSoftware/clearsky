# ClearSky — Implementation Plan

> Air quality dashboard focused on Poland.  
> Domain: **clearsky.sundreamsoftware.pl**  
> Stack: React · TypeScript · Vite · Tailwind CSS · TanStack Query · Zod · React Leaflet · Recharts · Vitest · Playwright · Docker · Nginx · GitHub Actions  
> Architecture: Feature-based SPA (frontend-only MVP, .NET proxy planned for Phase 2)

---

## 1. Product Overview

ClearSky is a public-facing web application that visualises real-time air quality data from Polish monitoring stations operated by GIOŚ (Główny Inspektorat Ochrony Środowiska). The application allows users to explore an interactive map of Poland, find monitoring stations, inspect current pollutant levels, and review recent measurement trends.

The project is designed to be a portfolio-quality, production-deployed application demonstrating:
- Integration with a real public REST API
- Interactive map UI
- Data visualisation with charts
- Typed frontend architecture
- Zod-validated data layer
- Caching and server state management
- Error handling and accessibility
- Docker deployment with Nginx and SSL

---

## 2. MVP Scope

| Feature | Included |
|---|---|
| Interactive Leaflet map of Poland with station markers | ✅ |
| Colour-coded markers based on Air Quality Index | ✅ |
| Station search by city or station name | ✅ |
| Station details panel (AQI, pollutants) | ✅ |
| Pollutant measurements: PM2.5, PM10, NO2, O3, SO2, CO | ✅ |
| Pollutant trend chart for selected sensor | ✅ |
| Loading / error / empty states on all data views | ✅ |
| Responsive layout (desktop + mobile) | ✅ |
| Basic accessibility (ARIA labels, keyboard nav) | ✅ |
| Deployment via Docker + Nginx + Certbot | ✅ |
| GitHub Actions CI/CD pipeline | ✅ |
| README with architecture, setup, screenshots | ✅ |

---

## 3. Out of Scope for MVP

- User authentication / accounts
- Persistent user data (database)
- Station comparison
- Voivodeship filtering
- Historical trends beyond sensor data window
- OpenAQ integration
- Dark mode
- PWA / offline support
- .NET backend proxy/cache
- Location-based nearest station
- SEO landing page
- Station ranking

---

## 4. User Stories

### US-01 — Explore map
As a visitor, I want to see an interactive map of Poland with all monitoring stations, so I can visually understand air quality coverage.

### US-02 — Understand station health at a glance
As a visitor, I want station markers to be colour-coded by air quality level, so I can spot problem areas immediately.

### US-03 — Search for a station
As a visitor, I want to search by city name or station name, so I can quickly find a station relevant to me.

### US-04 — View station details
As a visitor, I want to click a station marker and see a details panel with the current Air Quality Index and all pollutant measurements.

### US-05 — Inspect pollutant trends
As a visitor, I want to select a specific pollutant sensor and see a chart of recent measurements, so I can understand how air quality is changing over time.

### US-06 — Handle missing data gracefully
As a visitor, I want to see clear feedback when data is unavailable or when an API error occurs, so I am never left with a broken UI.

### US-07 — Use the app on mobile
As a visitor on a phone, I want the app to be usable on a small screen, so I can check air quality on the go.

---

## 5. Functional Requirements

### FR-01 Map
- Display a Leaflet map centred on Poland (lat: 52.0, lng: 19.5, zoom: 6).
- Fetch all stations from GIOŚ API on app load.
- Render each station as a map marker.
- Marker colour must reflect current AQI level.
- Clicking a marker must open the Station Details Panel.

### FR-02 AQI Colour Scale
| Level | Name | Colour |
|---|---|---|
| 0 | Very Good | `#00C853` |
| 1 | Good | `#64DD17` |
| 2 | Moderate | `#FFD600` |
| 3 | Satisfactory | `#FF6D00` |
| 4 | Bad | `#D50000` |
| 5 | Very Bad | `#880E4F` |
| Unknown | No data | `#9E9E9E` |

### FR-03 Station Search
- Search input filters stations by city or station name (case-insensitive).
- Results appear as a dropdown or list below the search input.
- Selecting a result pans the map to the station and opens its details.
- Debounce search input (300ms).

### FR-04 Station Details Panel
- Opens on marker click or search selection.
- Shows: station name, city, address.
- Shows current AQI badge (coloured, labelled).
- Shows a card per pollutant with: parameter name, value, unit.
- Shows sensor list; selecting a sensor loads its trend chart.
- Can be closed (returns map to full view).

### FR-05 Trend Chart
- Loads measurement data for the selected sensor.
- Displays a line chart with date/time on X-axis and value on Y-axis.
- Shows unit label.
- Displays "No data available" if measurement array is empty.

### FR-06 States
- Loading skeleton/spinner on initial data load.
- Error state with retry option on API failure.
- Empty state with explanatory text when no data is returned.
- These states must appear per-section, not globally blocking the whole UI.

### FR-07 Responsive Layout
- Map occupies full viewport on mobile; details panel slides up from bottom.
- On desktop: split layout — map left, details panel right (or overlay).

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| TypeScript strict mode | `"strict": true` in tsconfig |
| API validation | All external responses validated with Zod |
| Domain model isolation | UI components never receive raw DTOs |
| Cache — station list | `staleTime: 10 minutes` |
| Cache — AQI index | `staleTime: 5 minutes` |
| Cache — measurements | `staleTime: 2 minutes` |
| Error boundaries | Wrap map and details panel |
| Bundle size | < 500 kB gzipped (monitor with `vite-bundle-visualizer`) |
| Lighthouse score | ≥ 80 on performance, ≥ 90 on accessibility |
| Docker image size | < 50 MB (use `nginx:alpine`) |
| HTTPS | Certbot / Let's Encrypt on production |
| CI pipeline | Lint + test + build + deploy on `main` push |

---

## 7. API Integration Strategy

### Primary Source: GIOŚ REST API

Base URL: `https://api.gios.gov.pl/pjp-api/rest`

| Endpoint | Description | Cache |
|---|---|---|
| `GET /station/findAll` | All monitoring stations | 10 min |
| `GET /station/sensors/{stationId}` | Sensors for a station | 10 min |
| `GET /data/getData/{sensorId}` | Measurements for a sensor | 2 min |
| `GET /aqindex/getIndex/{stationId}` | Air Quality Index | 5 min |

### API Client Pattern

```
External API → Zod schema validation → DTO → Mapper → Domain model → TanStack Query hook → React component
```

- `giosClient.ts` — raw fetch calls returning validated DTOs
- `gios.schemas.ts` — Zod schemas matching GIOŚ API response shapes
- `gios.dto.ts` — TypeScript types inferred from Zod schemas
- `stationMapper.ts`, `sensorMapper.ts`, `measurementMapper.ts`, `airQualityIndexMapper.ts` — pure functions, no side effects

### Error Handling

- All fetch errors are caught and converted to `ApiError` (with `message`, `statusCode`, `endpoint`).
- TanStack Query `onError` callbacks propagate `ApiError` to components.
- Components render `<ErrorState>` when query is in error state.

### CORS

The GIOŚ API supports CORS from browser. No proxy needed for MVP. If CORS issues arise, add Nginx proxy rule.

---

## 8. Data Model

### Internal Domain Models

#### `Station`
```ts
interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  voivodeship: string | null;
}
```

#### `Sensor`
```ts
interface Sensor {
  id: number;
  stationId: number;
  parameterCode: string; // e.g. "PM2.5"
  parameterName: string; // e.g. "pył zawieszony PM2.5"
  unit: string;          // e.g. "µg/m³"
}
```

#### `Measurement`
```ts
interface Measurement {
  sensorId: number;
  date: string; // ISO 8601
  value: number | null;
  unit: string;
}
```

#### `AirQualityIndex`
```ts
interface AirQualityIndex {
  stationId: number;
  indexLevel: number | null; // 0–5 or null
  indexName: string | null;
  calculatedAt: string | null;
  sourceDataDate: string | null;
}
```

#### `Pollutant`
```ts
interface Pollutant {
  code: string;
  name: string;
  unit: string;
  latestValue: number | null;
}
```

#### `ApiError`
```ts
interface ApiError {
  message: string;
  statusCode: number | null;
  endpoint: string;
}
```

### GIOŚ DTO Examples

Station DTO from `/station/findAll`:
```json
{
  "id": 114,
  "stationName": "Warszawa-Komunikacyjna",
  "gegrLat": "52.219464",
  "gegrLon": "21.006232",
  "city": { "id": 1, "name": "Warszawa", "commune": { "provinceName": "MAZOWIECKIE" } },
  "addressStreet": "ul. Sikorskiego"
}
```

AQI DTO from `/aqindex/getIndex/{id}`:
```json
{
  "id": 114,
  "stCalcDate": "2024-05-04 12:00:00",
  "stIndexLevel": { "id": 1, "indexLevelName": "Dobry" },
  "stSourceDataDate": "2024-05-04 11:00:00"
}
```

---

## 9. Frontend Architecture

### Directory Structure

```
clearsky/
├── .ai/                        # Implementation plans (this directory)
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root component, error boundary wrapper
│   │   ├── providers.tsx       # QueryClientProvider, etc.
│   │   └── router.tsx          # react-router-dom routes (future)
│   ├── features/
│   │   └── air-quality/
│   │       ├── api/
│   │       │   ├── giosClient.ts
│   │       │   ├── gios.schemas.ts
│   │       │   └── gios.dto.ts
│   │       ├── components/
│   │       │   ├── AirQualityMap.tsx
│   │       │   ├── StationMarker.tsx
│   │       │   ├── StationList.tsx
│   │       │   ├── StationSearch.tsx
│   │       │   ├── StationDetailsPanel.tsx
│   │       │   ├── AirQualityBadge.tsx
│   │       │   ├── PollutantCard.tsx
│   │       │   ├── PollutantChart.tsx
│   │       │   └── SensorMeasurementsTable.tsx
│   │       ├── hooks/
│   │       │   ├── useStations.ts
│   │       │   ├── useStationSensors.ts
│   │       │   ├── useSensorMeasurements.ts
│   │       │   └── useAirQualityIndex.ts
│   │       ├── model/
│   │       │   ├── station.types.ts
│   │       │   ├── sensor.types.ts
│   │       │   ├── measurement.types.ts
│   │       │   ├── airQualityIndex.types.ts
│   │       │   └── pollutant.types.ts
│   │       └── utils/
│   │           ├── airQualityScale.ts
│   │           ├── measurementFormatter.ts
│   │           ├── stationFilters.ts
│   │           ├── stationMapper.ts
│   │           ├── sensorMapper.ts
│   │           ├── measurementMapper.ts
│   │           └── airQualityIndexMapper.ts
│   └── shared/
│       ├── api/
│       │   ├── httpClient.ts
│       │   └── apiError.ts
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Header.tsx
│       │   ├── LoadingState.tsx
│       │   ├── ErrorState.tsx
│       │   └── EmptyState.tsx
│       └── utils/
│           ├── dateTime.ts
│           └── number.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── docker/
│   └── nginx.conf
├── .env.example
├── .env.local             # Not committed
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 10. Component Structure

| Component | Responsibility |
|---|---|
| `App.tsx` | Root, error boundaries, providers |
| `Layout.tsx` | Page shell, header, main area |
| `Header.tsx` | App title, nav (future) |
| `AirQualityMap.tsx` | Leaflet map, renders all `StationMarker`, handles click |
| `StationMarker.tsx` | Individual map marker, colour from AQI |
| `StationSearch.tsx` | Search input + dropdown results |
| `StationList.tsx` | List of filtered stations (used inside search results) |
| `StationDetailsPanel.tsx` | Full details panel: AQI + pollutants + chart |
| `AirQualityBadge.tsx` | Coloured AQI label (Good, Bad, etc.) |
| `PollutantCard.tsx` | Single pollutant: name, value, unit, colour indicator |
| `PollutantChart.tsx` | Recharts line chart for a sensor's measurements |
| `SensorMeasurementsTable.tsx` | Table view of raw measurements |
| `LoadingState.tsx` | Spinner / skeleton |
| `ErrorState.tsx` | Error message + retry button |
| `EmptyState.tsx` | "No data" message with icon |

---

## 11. State Management and Caching Strategy

All server state managed by **TanStack Query v5**.

| Query Key | Data | `staleTime` | `gcTime` |
|---|---|---|---|
| `['stations']` | All stations | 10 min | 30 min |
| `['sensors', stationId]` | Station sensors | 10 min | 30 min |
| `['measurements', sensorId]` | Sensor measurements | 2 min | 10 min |
| `['aqindex', stationId]` | AQI for station | 5 min | 15 min |

UI state (selected station, search query, selected sensor) managed with **React useState / useReducer** — no external state manager needed for MVP.

`QueryClient` is configured once in `providers.tsx` with global defaults.

---

## 12. Error / Loading / Empty State Strategy

Every data-driven section must handle all three states independently.

| State | Component | Behaviour |
|---|---|---|
| Loading | `<LoadingState />` | Spinner + "Loading stations..." text |
| Error | `<ErrorState />` | Message + retry button (calls `refetch()`) |
| Empty | `<EmptyState />` | Icon + contextual message |
| Success | Actual content | Rendered normally |

Error boundaries (`React.ErrorBoundary`) wrap:
- The entire `<AirQualityMap>` subtree
- The entire `<StationDetailsPanel>` subtree

---

## 13. UI/UX Layout Proposal

### Desktop (≥ 1024px)
```
┌─────────────────────────────────────────────────┐
│  Header: ClearSky logo        [Search bar     ]  │
├──────────────────────────┬──────────────────────┤
│                          │  StationDetailsPanel  │
│   AirQualityMap          │  (hidden until        │
│   (fills remaining       │   station selected)   │
│    viewport)             │                       │
│                          │  - AQI badge          │
│                          │  - Pollutant cards    │
│                          │  - Chart              │
└──────────────────────────┴──────────────────────┘
```

### Mobile (< 768px)
- Map fills full screen.
- Search is a floating bar at the top.
- Details panel slides up as a bottom sheet on marker click.
- Bottom sheet has drag handle, can be dismissed.

### Colour palette
| Token | Value |
|---|---|
| `--color-brand` | `#1A73E8` (sky blue) |
| `--color-bg` | `#F8FAFC` |
| `--color-surface` | `#FFFFFF` |
| `--color-text` | `#1E293B` |
| `--color-muted` | `#64748B` |

---

## 14. Testing Strategy

### Unit Tests (Vitest)

Files: `src/**/*.test.ts`

Cover:
- `airQualityScale.ts` — AQI level to colour/name mapping
- `stationFilters.ts` — city/name filter function
- `measurementFormatter.ts` — value + unit formatting
- `stationMapper.ts` — GIOŚ DTO → Station domain model
- `sensorMapper.ts` — GIOŚ sensor DTO → Sensor domain model
- `measurementMapper.ts` — GIOŚ data DTO → Measurement domain model
- `airQualityIndexMapper.ts` — GIOŚ AQI DTO → AirQualityIndex model

### Component Tests (Vitest + React Testing Library)

Files: `src/**/*.spec.tsx`

Cover:
- `StationSearch` — renders input, filters results, handles selection
- `AirQualityBadge` — renders correct colour and label per AQI level
- `StationDetailsPanel` — renders station data, shows loading/error states
- `PollutantChart` — renders chart with data, renders empty state

### E2E Tests (Playwright)

Files: `tests/e2e/*.spec.ts`

| Test | Description |
|---|---|
| `should display the map` | Map container renders on load |
| `should load stations` | Station markers appear after API response |
| `should search for a station by city` | Typing "Warszawa" shows results |
| `should select a station marker` | Clicking marker opens details panel |
| `should display station details` | Panel shows station name, city, AQI |
| `should display pollutant measurements` | Pollutant cards visible in panel |
| `should handle API error state` | Mock API failure → error state shown |
| `should handle station without measurements` | Empty state shown for no data |

---

## 15. Deployment Architecture

```
Internet (HTTPS 443)
        ↓
clearsky.sundreamsoftware.pl
        ↓
Nginx reverse proxy (host port 80/443)
        ↓
127.0.0.1:5010
        ↓
Docker container: clearsky-web
  └── nginx:alpine serving /usr/share/nginx/html (React build)
```

### Server Setup

- OS: Ubuntu Server 22.04 LTS
- Docker + Docker Compose installed
- Nginx installed on host (reverse proxy to Docker container)
- Certbot for Let's Encrypt SSL

### Server Path

```
/opt/clearsky/
├── docker-compose.yml
├── .env
└── (no source code on server — CI pulls and deploys)
```

---

## 16. Docker Setup

### `Dockerfile`

Two-stage build:
1. **Builder**: `node:20-alpine` → `npm ci` → `npm run build`
2. **Runner**: `nginx:alpine` → copy `/dist` → copy custom `nginx.conf`

### `docker-compose.yml`

```yaml
services:
  clearsky-web:
    image: ghcr.io/<owner>/clearsky:latest
    container_name: clearsky-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:5010:80"
    environment:
      - VITE_GIOS_API_BASE_URL=${VITE_GIOS_API_BASE_URL}
```

---

## 17. Nginx Setup

### Host Nginx (`/etc/nginx/sites-available/clearsky`)

```nginx
server {
    listen 80;
    server_name clearsky.sundreamsoftware.pl;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name clearsky.sundreamsoftware.pl;

    ssl_certificate     /etc/letsencrypt/live/clearsky.sundreamsoftware.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clearsky.sundreamsoftware.pl/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:5010;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
```

### Container Nginx (`docker/nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 18. GitHub Actions Deployment

### Workflow: `.github/workflows/deploy.yml`

Trigger: push to `main`

Steps:
1. Checkout
2. Setup Node.js
3. `npm ci`
4. `npm run lint`
5. `npm run test`
6. `npm run build`
7. Build Docker image
8. Push to GitHub Container Registry (`ghcr.io`)
9. SSH to server
10. `docker compose pull && docker compose up -d`
11. Health check: `curl -f https://clearsky.sundreamsoftware.pl`

Secrets required:
- `SSH_PRIVATE_KEY`
- `SSH_HOST`
- `SSH_USER`
- `GHCR_TOKEN`

---

## 19. Implementation Phases

See `.ai/mvp/` subdirectories for detailed per-phase plans.

| Phase | Name | Key Output |
|---|---|---|
| 01 | Project Scaffolding | Runnable Vite app, folder structure, CI skeleton |
| 02 | API & Domain Layer | HTTP client, Zod schemas, mappers, TanStack Query |
| 03 | Station Map | Interactive Leaflet map with coloured markers |
| 04 | Station Search & Selection | Search input, list, map pan |
| 05 | Station Details Panel | AQI badge, pollutant cards, panel layout |
| 06 | Pollutant Trend Charts | Recharts line chart, sensor selector |
| 07 | UI Polish & Accessibility | Responsive layout, skeletons, a11y |
| 08 | Tests | Unit, component, and E2E tests |
| 09 | Deployment | Dockerfile, Nginx, GitHub Actions, README |

---

## 20. Acceptance Criteria

### MVP Done When:

- [ ] Map displays all GIOŚ stations with AQI-coloured markers
- [ ] Search finds stations by city and name
- [ ] Clicking a marker shows name, city, AQI, all pollutant values
- [ ] Trend chart displays for any sensor with data
- [ ] All loading / error / empty states are rendered correctly
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] All unit tests pass
- [ ] All E2E tests pass on local dev server
- [ ] App is accessible at `https://clearsky.sundreamsoftware.pl`
- [ ] Lighthouse accessibility score ≥ 90
- [ ] README is complete with screenshots
- [ ] GitHub Actions deploy pipeline is green

---

## 21. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GIOŚ API instability / downtime | Medium | High | Add error states + retry; cache aggressively |
| GIOŚ API returns inconsistent shapes | High | Medium | Zod `.safeParse()` + fallback to null on parse failure |
| CORS issues with GIOŚ API | Low | High | Add Nginx proxy rule if encountered |
| Leaflet marker performance with 500+ stations | Medium | Medium | Use `leaflet.markercluster` plugin |
| Large bundle size from map + chart libs | Medium | Low | Lazy-load `StationDetailsPanel` (only loaded on click) |
| CI/CD secrets misconfiguration | Low | High | Test SSH connection before merging pipeline |

---

## 22. Future Roadmap

### Phase 2 — .NET API Gateway

- .NET 9 Minimal API acting as proxy + cache for GIOŚ
- Redis or in-memory cache
- Public `/health` endpoint
- Rate limiting
- Deploy alongside React app on same server

### Phase 3 — Enhanced Features

- Station comparison (multi-select)
- Ranking page (best/worst AQI in Poland)
- localStorage favourites
- Voivodeship filter

### Phase 4 — OpenAQ Integration

- Global station layer
- Toggle between GIOŚ and OpenAQ
- Unified domain model with source discriminator

### Phase 5 — Product Enhancements

- Dark mode (Tailwind class strategy)
- PWA support (service worker, offline)
- Location-based nearest station
- SEO landing page
- Historical trends with date range picker

---

## 23. README Structure

```
# ClearSky — Air Quality Dashboard for Poland

[Badges: CI status, License]
[Screenshot of map with station details panel open]

## About
## Live Demo
## Features
## Tech Stack
## Architecture

### Frontend Structure
### Data Flow diagram

## Getting Started

### Prerequisites
### Local Development
### Environment Variables

## Testing
## Deployment

### Docker
### Nginx
### SSL

## API
## Roadmap
## Contributing
## License
```

---

## 24. Recommended Screenshots for Portfolio / GitHub

1. **Hero shot** — Full map view with AQI-coloured markers (multiple colours visible), no panel open.
2. **Station details** — Map + station panel open, AQI badge "Dobry" (green), pollutant cards grid.
3. **Pollutant chart** — PM2.5 trend line chart for a Warsaw station.
4. **Search in action** — Search bar with "Kraków" typed, dropdown showing 3–4 results.
5. **Error state** — Error card with "Nie udało się załadować danych" and retry button.
6. **Mobile view** — Bottom sheet panel on iPhone-sized viewport.
7. **Lighthouse score** — Browser DevTools screenshot showing 90+ accessibility.
