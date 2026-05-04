import type React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Measurement } from '@/features/air-quality/model/measurement.types';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

vi.mock('@/features/air-quality/hooks/useSensorMeasurements', () => ({
  useSensorMeasurements: vi.fn(),
}));

import { useSensorMeasurements } from '@/features/air-quality/hooks/useSensorMeasurements';
import { PollutantChart } from './PollutantChart';

const mockUseSensorMeasurements = vi.mocked(useSensorMeasurements);

const mockMeasurements: Measurement[] = [
  { sensorId: 101, date: '2024-05-04 10:00:00', value: 10.5, unit: 'µg/m³' },
  { sensorId: 101, date: '2024-05-04 11:00:00', value: 12.3, unit: 'µg/m³' },
  { sensorId: 101, date: '2024-05-04 12:00:00', value: 9.8, unit: 'µg/m³' },
];

describe('PollutantChart', () => {
  it('renders chart when data is available', () => {
    mockUseSensorMeasurements.mockReturnValue({
      data: mockMeasurements,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSensorMeasurements>);

    render(
      <PollutantChart
        sensorId={101}
        parameterCode="PM2.5"
        parameterName="PM2.5"
        unit="µg/m³"
      />,
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    mockUseSensorMeasurements.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSensorMeasurements>);

    render(
      <PollutantChart
        sensorId={101}
        parameterCode="PM2.5"
        parameterName="PM2.5"
        unit="µg/m³"
      />,
    );

    expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument();
  });

  it('renders error state when error is present', () => {
    mockUseSensorMeasurements.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('fail'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSensorMeasurements>);

    render(
      <PollutantChart
        sensorId={101}
        parameterCode="PM2.5"
        parameterName="PM2.5"
        unit="µg/m³"
      />,
    );

    expect(screen.getByText(/Błąd/i)).toBeInTheDocument();
  });

  it('renders empty state when measurements array is empty', () => {
    mockUseSensorMeasurements.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSensorMeasurements>);

    render(
      <PollutantChart
        sensorId={101}
        parameterCode="PM2.5"
        parameterName="PM2.5"
        unit="µg/m³"
      />,
    );

    expect(screen.getByText(/Brak danych/i)).toBeInTheDocument();
  });

  it('renders nothing when sensorId is null', () => {
    mockUseSensorMeasurements.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSensorMeasurements>);

    const { container } = render(
      <PollutantChart
        sensorId={null}
        parameterCode="PM2.5"
        parameterName="PM2.5"
        unit="µg/m³"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
