import { describe, it, expect } from 'vitest';
import {
  mapWaqiBoundsStationToStation,
  mapWaqiBoundsStationsToStations,
} from './waqiStationMapper';
import type { WaqiBoundsStationDto } from '../api/waqi.dto';

const makeDto = (overrides: Partial<WaqiBoundsStationDto> = {}): WaqiBoundsStationDto => ({
  uid: 1234,
  aqi: 42,
  lat: 52.23,
  lon: 21.01,
  station: { name: 'Warsaw Test Station' },
  ...overrides,
});

describe('mapWaqiBoundsStationToStation', () => {
  it('maps uid to prefixed string id', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ uid: 99 }));
    expect(station.id).toBe('waqi-99');
  });

  it('uses station name for both name and city', () => {
    const station = mapWaqiBoundsStationToStation(makeDto());
    expect(station.name).toBe('Warsaw Test Station');
    expect(station.city).toBe('Warsaw Test Station');
  });

  it('maps lat/lon correctly', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ lat: 50.1, lon: 18.5 }));
    expect(station.latitude).toBe(50.1);
    expect(station.longitude).toBe(18.5);
  });

  it('sets source to waqi', () => {
    const station = mapWaqiBoundsStationToStation(makeDto());
    expect(station.source).toBe('waqi');
  });

  it('converts numeric AQI to aqiLevel 0 (good) for AQI 42', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ aqi: 42 }));
    expect(station.aqiLevel).toBe(0);
  });

  it('converts AQI 75 to aqiLevel 1 (moderate)', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ aqi: 75 }));
    expect(station.aqiLevel).toBe(1);
  });

  it('converts AQI 155 to aqiLevel 3 (unhealthy)', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ aqi: 155 }));
    expect(station.aqiLevel).toBe(3);
  });

  it('returns null aqiLevel for string "-" (no data)', () => {
    const station = mapWaqiBoundsStationToStation(makeDto({ aqi: '-' }));
    expect(station.aqiLevel).toBeNull();
  });

  it('sets address to empty string', () => {
    const station = mapWaqiBoundsStationToStation(makeDto());
    expect(station.address).toBe('');
  });

  it('sets voivodeship and country to null', () => {
    const station = mapWaqiBoundsStationToStation(makeDto());
    expect(station.voivodeship).toBeNull();
    expect(station.country).toBeNull();
  });
});

describe('mapWaqiBoundsStationsToStations', () => {
  it('maps array of DTOs to stations', () => {
    const dtos = [makeDto({ uid: 1 }), makeDto({ uid: 2 })];
    const stations = mapWaqiBoundsStationsToStations(dtos);
    expect(stations).toHaveLength(2);
    expect(stations[0].id).toBe('waqi-1');
    expect(stations[1].id).toBe('waqi-2');
  });

  it('returns empty array for empty input', () => {
    expect(mapWaqiBoundsStationsToStations([])).toEqual([]);
  });
});
