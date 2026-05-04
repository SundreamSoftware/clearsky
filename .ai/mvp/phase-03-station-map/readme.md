# Phase 03 — Interactive Station Map

## Goal

Implement the core interactive map of Poland showing all GIOŚ monitoring stations as colour-coded markers. Users can click markers to select a station.

After this phase the map is fully functional: it loads, displays stations, applies AQI colours, and communicates the selected station to the parent.

---

## What Needs to Be Done

### 1. Leaflet Setup

Install Leaflet CSS in `src/index.css` or `main.tsx`:
```ts
import 'leaflet/dist/leaflet.css';
```

Fix Leaflet's default icon path issue (common with bundlers):
```ts
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
```

Put this in a `src/shared/utils/leafletIcons.ts` utility and call it once in `main.tsx` or `App.tsx`.

### 2. `AirQualityMap` Component (`src/features/air-quality/components/AirQualityMap.tsx`)

Props:
```ts
interface AirQualityMapProps {
  stations: Station[];
  selectedStationId: number | null;
  onStationSelect: (stationId: number) => void;
  isLoading: boolean;
  error: Error | null;
}
```

Behaviour:
- Renders a `<MapContainer>` centred on Poland: `center={[52.0, 19.5]}`, `zoom={6}`.
- Uses `<TileLayer>` with OpenStreetMap tiles.
- Renders a `<StationMarker>` for each station.
- When `isLoading` is true, render a `<LoadingState>` overlay above the map.
- When `error` is not null, render an `<ErrorState>` with a retry message.
- The map container must fill its parent's height (use Tailwind `h-full w-full`).

Attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`

### 3. `StationMarker` Component (`src/features/air-quality/components/StationMarker.tsx`)

Props:
```ts
interface StationMarkerProps {
  station: Station;
  aqiLevel: number | null;
  isSelected: boolean;
  onSelect: (stationId: number) => void;
}
```

Behaviour:
- Use `<CircleMarker>` (not default icon) from `react-leaflet`.
- `fillColor` from `getAqiInfo(aqiLevel).colour`.
- `color` (stroke): slightly darker version or white when selected.
- `radius`: 8 normally, 11 when `isSelected`.
- `<Popup>` or `<Tooltip>` showing station name on hover.
- Calls `onSelect(station.id)` on click.

### 4. AQI Data for Markers

The map needs AQI levels for all visible stations to colour the markers.

**Strategy for MVP**: Fetch AQI individually per station only when that station is selected. For marker colouring before selection, start all markers as grey (`aqiLevel: null`). When AQI is loaded after selection, the selected marker updates its colour.

> This avoids 500+ parallel API requests on load. Document this as a known limitation.

> Optional stretch: If performance allows, prefetch AQI for the first ~20 nearest stations, or lazily load AQI as the user pans the map.

### 5. Hook Usage in Parent

The map itself does not call hooks. The parent (`App.tsx` or a future `MapPage`) calls:
```ts
const { data: stations, isLoading, error } = useStations();
```

And passes props down to `<AirQualityMap>`.

### 6. Update `App.tsx`

Connect the map:
```tsx
function App() {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const { data: stations = [], isLoading, error } = useStations();

  return (
    <Layout>
      <AirQualityMap
        stations={stations}
        selectedStationId={selectedStationId}
        onStationSelect={setSelectedStationId}
        isLoading={isLoading}
        error={error}
      />
    </Layout>
  );
}
```

### 7. Shared State Components

Create or complete:

#### `src/shared/components/LoadingState.tsx`
```tsx
interface LoadingStateProps {
  message?: string;
}
// Renders a centered spinner with optional message
```

#### `src/shared/components/ErrorState.tsx`
```tsx
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
// Renders error message + optional "Spróbuj ponownie" button
```

#### `src/shared/components/EmptyState.tsx`
```tsx
interface EmptyStateProps {
  message?: string;
}
// Renders "Brak danych" with an icon
```

---

## Visual Specifications

### Map Container

```
┌───────────────────────────────────────────────────┐
│  [OpenStreetMap tiles — Poland]                    │
│                                                    │
│        ● ●    ●                                   │
│      ●   ●  ●   ●                                 │
│          ●                                         │
│    ●   ●    ●    ●                                │
└───────────────────────────────────────────────────┘
```

Markers use `<CircleMarker>` — no default Leaflet icons.

### Marker Colours

| AQI Level | Colour |
|---|---|
| 0 | `#00C853` |
| 1 | `#64DD17` |
| 2 | `#FFD600` |
| 3 | `#FF6D00` |
| 4 | `#D50000` |
| 5 | `#880E4F` |
| null | `#9E9E9E` |

### Loading State

Overlay on top of the map with 50% opacity background and a spinner.

---

## Tests to Write in This Phase

### Component Tests

#### `AirQualityMap.spec.tsx`
```ts
describe('AirQualityMap', () => {
  it('renders map container', ...)
  it('shows loading state when isLoading is true', ...)
  it('shows error state when error is provided', ...)
  it('renders correct number of markers', ...)
})
```

Note: Leaflet maps do not render in jsdom. Mock `react-leaflet` in tests:
```ts
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children, eventHandlers }: any) => (
    <div data-testid="marker" onClick={eventHandlers?.click}>{children}</div>
  ),
  Popup: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));
```

#### `StationMarker.spec.tsx`
```ts
describe('StationMarker', () => {
  it('calls onSelect with station id on click', ...)
  it('applies correct fill colour for AQI level', ...)
  it('applies grey colour for null AQI', ...)
})
```

---

## Acceptance Criteria for Phase 03

- [ ] Map renders on page load centred on Poland
- [ ] All stations appear as circle markers
- [ ] Markers are grey until AQI data is loaded for a selected station
- [ ] Clicking a marker sets the selected station ID in App state
- [ ] Map shows loading overlay while stations are fetching
- [ ] Map shows error state when fetch fails
- [ ] Component tests pass
- [ ] Zero TypeScript errors
- [ ] No Leaflet console warnings about missing icons
