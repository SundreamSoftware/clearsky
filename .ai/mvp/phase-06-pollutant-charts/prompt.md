# Phase 06 — Pollutant Charts Implementation Prompt

You are a senior React/TypeScript engineer implementing pollutant trend charts for **ClearSky**, an air quality dashboard for Poland.

Phases 01–05 are complete. The station details panel shows AQI and pollutant cards. Clicking a card needs to show a trend chart.

## Your Task

Implement `PollutantChart` and integrate it into `StationDetailsPanel` as described in `readme.md` in this folder.

## Key Deliverables

1. `PollutantChart` component using Recharts `AreaChart`
2. `toChartData()` helper to convert `Measurement[]` to chart-compatible format
3. Updated `StationDetailsPanel` to manage `selectedSensorId` and render the chart
4. All component tests with mocked Recharts and mocked hooks

## Chart Requirements

- `<AreaChart>` with `<ResponsiveContainer width="100%" height={220}>`
- Sorted by date ascending
- X axis: dates formatted with `formatDate()` from `shared/utils/dateTime.ts`
- Y axis: numeric values, 40px width
- Tooltip: shows `value + unit` and full date/time
- `dot={false}` on the Area line (cleaner look for dense data)
- Brand colour `#1A73E8` for stroke, `#EFF6FF` for fill

## Data Notes

GIOŚ measurement data format from `/data/getData/{sensorId}`:
```json
{
  "key": "PM2.5",
  "values": [
    { "date": "2024-05-04 12:00:00", "value": 12.5 },
    { "date": "2024-05-04 11:00:00", "value": null },
    { "date": "2024-05-04 10:00:00", "value": 10.1 }
  ]
}
```

The mapper already filters out null values. The chart receives only non-null measurements.

## Constraints

1. `PollutantChart` must handle `sensorId === null` gracefully (renders nothing or empty state).
2. Do NOT import Recharts components into component tests — mock the entire `recharts` module.
3. The chart wrapper div must have an explicit height (e.g. `h-56`) so `ResponsiveContainer` works.
4. Sort measurements by date ascending before rendering — GIOŚ returns them newest-first.
5. Use `formatDate` from `src/shared/utils/dateTime.ts` for X axis labels.

## Verification

1. `npm run dev` → select a station → click PM2.5 card → chart appears with trend line
2. Click PM10 card → chart switches to PM10 data
3. `npm run test` — all chart tests pass
4. `npm run build` — zero TypeScript errors
5. Manual: select a station with no data → "Brak danych" message in chart area
