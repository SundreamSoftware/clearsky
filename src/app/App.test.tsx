import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
  Tooltip: () => null,
}));

vi.mock('@/features/air-quality/hooks/useStations', () => ({
  useStations: () => ({ data: [], isLoading: false, error: null }),
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
