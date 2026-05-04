# Phase 04 — Station Search & Selection Implementation Prompt

You are a senior React/TypeScript engineer implementing station search for **ClearSky**, an air quality dashboard for Poland.

Phases 01–03 are complete. The map is working and displaying all stations.

## Your Task

Implement station search and selection as described in `readme.md` in this folder.

## Key Deliverables

1. `StationSearch` component with debounced input, dropdown, keyboard navigation
2. `StationList` component for rendering dropdown items
3. `useDebounce` hook in `src/shared/utils/useDebounce.ts`
4. `MapController` component inside `AirQualityMap` for programmatic pan/zoom
5. Updated `Header` to accept children
6. Updated `App.tsx` to connect search → map pan → station selection
7. All unit and component tests

## Keyboard Navigation Requirements

The search dropdown MUST support:
- `ArrowDown` → highlight next item
- `ArrowUp` → highlight previous item
- `Enter` → select highlighted item
- `Escape` → close dropdown, clear highlight
- `Tab` → close dropdown

## Debounce Specification

- Delay: **300ms**
- Use a `useDebounce<T>(value: T, delay: number): T` hook
- The filter function is called only after the debounce settles
- Test with `vi.useFakeTimers()`

## Map Pan Specification

When a station is selected (from search OR from marker click):
- Use `map.flyTo([lat, lng], 12, { duration: 0.8 })`
- This requires a `<MapController>` component inside `<MapContainer>` that uses `useMap()` hook

## Constraints

1. `StationSearch` must be usable without a keyboard (fully mouse accessible).
2. Dropdown must close on outside click (`useRef` + `mousedown` listener).
3. Limit dropdown results to 10 items.
4. Do NOT block the UI thread — filter runs after debounce.
5. `filterStations` from phase 02 must be reused — do not duplicate filtering logic.

## Verification

1. `npm run dev` — type "Warszawa" in search, dropdown shows results, click one, map pans
2. `npm run test` — all tests pass
3. `npm run build` — zero TypeScript errors
4. Manual: type "xyz123" → no results message or empty dropdown shown
5. Manual: Escape key closes dropdown
