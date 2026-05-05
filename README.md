# 🌤 ClearSky

> Real-time air quality and weather dashboard — Poland + Global

[![Deploy](https://github.com/SundreamSoftware/clearsky/actions/workflows/deploy.yml/badge.svg)](https://github.com/SundreamSoftware/clearsky/actions/workflows/deploy.yml)

Live: [clearsky.sundreamsoftware.pl](https://clearsky.sundreamsoftware.pl)

## Overview

ClearSky is a production-ready air quality and weather monitoring dashboard built with React and TypeScript. It integrates with multiple public APIs to display real-time air quality data from monitoring stations across Poland and globally, along with current and historical weather conditions.

## Features

- 🗺️ Interactive map with all monitoring stations — Poland and worldwide
- 🎨 AQI-coloured station markers (Good → Hazardous scale)
- 🔍 Station search by city or station name
- 📊 Real-time pollutant measurements (PM2.5, PM10, NO2, O3, SO2, CO)
- 📈 Historical trend charts for selected sensors
- 🌤️ Current weather conditions (temperature, humidity, pressure, wind)
- 📅 Historical weather charts with 24h / 7d range selector
- 📱 Responsive design for desktop and mobile
- ♿ Accessible (ARIA labels, keyboard navigation)
- 🚨 Graceful error and loading states

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Maps | React Leaflet |
| Charts | Recharts |
| Data fetching | TanStack Query |
| Validation | Zod |
| Testing | Vitest + Playwright |
| Deployment | Docker + Nginx |
| CI/CD | GitHub Actions |

## Architecture

Feature-based frontend architecture with clear separation of concerns:

```text
src/
  app/            # App bootstrap, providers, router
  features/
    air-quality/
      api/        # GIOŚ + WAQI API clients, Zod schemas, DTOs
      components/ # UI components
      hooks/      # TanStack Query hooks
      model/      # Domain types
      utils/      # Mappers, formatters, scales, filters
    weather/
      api/        # Open-Meteo client, Zod schemas, DTOs
      components/ # Weather UI components
      hooks/      # TanStack Query hooks
      model/      # Domain types
      utils/      # Mappers
  shared/
    api/          # HTTP client, error types
    components/   # Shared UI (Layout, Loading, Error states)
    utils/        # Date, number formatting
```

Domain models are decoupled from external API DTOs. Zod validates API responses and mapper functions convert them into internal types used by the UI.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Development

```bash
git clone https://github.com/SundreamSoftware/clearsky.git
cd clearsky
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_GIOS_API_BASE_URL` | `/api` | GIOŚ API base URL (proxied — do not change) |
| `VITE_WAQI_TOKEN` | _(empty)_ | WAQI token for local dev proxy — get a free token at [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/) |

Copy `.env.example` to `.env.local` and set `VITE_WAQI_TOKEN`. The token is injected server-side and never exposed to the browser.

## Data Sources

| Source | Coverage | API |
|---|---|---|
| [GIOŚ](https://www.gios.gov.pl/) | Poland air quality (~700 official stations) | [api.gios.gov.pl](https://api.gios.gov.pl/pjp-api/swagger-ui/index.html) |
| [WAQI](https://waqi.info/) | Global air quality (11,000+ stations, viewport-based) | [api.waqi.info](https://aqicn.org/api/) |
| [Open-Meteo](https://open-meteo.com/) | Global weather | [api.open-meteo.com](https://open-meteo.com/en/docs) |

## Running Tests

```bash
# Unit and component tests
npm test

# Tests with coverage
npm run test:coverage

# E2E tests (requires dev server)
npm run test:e2e
```

## Deployment

### Docker (Production)

```bash
docker compose up -d
```

The container serves the built app at port 5010 bound to localhost for host-level Nginx reverse proxying.

### Server Setup (Ubuntu)

1. Install Docker, Nginx, and Certbot.
2. Clone the repo to `/opt/clearsky`.
3. Copy `nginx.server.conf` to `/etc/nginx/sites-available/clearsky`.
4. Enable the site: `ln -s /etc/nginx/sites-available/clearsky /etc/nginx/sites-enabled/`.
5. Get an SSL certificate: `certbot --nginx -d clearsky.sundreamsoftware.pl`.
6. Start the app: `cd /opt/clearsky && docker compose up -d`.

### CI/CD

GitHub Actions deploys automatically on push to `main`. Required secrets:

| Secret | Description |
|---|---|
| `SERVER_HOST` | Server IP or hostname |
| `SERVER_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Private key for SSH access |
| `WAQI_TOKEN` | WAQI API token — injected into the container at runtime |

### Health Check

```bash
# Container health
curl http://127.0.0.1:5010/health

# Public endpoint (after SSL setup)
curl https://clearsky.sundreamsoftware.pl/health
```

## Project Structure

See the [Architecture section](#architecture) for the main source layout.
