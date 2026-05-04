# Phase 09 — Deployment Implementation Prompt

You are a senior DevOps/fullstack engineer setting up production deployment for **ClearSky**, an air quality dashboard for Poland.

Phases 01–08 are complete. The application is fully functional, tested, and ready for production.

## Your Task

Implement all deployment infrastructure as described in `readme.md` in this folder.

## Key Deliverables

1. `Dockerfile` (two-stage: node builder + nginx:alpine runner)
2. `.dockerignore`
3. `docker/nginx.conf` (container Nginx — SPA fallback + gzip + cache headers)
4. `docker-compose.yml` (for server deployment)
5. `.github/workflows/deploy.yml` (CI/CD: test → build → push → deploy)
6. `README.md` (complete, professional, with badges)

## File Locations

All files in the project root unless otherwise noted:
- `Dockerfile` → project root
- `.dockerignore` → project root
- `docker/nginx.conf` → `docker/` subdirectory
- `docker-compose.yml` → project root (also deployed to `/opt/clearsky/` on server)
- `.github/workflows/deploy.yml`
- `README.md`

## Docker Build Verification (Local)

After creating the Dockerfile:
```bash
docker build -t clearsky-test .
docker run --rm -p 5010:80 clearsky-test
```
Then open `http://localhost:5010` and verify the app loads.

## GitHub Actions Constraints

1. Test job MUST run before build-and-push job (use `needs: test`).
2. Build-and-push MUST run before deploy job.
3. Use `docker/build-push-action` with GitHub Actions cache (`cache-from: type=gha`).
4. Use `appleboy/ssh-action` for SSH deployment.
5. Health check must `sleep 15` before curling — give Docker time to restart.
6. Use `GITHUB_TOKEN` for GHCR authentication (no separate registry secret needed).

## README Requirements

The README must look professional on GitHub:
- Badges: CI status badge, MIT license badge
- Screenshot placeholder: `![ClearSky Screenshot](docs/screenshots/hero.png)` — create the `docs/screenshots/` directory with a `.gitkeep` so the path exists.
- Tech stack table
- Getting started section with copy-pasteable commands
- Testing section
- Docker section
- Deployment section linking to Phase 09 readme for full details

## Security Checklist

Before committing:
- [ ] No API keys or tokens in any committed file
- [ ] `.env.local` is in `.gitignore`
- [ ] `docker-compose.yml` does NOT contain hardcoded credentials
- [ ] Nginx config has security headers (HSTS, X-Content-Type-Options, X-Frame-Options)
- [ ] `Dockerfile` does NOT run as root inside the container (nginx:alpine runs as nginx user)

## Verification Steps

1. `docker build -t clearsky .` → success
2. `docker run --rm -p 5010:80 clearsky` → app serves at `http://localhost:5010`
3. `npm run build` → `dist/` created, zero TS errors
4. `cat docker/nginx.conf` → verify `try_files $uri /index.html` present
5. `cat .dockerignore` → verify `node_modules` excluded
6. Check `.github/workflows/deploy.yml` YAML is valid (use `yamllint` or GitHub's validator)

## Notes

The `docker-compose.yml` uses an environment variable `$GITHUB_REPOSITORY_OWNER` for the image name. On the server, this should be set in a `.env` file in `/opt/clearsky/` or hardcoded with the actual GitHub username/org.

The workflow assumes the server has:
- Docker + Docker Compose plugin installed
- Port 5010 open locally (not publicly — Nginx proxies)
- The deploy user has Docker group membership
- `/opt/clearsky/docker-compose.yml` exists on the server
