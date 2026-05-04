# Phase 07 — UI Polish & Accessibility

## Goal

Improve the visual quality, responsiveness, and accessibility of the application. This phase ensures the app is production-ready, passes basic accessibility audits, and looks professional on both desktop and mobile.

---

## What Needs to Be Done

### 1. Responsive Layout

#### Desktop (≥ 1024px) — Side-by-Side Layout

```
┌──────────────────────────────────────────────────────┐
│  Header: 🌤 ClearSky    [Search bar              ]   │
├───────────────────────────┬──────────────────────────┤
│                           │  Station Details Panel    │
│   Map (flex-1, h-full)    │  (w-96, overflow-y-auto)  │
│                           │                           │
└───────────────────────────┴──────────────────────────┘
```

`Layout.tsx` must use `flex flex-col h-screen`:
```tsx
<div className="flex flex-col h-screen">
  <Header />
  <main className="flex flex-1 overflow-hidden">
    <div className="flex-1 relative">
      <AirQualityMap ... />
    </div>
    {selectedStation && (
      <div className="w-96 overflow-y-auto border-l bg-white shadow-lg">
        <StationDetailsPanel ... />
      </div>
    )}
  </main>
</div>
```

#### Mobile (< 768px) — Full-Screen Map + Bottom Sheet

- Map fills full screen.
- `StationDetailsPanel` renders as a `fixed bottom-0 left-0 right-0` bottom sheet.
- Bottom sheet height: `h-2/3`, `overflow-y-auto`.
- Drag handle at top: `<div className="w-8 h-1 bg-gray-300 rounded-full mx-auto my-2" />`.
- Bottom sheet has `rounded-t-2xl shadow-2xl bg-white`.
- When no station selected: bottom sheet hidden.

Use Tailwind `sm:` and `lg:` breakpoints consistently.

### 2. Loading Skeletons

Replace plain spinner with Tailwind pulse-animation skeletons for:

#### `PollutantCard` Loading State
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
  <div className="h-6 bg-gray-200 rounded w-24" />
</div>
```

#### `AirQualityBadge` Loading State
```tsx
<div className="animate-pulse h-8 bg-gray-200 rounded-full w-32" />
```

### 3. Error Boundaries

Wrap in `App.tsx`:
```tsx
<ErrorBoundary fallback={<ErrorState message="Wystąpił nieoczekiwany błąd aplikacji." />}>
  <AirQualityMap ... />
</ErrorBoundary>

<ErrorBoundary fallback={<ErrorState message="Nie można załadować szczegółów stacji." />}>
  <StationDetailsPanel ... />
</ErrorBoundary>
```

Create a reusable `ErrorBoundary` class component:
```ts
// src/shared/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> { ... }
```

### 4. Accessibility

Apply ARIA attributes to all interactive elements:

#### Map Markers
```tsx
<CircleMarker
  aria-label={`Stacja ${station.name} w ${station.city}`}
  role="button"
  tabIndex={0}
/>
```

#### Search Input
```tsx
<input
  type="search"
  role="combobox"
  aria-expanded={isOpen}
  aria-autocomplete="list"
  aria-controls="station-search-results"
  aria-activedescendant={highlightedIndex >= 0 ? `result-${highlightedIndex}` : undefined}
  placeholder="Szukaj stacji lub miasta..."
/>
<ul id="station-search-results" role="listbox">
  {results.map((station, i) => (
    <li
      key={station.id}
      id={`result-${i}`}
      role="option"
      aria-selected={i === highlightedIndex}
    >
      ...
    </li>
  ))}
</ul>
```

#### AQI Badge
```tsx
<span
  role="status"
  aria-label={`Indeks jakości powietrza: ${aqiName}`}
>
  {aqiName}
</span>
```

#### Close Button
```tsx
<button aria-label="Zamknij szczegóły stacji" onClick={onClose}>×</button>
```

### 5. Focus Management

When a station is selected (either from map or search):
- Move focus to the `StationDetailsPanel` heading.
- Use `useEffect` + `ref.focus()` on the panel heading.

### 6. Colour Contrast

Ensure all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text):
- AQI badge text: use black text on light colours (levels 0–2), white text on dark colours (levels 3–5).
- Check with browser DevTools colour contrast checker.

Add a utility:
```ts
// airQualityScale.ts
export function getAqiBadgeTextColour(level: number | null): 'text-black' | 'text-white'
```

### 7. Page Title & Meta

In `index.html`:
```html
<title>ClearSky — Jakość Powietrza w Polsce</title>
<meta name="description" content="Interaktywna mapa jakości powietrza w Polsce. Dane z sieci GIOŚ." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Add `<link rel="icon" href="/favicon.svg" />`.

### 8. App Logo / Branding

In `Header.tsx`:
```tsx
<header className="flex items-center px-4 h-16 bg-white border-b shadow-sm">
  <span className="text-2xl">🌤</span>
  <h1 className="ml-2 text-xl font-bold text-brand">ClearSky</h1>
  <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
    Jakość Powietrza w Polsce
  </span>
  <div className="ml-auto flex-1 max-w-md">
    <StationSearch ... />
  </div>
</header>
```

### 9. Tailwind Configuration Refinements

Add to `tailwind.config.ts`:
- Custom brand colour `#1A73E8`
- Custom font (optional: `Inter` via Google Fonts)
- Animate utilities are enabled by default

---

## Tests to Write in This Phase

### Accessibility-Focused Component Tests

#### `StationSearch.spec.tsx` (extend)
```ts
it('has correct ARIA attributes on input', ...)
it('sets aria-selected on highlighted result', ...)
it('sets aria-expanded when dropdown is open', ...)
```

#### `AirQualityBadge.spec.tsx` (extend)
```ts
it('uses black text for good AQI levels', ...)
it('uses white text for bad AQI levels', ...)
```

---

## Acceptance Criteria for Phase 07

- [ ] Desktop layout: map + side panel side-by-side
- [ ] Mobile layout: full-screen map + bottom sheet panel
- [ ] All loading states use pulse skeleton animations
- [ ] Error boundaries wrap map and panel
- [ ] All buttons have `aria-label`
- [ ] Search input has correct ARIA combobox attributes
- [ ] AQI badge text is readable (passes WCAG AA contrast)
- [ ] Focus moves to panel when station is selected
- [ ] Page title is set correctly
- [ ] `npm run build` zero errors
- [ ] Manual Lighthouse accessibility score ≥ 90
