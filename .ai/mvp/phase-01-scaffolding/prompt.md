# Phase 01 — Scaffolding Implementation Prompt

You are a senior frontend engineer setting up a new production-ready React application called **ClearSky** — an air quality dashboard for Poland.

## Your Task

Scaffold a complete Vite + React + TypeScript project in the **current directory** following the instructions in `readme.md` in this folder.

## Stack

- Vite (React + TypeScript template)
- React 18
- TypeScript 5 (strict mode)
- Tailwind CSS + @tailwindcss/forms
- TanStack Query v5
- React Router DOM v6
- Axios
- Zod
- Leaflet + React Leaflet
- Recharts
- clsx
- date-fns
- Vitest + React Testing Library + @testing-library/jest-dom
- Playwright

## Constraints

1. Use strict TypeScript — `"strict": true` in tsconfig.
2. Set up path alias `@/` pointing to `src/`.
3. Do NOT generate any feature code yet — only the skeleton and tooling.
4. All `npm run *` commands must succeed without errors.
5. `.env.local` must NOT be committed — only `.env.example`.
6. Folder structure must match the architecture exactly as described in the readme.
7. Place `.gitkeep` files in empty directories to ensure they are tracked by git.

## Key Files to Create

- `vite.config.ts` — with alias and vitest config
- `tailwind.config.ts`
- `tsconfig.json` — strict, with path aliases
- `.eslintrc.cjs` or `eslint.config.mjs`
- `.prettierrc`
- `.env.example`
- `.gitignore` — must exclude `.env.local`, `node_modules`, `dist`
- `src/app/App.tsx` — minimal shell
- `src/app/providers.tsx` — QueryClientProvider
- `src/shared/components/Layout.tsx`
- `src/shared/components/Header.tsx`
- `src/test-setup.ts`
- `playwright.config.ts`
- `src/app/App.test.tsx` — smoke test
- `tests/e2e/smoke.spec.ts` — smoke test
- `package.json` with all scripts defined

## Verification

After scaffolding, run:
1. `npm run build` — must succeed
2. `npm run lint` — must succeed
3. `npm run test` — smoke test must pass

Report results.
