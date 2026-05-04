# Phase 06 — Pollutant Trend Charts

## Goal

Implement the `PollutantChart` component that displays a line chart of measurement history for the selected sensor, using Recharts. Users can select which sensor's chart to view via the pollutant cards from Phase 05.

---

## What Needs to Be Done

### 1. `PollutantChart` Component (`src/features/air-quality/components/PollutantChart.tsx`)

Props:
```ts
interface PollutantChartProps {
  sensorId: number | null;
  parameterCode: string;
  parameterName: string;
  unit: string;
}
```

Behaviour:
- Calls `useSensorMeasurements(sensorId)` internally.
- When `isLoading`: renders `<LoadingState message="Ładowanie danych..." />`.
- When `error`: renders `<ErrorState message="Błąd ładowania danych czujnika." onRetry={refetch} />`.
- When `data` is empty or all values null: renders `<EmptyState message="Brak danych pomiarowych dla tego czujnika." />`.
- Otherwise: renders a Recharts `<LineChart>` or `<AreaChart>`.

### 2. Chart Specifications

Use `recharts`. Recommended chart type: `<AreaChart>` (looks better than plain line for time series).

```tsx
<ResponsiveContainer width="100%" height={220}>
  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
    <XAxis
      dataKey="date"
      tickFormatter={(val) => formatDate(val)}
      tick={{ fontSize: 11 }}
      interval="preserveStartEnd"
    />
    <YAxis
      tickFormatter={(val) => `${val}`}
      tick={{ fontSize: 11 }}
      width={40}
    />
    <Tooltip
      formatter={(value: number) => [`${value} ${unit}`, parameterName]}
      labelFormatter={(label) => formatDateTime(label)}
    />
    <Area
      type="monotone"
      dataKey="value"
      stroke="#1A73E8"
      fill="#EFF6FF"
      dot={false}
      strokeWidth={2}
    />
  </AreaChart>
</ResponsiveContainer>
```

### 3. Chart Data Transformation

Convert `Measurement[]` to Recharts-compatible format:

```ts
interface ChartDataPoint {
  date: string;   // ISO string (used as X axis key)
  value: number;  // measurement value
}

function toChartData(measurements: Measurement[]): ChartDataPoint[] {
  return [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({ date: m.date, value: m.value as number }));
}
```

This function should live in `measurementMapper.ts` or as a local helper in the component.

### 4. Integration in `StationDetailsPanel`

Update `StationDetailsPanel` to:
- Track `selectedSensorId: number | null` in internal state (or receive as prop).
- When a `PollutantCard` is clicked, set `selectedSensorId` to that sensor's id.
- Render `<PollutantChart>` below the pollutant cards grid when a sensor is selected.
- If no sensor is selected, show a hint: "Kliknij kartę czujnika, aby zobaczyć wykres."

### 5. Sensor Selector UX

On desktop: clicking a PollutantCard toggles it as selected and shows the chart.
On mobile: same behaviour, chart appears below the cards.

Indicator: selected PollutantCard has a distinct border (`ring-2 ring-brand`).

---

## Recharts Notes

- Import from `recharts`, not a sub-path.
- `ResponsiveContainer` requires its parent to have a defined height. Use `h-56` or similar on the wrapper div.
- For GIOŚ data: measurements are hourly, typically the last ~24–48 entries. X axis shows every 4th or 6th label to avoid overlap.

---

## Tests to Write in This Phase

### Component Tests

#### `PollutantChart.spec.tsx`

Mock `useSensorMeasurements`:
```ts
vi.mock('@/features/air-quality/hooks/useSensorMeasurements', () => ({
  useSensorMeasurements: vi.fn(),
}));
```

Mock Recharts to avoid SVG rendering issues in jsdom:
```ts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));
```

Tests:
```ts
describe('PollutantChart', () => {
  it('renders chart when data is available', ...)
  it('renders loading state when isLoading is true', ...)
  it('renders error state when error is present', ...)
  it('renders empty state when measurements array is empty', ...)
  it('renders empty state when sensorId is null', ...)
})
```

---

## Acceptance Criteria for Phase 06

- [ ] Clicking a pollutant card shows a line/area chart for that sensor below the cards
- [ ] Chart has X axis (time), Y axis (value), tooltip, and area fill
- [ ] Chart shows correct loading/error/empty states
- [ ] Selecting a different pollutant card switches the chart
- [ ] Chart does not crash for empty measurement arrays
- [ ] All component tests pass
- [ ] Zero TypeScript errors
- [ ] No Recharts console warnings about unknown props
