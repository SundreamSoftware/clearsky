import { describe, it, expect } from 'vitest';
import { filterStations } from './stationFilters';
import type { Station } from '../model/station.types';

const stations: Station[] = [
  {
    id: 1,
    name: 'Warszawa-Marszałkowska',
    city: 'Warszawa',
    address: '',
    latitude: 52.2,
    longitude: 21,
    voivodeship: null,
  },
  {
    id: 2,
    name: 'Kraków-Aleje Krasińskiego',
    city: 'Kraków',
    address: '',
    latitude: 50,
    longitude: 19.9,
    voivodeship: null,
  },
];

describe('filterStations', () => {
  it('filters by city name (case-insensitive)', () => {
    expect(filterStations(stations, 'warszawa')).toHaveLength(1);
  });

  it('filters by station name', () => {
    expect(filterStations(stations, 'Krasińskiego')).toHaveLength(1);
  });

  it('returns all stations when query is empty', () => {
    expect(filterStations(stations, '')).toHaveLength(2);
  });

  it('returns empty array when no match', () => {
    expect(filterStations(stations, 'Gdańsk')).toHaveLength(0);
  });
});
