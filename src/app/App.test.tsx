import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// useTheme calls window.matchMedia for prefers-color-scheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
  Tooltip: () => null,
  useMap: () => ({ flyTo: vi.fn(), getBounds: () => ({ getWest: () => 0, getSouth: () => 0, getEast: () => 10, getNorth: () => 10 }) }),
  useMapEvents: () => null,
}));

vi.mock('@/features/air-quality/hooks/useStations', () => ({
  useStations: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock('@/features/air-quality/hooks/useGlobalStations', () => ({
  useGlobalStations: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock('@/features/air-quality/hooks/useAirQualityIndex', () => ({
  useAirQualityIndex: () => ({ data: null, isLoading: false, error: null }),
}));

vi.mock('@/features/air-quality/hooks/useStationSensors', () => ({
  useStationSensors: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock('@/features/air-quality/hooks/useSensorMeasurements', () => ({
  useSensorMeasurements: () => ({ data: [], isLoading: false, error: null }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

test('renders ClearSky header', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );

  expect(screen.getByText(/clearsky/i)).toBeInTheDocument();
});
