# Phase 04 — Station Search & Selection

## Goal

Implement the station search experience: a search bar that filters stations by city or name, displays a results dropdown, and on selection pans the map to that station and opens the details panel.

---

## What Needs to Be Done

### 1. `StationSearch` Component (`src/features/air-quality/components/StationSearch.tsx`)

Props:
```ts
interface StationSearchProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
}
```

Behaviour:
- Text input with placeholder "Szukaj stacji lub miasta..."
- Debounce input by 300ms before filtering (use `useEffect` + `setTimeout`, or a custom `useDebounce` hook).
- Call `filterStations(stations, debouncedQuery)` to get results.
- Display results in a dropdown list below the input.
- Limit displayed results to **10** (for performance and UX).
- Each result item shows: station name (bold) + city name.
- Clicking a result calls `onStationSelect(station)` and clears the input.
- Pressing Escape closes the dropdown without selecting.
- Keyboard navigation: `ArrowDown` / `ArrowUp` move highlighted item; `Enter` selects highlighted item.
- Dropdown closes when clicking outside (use a `useClickOutside` hook or `ref`-based approach).

### 2. `useDebounce` Hook (`src/shared/utils/useDebounce.ts`)

```ts
export function useDebounce<T>(value: T, delay: number): T
```

### 3. `StationList` Component (`src/features/air-quality/components/StationList.tsx`)

Props:
```ts
interface StationListProps {
  stations: Station[];
  highlightedIndex: number;
  onSelect: (station: Station) => void;
}
```

A simple list of stations for the search dropdown. Highlights the item at `highlightedIndex`. On click calls `onSelect`.

### 4. Map Pan on Station Selection

When a station is selected via search (or by clicking a marker), pan the map to that station.

To pan programmatically, use a `ref` to the Leaflet map instance:

```ts
// In AirQualityMap.tsx, expose a ref or use a custom hook
const MapController = ({ selectedStation }: { selectedStation: Station | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
        duration: 0.8,
      });
    }
  }, [selectedStation, map]);
  return null;
};
```

Add `<MapController selectedStation={selectedStation} />` inside `<MapContainer>`.

### 5. Update `App.tsx`

```tsx
function App() {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const { data: stations = [], isLoading, error } = useStations();

  const selectedStation = stations.find(s => s.id === selectedStationId) ?? null;

  function handleStationSelect(station: Station) {
    setSelectedStationId(station.id);
  }

  return (
    <Layout>
      <Header>
        <StationSearch stations={stations} onStationSelect={handleStationSelect} />
      </Header>
      <main className="relative flex-1 overflow-hidden">
        <AirQualityMap
          stations={stations}
          selectedStation={selectedStation}
          selectedStationId={selectedStationId}
          onStationSelect={setSelectedStationId}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </Layout>
  );
}
```

### 6. Header Update (`src/shared/components/Header.tsx`)

Update `Header` to accept `children` prop so `StationSearch` can be placed inside it.

---

## UI / UX Specifications

### Search Bar (Desktop)

```
┌─────────────────────────────────────────────────┐
│  🔍  Szukaj stacji lub miasta...                │
└─────────────────────────────────────────────────┘
      ↓ (after typing "Kra")
┌─────────────────────────────────────────────────┐
│  🔍  Kra                                        │
├─────────────────────────────────────────────────┤
│  Kraków - Al. Krasińskiego        Kraków        │
│  Kraków - Nowa Huta               Kraków        │
│  Kraków - Kurdwanów               Kraków        │
└─────────────────────────────────────────────────┘
```

- Dropdown has a white background, subtle shadow, border radius.
- Highlighted item has a light blue background (`bg-blue-50`).
- Max height of dropdown: `max-h-64` with `overflow-y-auto`.

### Station Result Item

```
[Station name]           [City name]
Kraków - Al. Krasińskiego  Kraków
```

---

## Tests to Write in This Phase

### Unit Tests

#### `stationFilters.test.ts` (extend existing)
```ts
describe('filterStations', () => {
  it('returns max 10 results', ...)
  it('is case-insensitive for city', ...)
  it('is case-insensitive for station name', ...)
  it('returns empty array for no match', ...)
  it('returns all when query is empty string', ...)
})
```

### Component Tests

#### `StationSearch.spec.tsx`
```ts
describe('StationSearch', () => {
  const mockStations: Station[] = [
    { id: 1, name: 'Warszawa - Centrum', city: 'Warszawa', ... },
    { id: 2, name: 'Kraków - Nowa Huta', city: 'Kraków', ... },
  ];

  it('renders search input', ...)
  it('shows dropdown with results when typing', ...)
  it('calls onStationSelect when result is clicked', ...)
  it('clears input after selection', ...)
  it('shows no results when query does not match', ...)
  it('closes dropdown on Escape key', ...)
  it('debounces input', ...) // use fake timers
})
```

---

## Acceptance Criteria for Phase 04

- [ ] Typing in the search input shows a filtered dropdown list
- [ ] Search is debounced (300ms)
- [ ] Selecting a result pans the map to the station
- [ ] Selecting a result sets the selected station ID (details panel will be shown in Phase 05)
- [ ] Dropdown closes on Escape
- [ ] Dropdown closes on outside click
- [ ] Keyboard navigation works (up/down/enter)
- [ ] Unit tests pass
- [ ] Component tests pass
- [ ] Zero TypeScript errors
