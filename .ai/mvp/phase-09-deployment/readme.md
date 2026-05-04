# Phase 09 — Deployment

## Goal

Set up production deployment of the ClearSky application: Dockerfile, docker-compose, Nginx reverse proxy on the host, Certbot SSL, GitHub Actions CI/CD pipeline, and a complete README.

After this phase the application is live at `https://clearsky.sundreamsoftware.pl` with automated deployments on push to `main`.

---

## What Needs to Be Done

### 1. Dockerfile

Two-stage build. Place at project root as `Dockerfile`.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Notes:
- `npm run build` runs `tsc --noEmit && vite build` — TypeScript errors will fail the build.
- `.dockerignore` must exclude `node_modules`, `.env.local`, `dist`, `.git`.

### 2. `.dockerignore`

```
node_modules
dist
.git
.env.local
.env*.local
*.log
coverage
playwright-report
```

### 3. Container Nginx Config (`docker/nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/css
        text/javascript
        application/javascript
        application/json
        image/svg+xml
        font/woff2;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively (Vite hashes filenames)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Do not cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

### 4. `docker-compose.yml`

```yaml
version: "3.9"

services:
  clearsky-web:
    image: ghcr.io/${GITHUB_REPOSITORY_OWNER}/clearsky:latest
    container_name: clearsky-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:5010:80"
    environment:
      - NODE_ENV=production
```

Place at `/opt/clearsky/docker-compose.yml` on the server.

### 5. Host Nginx Configuration

File: `/etc/nginx/sites-available/clearsky`  
Symlinked to: `/etc/nginx/sites-enabled/clearsky`

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name clearsky.sundreamsoftware.pl;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name clearsky.sundreamsoftware.pl;

    ssl_certificate     /etc/letsencrypt/live/clearsky.sundreamsoftware.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clearsky.sundreamsoftware.pl/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;

    location / {
        proxy_pass         http://127.0.0.1:5010;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Certbot SSL Command

On the server:
```bash
sudo certbot --nginx -d clearsky.sundreamsoftware.pl --non-interactive --agree-tos -m admin@sundreamsoftware.pl
```

Or using the ACME challenge approach (if Nginx is already configured for port 80):
```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d clearsky.sundreamsoftware.pl \
  --email admin@sundreamsoftware.pl \
  --agree-tos \
  --non-interactive
```

Auto-renewal is handled by Certbot's systemd timer (installed automatically).

### 7. GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy ClearSky

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/clearsky

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run lint

      - run: npm run test

      - run: npx playwright install --with-deps chromium

      - run: npm run test:e2e

  build-and-push:
    name: Build & Push Docker Image
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Server
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/clearsky
            docker compose pull
            docker compose up -d
            docker system prune -f

      - name: Health Check
        run: |
          sleep 15
          curl -f https://clearsky.sundreamsoftware.pl || exit 1
```

### 8. Required GitHub Secrets

Add in repository Settings → Secrets and variables → Actions:

| Secret | Description |
|---|---|
| `SSH_HOST` | Server IP or hostname |
| `SSH_USER` | SSH username (e.g. `deploy`) |
| `SSH_PRIVATE_KEY` | Private SSH key (ed25519 or RSA) |

`GITHUB_TOKEN` is provided automatically by GitHub Actions for the container registry.

### 9. Server Setup Commands

Run once on the server:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Install Nginx + Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Create deployment directory
sudo mkdir -p /opt/clearsky
sudo chown $USER:$USER /opt/clearsky

# Create docker-compose.yml on server (copy from repo or paste)
# Then:
docker compose pull
docker compose up -d

# Set up Nginx
sudo cp clearsky.nginx.conf /etc/nginx/sites-available/clearsky
sudo ln -s /etc/nginx/sites-available/clearsky /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d clearsky.sundreamsoftware.pl
```

### 10. Deployment Verification Commands

```bash
# Check container is running
docker compose ps

# Check container logs
docker compose logs -f clearsky-web

# Verify HTTP → HTTPS redirect
curl -I http://clearsky.sundreamsoftware.pl

# Verify HTTPS works
curl -I https://clearsky.sundreamsoftware.pl

# Check SSL certificate
openssl s_client -connect clearsky.sundreamsoftware.pl:443 -servername clearsky.sundreamsoftware.pl < /dev/null

# View Nginx access log
sudo tail -f /var/log/nginx/access.log
```

### 11. README (`README.md`)

The README must include:

```markdown
# ClearSky — Jakość Powietrza w Polsce

[![CI](https://github.com/<owner>/clearsky/actions/workflows/deploy.yml/badge.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Interaktywna mapa jakości powietrza oparta na danych GIOŚ.

![Screenshot of ClearSky app](docs/screenshots/hero.png)

## 🔗 Live Demo

[clearsky.sundreamsoftware.pl](https://clearsky.sundreamsoftware.pl)

## ✨ Features

- Interactive map of Poland with all GIOŚ monitoring stations
- Colour-coded markers based on Air Quality Index
- Station search by city or name
- Current AQI and pollutant measurements
- Trend charts per sensor
- Responsive layout (desktop + mobile)
- Full error and loading state handling

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Map | React Leaflet + Leaflet |
| Charts | Recharts |
| Server state | TanStack Query v5 |
| Validation | Zod |
| Testing | Vitest, Playwright |
| Deployment | Docker, Nginx, GitHub Actions |

## 🏗 Architecture

[Feature-based folder structure, data flow description]

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 9+

### Local Development
\`\`\`bash
git clone https://github.com/<owner>/clearsky.git
cd clearsky
cp .env.example .env.local
npm install
npm run dev
\`\`\`

## 🧪 Testing
\`\`\`bash
npm run test          # Unit + component tests
npm run test:e2e      # Playwright E2E tests
npm run test:coverage # Coverage report
\`\`\`

## 🐳 Docker
\`\`\`bash
docker build -t clearsky .
docker run -p 5010:80 clearsky
\`\`\`

## 🌐 Deployment

[Link to deployment docs or Phase 09 readme]

## 📡 API

Data source: [GIOŚ API](https://api.gios.gov.pl/pjp-api/rest)

## 📋 Roadmap

[Link to Future Roadmap section in plan.md]

## 📄 License

MIT
```

---

## Acceptance Criteria for Phase 09

- [ ] `docker build .` succeeds locally
- [ ] `docker run -p 5010:80 clearsky` serves the app at `http://localhost:5010`
- [ ] Host Nginx config is valid (`nginx -t`)
- [ ] `https://clearsky.sundreamsoftware.pl` loads the app
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate is valid (Let's Encrypt)
- [ ] GitHub Actions pipeline runs on push to `main`
- [ ] CI runs lint + tests + build + push + deploy
- [ ] Health check after deploy passes
- [ ] README is complete with badges and screenshot placeholders
- [ ] `.dockerignore` is committed
- [ ] No secrets are committed to the repository
