import { describe, it, expect } from 'vitest';
import { mapSensorDto, resolveUnit } from './sensorMapper';
import type { SensorDto } from '../api/gios.dto';

const dto: SensorDto = {
  'Identyfikator stanowiska': 101,
  'Identyfikator stacji': 114,
  'Wskaźnik': 'pył zawieszony PM2.5',
  'Wskaźnik - kod': 'PM2.5',
  'Wskaźnik - wzór': 'PM2,5',
  'Id wskaźnika': 69,
};

describe('mapSensorDto', () => {
  it('maps id and stationId', () => {
    const sensor = mapSensorDto(dto);
    expect(sensor.id).toBe(101);
    expect(sensor.stationId).toBe(114);
  });

  it('resolves unit from paramCode', () => {
    expect(resolveUnit('PM2.5')).toBe('µg/m³');
    expect(resolveUnit('CO')).toBe('mg/m³');
  });

  it('falls back to empty string for unknown paramCode', () => {
    expect(resolveUnit('UNKNOWN')).toBe('');
  });
});
