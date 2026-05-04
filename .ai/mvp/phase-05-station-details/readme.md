# Phase 05 — Station Details Panel

## Goal

Implement the `StationDetailsPanel` that appears when a station is selected. It shows the station name, city, current Air Quality Index, all pollutant measurements, and a list of sensors for chart selection.

---

## What Needs to Be Done

### 1. `StationDetailsPanel` Component (`src/features/air-quality/components/StationDetailsPanel.tsx`)

Props:
```ts
interface StationDetailsPanelProps {
  station: Station | null;
  selectedSensorId: number | null;
  onSensorSelect: (sensorId: number) => void;
  onClose: () => void;
}
```

Behaviour:
- When `station` is null: renders nothing (or a placeholder asking to select a station).
- When `station` is set: shows full details.
- Calls `useAirQualityIndex(station.id)` and `useStationSensors(station.id)` internally.
- Renders `<AirQualityBadge>` with the loaded AQI.
- Renders one `<PollutantCard>` per sensor that matches pollutant codes: PM2.5, PM10, NO2, O3, SO2, CO.
- For each pollutant card, calls `useSensorMeasurements(sensorId)` to get the latest value.
- Renders a close button (`×`) that calls `onClose`.
- On mobile: renders as a bottom sheet (fixed, bottom-0, slides up).
- On desktop: renders as a right-side panel.

### 2. `AirQualityBadge` Component (`src/features/air-quality/components/AirQualityBadge.tsx`)

Props:
```ts
interface AirQualityBadgeProps {
  aqiLevel: number | null;
  aqiName: string | null;
  size?: 'sm' | 'md' | 'lg';
}
```

Behaviour:
- Renders a coloured pill/badge with AQI name.
- Colour from `getAqiInfo(aqiLevel).colour`.
- Shows "Brak danych" with grey colour when null.

### 3. `PollutantCard` Component (`src/features/air-quality/components/PollutantCard.tsx`)

Props:
```ts
interface PollutantCardProps {
  sensor: Sensor;
  latestMeasurement: Measurement | null;
  isLoading: boolean;
  isSelected: boolean;
  onSelect: () => void;
}
```

Behaviour:
- Renders a card: pollutant name, current value + unit, coloured indicator.
- When `isLoading`: shows a skeleton/spinner in place of value.
- When `latestMeasurement` is null: shows "–" (no data).
- When `isSelected`: highlighted border or background.
- Clicking the card calls `onSelect()`.
- Colour indicator on the left: coloured vertical bar or dot (based on pollutant value vs WHO thresholds — or just use AQI colour for simplicity in MVP).

### 4. Latest Value Extraction

In `StationDetailsPanel`, for each sensor, retrieve the latest non-null measurement:

```ts
function getLatestMeasurement(measurements: Measurement[]): Measurement | null {
  return measurements.find(m => m.value !== null) ?? null;
}
```

Since `measurementMapper` already filters out null values, just take `measurements[0]`.

### 5. `SensorMeasurementsTable` Component (`src/features/air-quality/components/SensorMeasurementsTable.tsx`)

Props:
```ts
interface SensorMeasurementsTableProps {
  measurements: Measurement[];
  unit: string;
}
```

Optional component — renders a table of raw measurements for the selected sensor. Shown below the chart (Phase 06) or as a tab.

Columns: Date/Time | Value | Unit

---

## Layout: Station Details Panel

### Desktop (≥ 1024px)

```
┌───────────────────────────────────┐
│  [×]  Warszawa - Komunikacyjna   │
│        Warszawa, ul. Sikorskiego  │
├───────────────────────────────────┤
│  Indeks jakości powietrza         │
│  ┌─────────────────────────────┐ │
│  │  🟢  Dobry                  │ │
│  │  Obliczono: 04.05 12:00     │ │
│  └─────────────────────────────┘ │
├───────────────────────────────────┤
│  Pomiary                          │
│  ┌──────────┐ ┌──────────┐       │
│  │  PM2.5   │ │  PM10    │       │
│  │  12 µg/m³│ │  18 µg/m³│       │
│  └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐       │
│  │  NO2     │ │  O3      │       │
│  │  24 µg/m³│ │  48 µg/m³│       │
│  └──────────┘ └──────────┘       │
├───────────────────────────────────┤
│  Wybierz czujnik do wykresu:      │
│  [PM2.5] [PM10] [NO2] [O3]       │
└───────────────────────────────────┘
```

### Mobile — Bottom Sheet

```
━━━━━━━━━━━━━━━━━  ← drag handle
Warszawa - Komunikacyjna
🟢 Dobry
PM2.5: 12 µg/m³  |  PM10: 18 µg/m³
[View trend chart]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Tests to Write in This Phase

### Component Tests

#### `AirQualityBadge.spec.tsx`
```ts
describe('AirQualityBadge', () => {
  it('renders correct label for AQI level 0 (Bardzo dobry)', ...)
  it('renders correct label for AQI level 4 (Zły)', ...)
  it('renders "Brak danych" for null level', ...)
  it('applies correct background colour for each level', ...)
  it('renders with size prop variations', ...)
})
```

#### `StationDetailsPanel.spec.tsx`
```ts
describe('StationDetailsPanel', () => {
  it('renders nothing when station is null', ...)
  it('renders station name and city', ...)
  it('renders AQI badge with correct data', ...)
  it('renders loading state for AQI', ...)
  it('renders error state for AQI', ...)
  it('renders pollutant cards for available sensors', ...)
  it('calls onClose when close button clicked', ...)
  it('calls onSensorSelect when pollutant card clicked', ...)
})
```

Mock all hooks (`useAirQualityIndex`, `useStationSensors`, `useSensorMeasurements`) with `vi.mock`.

---

## Acceptance Criteria for Phase 05

- [ ] Clicking a marker (or selecting from search) opens the station details panel
- [ ] Panel shows station name, city, and address
- [ ] Panel shows AQI badge with correct colour and label
- [ ] Panel shows pollutant cards for all available sensors
- [ ] Each pollutant card shows the latest value
- [ ] Loading state shown while AQI and sensors are being fetched
- [ ] Error state shown if AQI or sensor fetch fails
- [ ] Close button dismisses the panel and deselects the station
- [ ] Panel is responsive (right panel on desktop, bottom sheet on mobile)
- [ ] All component tests pass
- [ ] Zero TypeScript errors
