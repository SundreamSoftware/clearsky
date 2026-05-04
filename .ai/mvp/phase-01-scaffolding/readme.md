# Phase 01 — Project Scaffolding

## Goal

Bootstrap a production-ready Vite + React + TypeScript project with the full feature-based folder structure, Tailwind CSS, tooling configuration, and a runnable skeleton app.

After this phase the developer has a working development environment and a deployable (empty) application skeleton.

---

## What Needs to Be Done

### 1. Initialise the Project

```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install Dependencies

#### Runtime
```bash
npm install \
  react-router-dom \
  @tanstack/react-query \
  axios \
  zod \
  leaflet react-leaflet \
  recharts \
  clsx \
  date-fns
```

#### Dev / Tooling
```bash
npm install -D \
  tailwindcss postcss autoprefixer \
  @tailwindcss/forms \
  eslint @eslint/js \
  eslint-plugin-react eslint-plugin-react-hooks \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  prettier eslint-config-prettier \
  vitest @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test \
  @types/leaflet \
  @types/node
```

### 3. Tailwind CSS Setup

```bash
npx tailwindcss init -p
```

`tailwind.config.ts`:
```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1A73E8',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. TypeScript Configuration

`tsconfig.json`:
- `"strict": true`
- `"baseUrl": "."` with path aliases: `@/*` → `./src/*`
- `"target": "ES2022"`

`vite.config.ts`:
- Configure path alias `@` → `/src`
- Configure test runner (vitest)

### 5. ESLint + Prettier

`.eslintrc.cjs` (or flat `eslint.config.mjs`):
- React + TypeScript rules
- No unused variables
- No explicit `any`

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

### 6. Folder Structure

Create the full directory tree as specified in the architecture plan:

```
src/
  app/
  features/air-quality/
    api/
    components/
    hooks/
    model/
    utils/
  shared/
    api/
    components/
    utils/
tests/
  unit/
  e2e/
docker/
.github/workflows/
```

Place `.gitkeep` files in empty directories.

### 7. Environment Variables

`.env.example`:
```env
VITE_GIOS_API_BASE_URL=https://api.gios.gov.pl/pjp-api/rest
```

`.env.local` (not committed):
```env
VITE_GIOS_API_BASE_URL=https://api.gios.gov.pl/pjp-api/rest
```

Add `.env.local` to `.gitignore`.

### 8. Skeleton App Components

- `src/app/App.tsx` — renders `<Layout>` with a "Coming soon" placeholder
- `src/app/providers.tsx` — wraps with `QueryClientProvider` (basic config, no custom settings yet)
- `src/shared/components/Layout.tsx` — `<div>` with header + main
- `src/shared/components/Header.tsx` — "ClearSky" title

### 9. NPM Scripts

Ensure `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 10. Vitest + Playwright Configuration

`vite.config.ts` — add vitest config block:
```ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.ts'],
  coverage: { provider: 'v8', reporter: ['text', 'html'] },
}
```

`src/test-setup.ts`:
```ts
import '@testing-library/jest-dom';
```

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Verification Checklist

Run all of these commands and confirm they succeed with zero errors:

- [ ] `npm run dev` — app starts, browser shows "ClearSky" header
- [ ] `npm run build` — `tsc --noEmit` passes, Vite build completes, `dist/` created
- [ ] `npm run lint` — zero ESLint errors
- [ ] `npm run test` — zero test failures (only the smoke test below runs)
- [ ] `npm run test:e2e` — Playwright smoke test passes

## Smoke Tests to Write in This Phase

### Unit smoke test (`src/app/App.test.tsx`)
```ts
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ClearSky header', () => {
  render(<App />);
  expect(screen.getByText(/clearsky/i)).toBeInTheDocument();
});
```

### E2E smoke test (`tests/e2e/smoke.spec.ts`)
```ts
import { test, expect } from '@playwright/test';

test('app loads and shows header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/clearsky/i)).toBeVisible();
});
```

---

## Acceptance Criteria for Phase 01

- Zero TypeScript errors
- Zero ESLint errors
- `npm run dev` opens a working page with the ClearSky header
- `npm run build` produces a `dist/` directory
- Vitest and Playwright are runnable
- Folder structure matches the architecture plan
- No secrets committed
- `.env.example` is committed
