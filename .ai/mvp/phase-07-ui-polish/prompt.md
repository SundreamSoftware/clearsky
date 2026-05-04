# Phase 07 — UI Polish & Accessibility Implementation Prompt

You are a senior frontend engineer polishing the UI and accessibility of **ClearSky**, an air quality dashboard for Poland.

Phases 01–06 are complete. The app is functionally complete. This phase makes it production-quality.

## Your Task

Implement all UI polish and accessibility improvements described in `readme.md` in this folder.

## Priority Order

Work in this order:
1. **Responsive layout** — desktop side-by-side, mobile bottom sheet (highest impact)
2. **Error boundaries** — safety net for unexpected crashes
3. **Accessibility** — ARIA attributes, focus management, colour contrast
4. **Loading skeletons** — replace spinners with pulse animations
5. **Branding** — header logo, page title, favicon
6. **Meta tags** — description, viewport in index.html

## Responsive Layout Requirements

Desktop (`lg:` breakpoint):
```
flex flex-col h-screen
  Header (h-16)
  main flex flex-1 overflow-hidden
    div flex-1 (map fills this)
    div w-96 overflow-y-auto border-l (panel, only when station selected)
```

Mobile:
```
flex flex-col h-screen
  Header (h-16)
  main flex-1 relative
    map fills full main
    StationDetailsPanel: fixed bottom-0 left-0 right-0 h-2/3 rounded-t-2xl
```

Use CSS classes — no inline styles except where Tailwind cannot reach.

## ARIA Implementation Priority

Must-have for MVP:
1. `<input type="search">` with `role="combobox"` and `aria-expanded`
2. `<ul role="listbox">` for search results
3. `<li role="option" aria-selected>` for each result
4. Close button `aria-label="Zamknij szczegóły stacji"`
5. AQI badge `role="status"` and `aria-label`

Nice-to-have:
- Map markers: `role="button"` and `aria-label` (may be limited by react-leaflet)
- Focus management on panel open

## ErrorBoundary Component

Create as a class component (React error boundaries require class components):
```ts
// src/shared/components/ErrorBoundary.tsx
interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}
interface State { hasError: boolean }

class ErrorBoundary extends React.Component<Props, State> {
  // implement getDerivedStateFromError and componentDidCatch
}
```

## AQI Text Colour Contrast

```ts
// Add to airQualityScale.ts
export function getAqiBadgeTextColour(level: number | null): 'black' | 'white' {
  if (level === null) return 'black'; // grey badge
  return level <= 2 ? 'black' : 'white';
}
```

## Constraints

1. Do NOT use CSS-in-JS or styled-components — Tailwind only.
2. Do NOT break existing functionality while refactoring layout.
3. Keep the `StationDetailsPanel` component unchanged except for layout classes.
4. Focus management: use `useEffect` + `useRef`, not `setTimeout`.
5. Do NOT add any new dependencies in this phase.

## Verification

1. `npm run dev` → resize browser to mobile width (375px) → map fills screen, panel slides up from bottom
2. `npm run dev` → resize to desktop → map + panel side by side
3. Open DevTools → Accessibility tab → check ARIA tree for search and panel
4. Run Lighthouse audit → accessibility score ≥ 90
5. `npm run test` — extended accessibility tests pass
6. `npm run build` — zero errors
