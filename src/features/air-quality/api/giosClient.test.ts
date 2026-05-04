import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from '@/shared/api/httpClient';
import { giosClient } from './giosClient';

vi.mock('@/shared/api/httpClient');

const mockGet = vi.mocked(httpClient.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('giosClient.getStations', () => {
  it('returns mapped stations when API responds with valid v1 data', async () => {
    mockGet.mockResolvedValueOnce({
      'Lista stacji pomiarowych': [
        {
          'Identyfikator stacji': 11,
          'Nazwa stacji': 'Czerniawa',
          'WGS84 φ N': '50.912475',
          'WGS84 λ E': '15.312190',
          'Nazwa miasta': 'Czerniawa',
          'Województwo': 'DOLNOŚLĄSKIE',
          'Ulica': 'ul. Strażacka 7',
        },
      ],
      totalPages: 1,
    });

    const result = await giosClient.getStations();
    expect(result).toHaveLength(1);
    expect(result[0]['Identyfikator stacji']).toBe(11);
  });

  it('throws a ZodError when API returns HTML (wrong proxy URL / misconfigured env)', async () => {
    // Simulate what happens when VITE_GIOS_API_BASE_URL is wrong:
    // Nginx SPA fallback returns index.html → not valid JSON-LD → Zod parse fails.
    mockGet.mockResolvedValueOnce('<!DOCTYPE html><html><body>loading...</body></html>');

    await expect(giosClient.getStations()).rejects.toThrow();
  });

  it('throws a ZodError when API returns the old v0 response shape', async () => {
    // Simulate old /pjp-api/rest endpoint (pre-migration flat array)
    mockGet.mockResolvedValueOnce([
      { id: 114, stationName: 'Warszawa', gegrLat: '52.2', gegrLon: '21.0' },
    ]);

    await expect(giosClient.getStations()).rejects.toThrow();
  });

  it('propagates network errors from httpClient', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(giosClient.getStations()).rejects.toThrow('Network error');
  });

  it('fetches all pages when totalPages > 1', async () => {
    const makeStation = (id: number) => ({
      'Identyfikator stacji': id,
      'Nazwa stacji': `Stacja ${id}`,
      'WGS84 φ N': '50.0',
      'WGS84 λ E': '20.0',
      'Nazwa miasta': 'Miasto',
      'Województwo': 'WOJ',
      'Ulica': null,
    });

    mockGet
      .mockResolvedValueOnce({
        'Lista stacji pomiarowych': [makeStation(1)],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        'Lista stacji pomiarowych': [makeStation(2)],
        totalPages: 2,
      });

    const result = await giosClient.getStations();
    expect(result).toHaveLength(2);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
