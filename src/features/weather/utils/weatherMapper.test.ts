import { describe, it, expect } from 'vitest';
import { mapOpenMeteoCurrentDto, mapOpenMeteoHourlyDto } from './weatherMapper';
import type { OpenMeteoCurrentDto, OpenMeteoHourlyDto } from '../api/openMeteo.dto';

const mockDto: OpenMeteoCurrentDto = {
  latitude: 52.23,
  longitude: 21.01,
  current: {
    time: '2024-05-04T12:00',
    temperature_2m: 19.5,
    relative_humidity_2m: 63,
    surface_pressure: 997.2,
    wind_speed_10m: 5.8,
    wind_direction_10m: 171,
  },
};

describe('mapOpenMeteoCurrentDto', () => {
  it('maps latitude and longitude', () => {
    const result = mapOpenMeteoCurrentDto(mockDto);
    expect(result.latitude).toBe(52.23);
    expect(result.longitude).toBe(21.01);
  });

  it('maps temperature from current.temperature_2m', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).temperature).toBe(19.5);
  });

  it('maps humidity from current.relative_humidity_2m', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).humidity).toBe(63);
  });

  it('maps pressure from current.surface_pressure', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).pressure).toBe(997.2);
  });

  it('maps windSpeed from current.wind_speed_10m', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).windSpeed).toBe(5.8);
  });

  it('maps windDirection from current.wind_direction_10m', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).windDirection).toBe(171);
  });

  it('maps fetchedAt from current.time', () => {
    expect(mapOpenMeteoCurrentDto(mockDto).fetchedAt).toBe('2024-05-04T12:00');
  });
});

const mockHourlyDto: OpenMeteoHourlyDto = {
  latitude: 52.23,
  longitude: 21.01,
  hourly: {
    time: ['2024-05-03T00:00', '2024-05-03T01:00'],
    temperature_2m: [15.2, 14.8],
    relative_humidity_2m: [70, 72],
    wind_speed_10m: [8.0, 7.5],
  },
};

describe('mapOpenMeteoHourlyDto', () => {
  it('maps time array', () => {
    const result = mapOpenMeteoHourlyDto(mockHourlyDto);
    expect(result.time).toEqual(['2024-05-03T00:00', '2024-05-03T01:00']);
  });

  it('maps temperature array', () => {
    expect(mapOpenMeteoHourlyDto(mockHourlyDto).temperature).toEqual([15.2, 14.8]);
  });

  it('maps humidity array', () => {
    expect(mapOpenMeteoHourlyDto(mockHourlyDto).humidity).toEqual([70, 72]);
  });

  it('maps windSpeed array', () => {
    expect(mapOpenMeteoHourlyDto(mockHourlyDto).windSpeed).toEqual([8.0, 7.5]);
  });
});
