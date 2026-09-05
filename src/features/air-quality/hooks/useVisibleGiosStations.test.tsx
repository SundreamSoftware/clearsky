import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import { giosClient } from '../api/giosClient';
import type { AqiDto } from '../api/gios.dto';
import type { Station } from '../model/station.types';
import { useVisibleGiosStations } from './useVisibleGiosStations';

vi.mock('../api/giosClient', () => ({
  giosClient: { getAirQualityIndex: vi.fn() },
}));

it('limits in-flight requests, renders valid readings progressively and skips queued work after cancellation', async () => {
  const pending: ((value: AqiDto) => void)[] = [];
  vi.mocked(giosClient.getAirQualityIndex).mockImplementation(
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const stations: Station[] = Array.from({ length: 7 }, (_, id) => ({
    id: String(id),
    name: 'Test',
    city: 'Test',
    address: '',
    latitude: 52,
    longitude: 19,
    voivodeship: null,
    source: 'gios',
    country: 'PL',
  }));
  stations.push({ ...stations[0], id: 'outside', latitude: 40 });
  const bounds = { minLat: 49, maxLat: 55, minLon: 14, maxLon: 25 };
  const { result, rerender, unmount } = renderHook(
    ({ enabled }) => useVisibleGiosStations(stations, bounds, enabled),
    { wrapper, initialProps: { enabled: true } },
  );
  await waitFor(() =>
    expect(giosClient.getAirQualityIndex).toHaveBeenCalledTimes(4),
  );
  const dto: AqiDto = {
    AqIndex: {
      'Identyfikator stacji pomiarowej': 0,
      'Wartość indeksu': 0,
      'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st':
        new Date().toISOString(),
    },
  };
  await act(async () => pending[0](dto));
  await waitFor(() => expect(result.current.stations).toHaveLength(1));
  expect(giosClient.getAirQualityIndex).toHaveBeenCalledTimes(5);
  rerender({ enabled: false });
  await act(async () => {
    pending.slice(1).forEach((resolve) => resolve(dto));
  });
  expect(giosClient.getAirQualityIndex).toHaveBeenCalledTimes(5);
  expect(result.current.stations).toEqual([]);
  unmount();
  queryClient.clear();
});
