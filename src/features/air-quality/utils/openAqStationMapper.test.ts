import { describe, it, expect } from 'vitest';
import { mapOpenAqLocationToStation } from './openAqStationMapper';
import type { OpenAqLocationDto } from '../api/openAq.dto';

const mockDto: OpenAqLocationDto = {
  id: 12345,
  name: 'Warsaw Central',
  locality: 'Warsaw',
  country: { id: 'PL', name: 'Poland' },
  coordinates: { latitude: 52.23, longitude: 21.01 },
  sensors: [
    { id: 99, name: 'PM2.5 sensor', parameter: { name: 'pm25', displayName: 'PM2.5', units: 'µg/m³' } },
    { id: 100, name: 'NO2 sensor', parameter: { name: 'no2', displayName: 'NO2', units: 'µg/m³' } },
  ],
};

describe('mapOpenAqLocationToStation', () => {
  it('maps id as string', () => {
    const station = mapOpenAqLocationToStation(mockDto);
    expect(station.id).toBe('12345');
    expect(typeof station.id).toBe('string');
  });

  it('sets source to openaq', () => {
    expect(mapOpenAqLocationToStation(mockDto).source).toBe('openaq');
  });

  it('maps country from dto.country.id', () => {
    expect(mapOpenAqLocationToStation(mockDto).country).toBe('PL');
  });

  it('maps coordinates', () => {
    const station = mapOpenAqLocationToStation(mockDto);
    expect(station.latitude).toBe(52.23);
    expect(station.longitude).toBe(21.01);
  });

  it('maps city from locality', () => {
    expect(mapOpenAqLocationToStation(mockDto).city).toBe('Warsaw');
  });

  it('extracts pm25 sensorId', () => {
    expect(mapOpenAqLocationToStation(mockDto).sensorIds?.pm25).toBe(99);
  });

  it('returns undefined sensorIds when no pm25 sensor', () => {
    const dtoWithoutPm25: OpenAqLocationDto = { ...mockDto, sensors: [] };
    expect(mapOpenAqLocationToStation(dtoWithoutPm25).sensorIds).toBeUndefined();
  });
});
