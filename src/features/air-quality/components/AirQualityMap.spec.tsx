import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Station } from '@/features/air-quality/model/station.types';
import { AirQualityMap } from './AirQualityMap';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({
    children,
    eventHandlers,
    pathOptions,
  }: {
    children?: ReactNode;
    eventHandlers?: { click?: () => void };
    pathOptions?: { fillColor?: string };
  }) => (
    <div
      data-testid="marker"
      data-fill={pathOptions?.fillColor}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn(), flyTo: vi.fn() }),
}));

const mockStations: Station[] = [
  {
    id: 1,
    name: 'Warszawa-Test',
    city: 'Warszawa',
    address: '',
    latitude: 52.2,
    longitude: 21.0,
    voivodeship: null,
  },
  {
    id: 2,
    name: 'Kraków-Test',
    city: 'Kraków',
    address: '',
    latitude: 50.0,
    longitude: 19.9,
    voivodeship: null,
  },
];

describe('AirQualityMap', () => {
  it('renders map container', () => {
    render(
      <AirQualityMap
        stations={[]}
        selectedStationId={null}
        onStationSelect={() => {}}
        isLoading={false}
        error={null}
      />,
    );

    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <AirQualityMap
        stations={[]}
        selectedStationId={null}
        onStationSelect={() => {}}
        isLoading={true}
        error={null}
      />,
    );

    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
  });

  it('shows error state when error is provided', () => {
    render(
      <AirQualityMap
        stations={[]}
        selectedStationId={null}
        onStationSelect={() => {}}
        isLoading={false}
        error={new Error('Network error')}
      />,
    );

    expect(screen.getByText(/nie udało się/i)).toBeInTheDocument();
  });

  it('renders correct number of markers', () => {
    render(
      <AirQualityMap
        stations={mockStations}
        selectedStationId={null}
        onStationSelect={() => {}}
        isLoading={false}
        error={null}
      />,
    );

    expect(screen.getAllByTestId('marker')).toHaveLength(2);
  });
});
