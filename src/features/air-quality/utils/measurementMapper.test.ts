import { describe, it, expect } from 'vitest';
import { mapMeasurementsDto } from './measurementMapper';
import type { MeasurementsDto } from '../api/gios.dto';

const dto: MeasurementsDto = {
  'Lista danych pomiarowych': [
    { 'Data': '2024-05-04 12:00:00', 'Wartość': 15.3 },
    { 'Data': '2024-05-04 11:00:00', 'Wartość': null },
  ],
};

describe('mapMeasurementsDto', () => {
  it('maps non-null values', () => {
    expect(mapMeasurementsDto(dto, 101, 'PM2.5')).toHaveLength(1);
  });

  it('filters out null values', () => {
    const result = mapMeasurementsDto(dto, 101, 'PM2.5');
    expect(result.every((measurement) => measurement.value !== null)).toBe(true);
  });

  it('sets sensorId correctly', () => {
    expect(mapMeasurementsDto(dto, 101, 'PM2.5')[0].sensorId).toBe(101);
  });
});
