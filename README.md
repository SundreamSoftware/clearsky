# 🌤 ClearSky

> Real-time air quality dashboard for Poland

[![Deploy](https://github.com/SundreamSoftware/clearsky/actions/workflows/deploy.yml/badge.svg)](https://github.com/SundreamSoftware/clearsky/actions/workflows/deploy.yml)

Live: [clearsky.sundreamsoftware.pl](https://clearsky.sundreamsoftware.pl)

## Overview

ClearSky is a production-ready air quality monitoring dashboard built with React and TypeScript. It integrates with the GIOŚ (Chief Inspectorate for Environmental Protection) public API to display real-time air quality data from monitoring stations across Poland.

## Features

- 🗺️ Interactive map of Poland with all monitoring stations
- 🎨 AQI-coloured station markers (Good → Hazardous scale)
- 🔍 Station search by city or station name
- 📊 Real-time pollutant measurements (PM2.5, PM10, NO2, O3, SO2, CO)
- 📈 Historical trend charts for selected sensors
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
      api/        # GIOŚ API client, Zod schemas, DTOs
      components/ # UI components
      hooks/      # TanStack Query hooks
      model/      # Domain types
      utils/      # Mappers, formatters, scales
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
| `VITE_GIOS_API_BASE_URL` | `https://api.gios.gov.pl/pjp-api/rest` | GIOŚ API base URL |

Copy `.env.example` to `.env.local` and adjust as needed.

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

### Health Check

```bash
# Container health
curl http://127.0.0.1:5010/health

# Public endpoint (after SSL setup)
curl https://clearsky.sundreamsoftware.pl/health
```

## Deployment Notes

- `VITE_GIOS_API_BASE_URL` is a Vite build-time variable and is baked into the production bundle.
- The `docker-compose.yml` environment entry documents the expected value for builds, but changing it at container runtime does not reconfigure an already built frontend bundle.
- Host Nginx terminates TLS and proxies traffic to the Docker container on `127.0.0.1:5010`.

## Data Source

[GIOŚ API](https://powietrze.gios.gov.pl/pjp/content/api) — Chief Inspectorate for Environmental Protection (Poland). Public, no authentication required.

## Project Structure

See the [Architecture section](#architecture) for the main source layout.
