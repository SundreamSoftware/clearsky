# Phase 03 — Station Map Implementation Prompt

You are a senior React/TypeScript engineer implementing the interactive map for **ClearSky**, an air quality dashboard for Poland.

Phases 01 and 02 are complete. The project is scaffolded and the full data layer (hooks, mappers, types) is in place.

## Your Task

Implement the interactive map as described in `readme.md` in this folder.

## Key Deliverables

1. Fix Leaflet default icon issue in `src/shared/utils/leafletIcons.ts`
2. Implement `<AirQualityMap>` component with full loading/error/empty handling
3. Implement `<StationMarker>` using `<CircleMarker>` with AQI-based colour
4. Implement `<LoadingState>`, `<ErrorState>`, `<EmptyState>` shared components
5. Update `App.tsx` to wire `useStations()` to the map
6. Write all component tests (mocking react-leaflet)

## Technical Constraints

1. Use `<CircleMarker>` — NOT the default Leaflet marker icon.
2. Map must be centred on `[52.0, 19.5]` at zoom 6.
3. Use OpenStreetMap tile layer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
4. Map container must fill the full available viewport height (use `h-full` or `h-[calc(100vh-theme(spacing.16))]`).
5. Loading overlay must not block user from seeing the partially-loaded map.
6. Marker colours must come from `getAqiInfo()` in `airQualityScale.ts`.
7. Do NOT fetch AQI for all stations on map load — only when a station is selected.

## Component Props

```ts
// AirQualityMap
interface AirQualityMapProps {
  stations: Station[];
  selectedStationId: number | null;
  onStationSelect: (stationId: number) => void;
  isLoading: boolean;
  error: Error | null;
}

// StationMarker
interface StationMarkerProps {
  station: Station;
  aqiLevel: number | null;
  isSelected: boolean;
  onSelect: (stationId: number) => void;
}
```

## Mocking react-leaflet for Tests

```ts
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children, eventHandlers, pathOptions }: any) => (
    <div
      data-testid="marker"
      data-fill={pathOptions?.fillColor}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn(), flyTo: vi.fn() }),
}));
```

## Verification

1. `npm run dev` — open browser, map shows Poland with grey markers
2. Check browser DevTools network tab — `/station/findAll` is called once
3. `npm run test` — component tests pass
4. `npm run build` — zero TypeScript errors
