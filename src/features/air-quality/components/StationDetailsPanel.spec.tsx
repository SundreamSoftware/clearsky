import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Station } from '@/features/air-quality/model/station.types';
import type { Sensor } from '@/features/air-quality/model/sensor.types';
import { StationDetailsPanel } from './StationDetailsPanel';

vi.mock('@/features/air-quality/hooks/useAirQualityIndex', () => ({
  useAirQualityIndex: vi.fn(),
}));
vi.mock('@/features/air-quality/hooks/useStationSensors', () => ({
  useStationSensors: vi.fn(),
}));
vi.mock('@/features/air-quality/hooks/useSensorMeasurements', () => ({
  useSensorMeasurements: vi.fn(),
}));

import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { useSensorMeasurements } from '@/features/air-quality/hooks/useSensorMeasurements';
import { useStationSensors } from '@/features/air-quality/hooks/useStationSensors';

const mockUseAirQualityIndex = vi.mocked(useAirQualityIndex);
const mockUseStationSensors = vi.mocked(useStationSensors);
const mockUseSensorMeasurements = vi.mocked(useSensorMeasurements);

const mockStation: Station = {
  id: '1',
  name: 'Warszawa - Centrum',
  city: 'Warszawa',
  address: 'ul. Centralna 1',
  latitude: 52.2,
  longitude: 21,
  voivodeship: null,
  source: 'gios',
  country: 'PL',
};

const mockSensors: Sensor[] = [
  {
    id: 101,
    stationId: 1,
    parameterCode: 'PM2.5',
    parameterName: 'Pył zawieszony PM2.5',
    unit: 'µg/m³',
  },
  {
    id: 102,
    stationId: 1,
    parameterCode: 'PM10',
    parameterName: 'Pył zawieszony PM10',
    unit: 'µg/m³',
  },
];

beforeEach(() => {
  mockUseAirQualityIndex.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useAirQualityIndex>);
  mockUseStationSensors.mockReturnValue({
    data: mockSensors,
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useStationSensors>);
  mockUseSensorMeasurements.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useSensorMeasurements>);
});

describe('StationDetailsPanel', () => {
  it('renders nothing when station is null', () => {
    const { container } = render(
      <StationDetailsPanel
        station={null}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders station name and city', () => {
    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Warszawa - Centrum')).toBeInTheDocument();
    expect(screen.getByText('Warszawa, ul. Centralna 1')).toBeInTheDocument();
  });

  it('renders AQI badge when AQI data is available', () => {
    mockUseAirQualityIndex.mockReturnValue({
      data: { indexLevel: 1, indexName: 'Dobry', stationId: 1, calculatedAt: null, sourceDataDate: null },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAirQualityIndex>);

    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('Dobry')).toBeInTheDocument();
  });

  it('shows loading state for AQI', () => {
    mockUseAirQualityIndex.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useAirQualityIndex>);

    const { container } = render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error state for AQI', () => {
    mockUseAirQualityIndex.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('fail'),
    } as unknown as ReturnType<typeof useAirQualityIndex>);

    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(/Błąd/i)).toBeInTheDocument();
  });

  it('renders pollutant cards for sensors', () => {
    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getAllByTestId('pollutant-card')).toHaveLength(2);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();

    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByLabelText('Zamknij szczegóły stacji'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSensorSelect when pollutant card is clicked', () => {
    const onSensorSelect = vi.fn();

    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={onSensorSelect}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getAllByTestId('pollutant-card')[0]);
    expect(onSensorSelect).toHaveBeenCalledWith(101);
  });

  it('renders chart hint when no sensor is selected', () => {
    render(
      <StationDetailsPanel
        station={mockStation}
        selectedSensorId={null}
        onSensorSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(/Kliknij kartę/i)).toBeInTheDocument();
  });
});
