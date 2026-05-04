import { describe, it, expect } from 'vitest';
import { mapMeasurementsDto } from './measurementMapper';
import type { MeasurementsDto } from '../api/gios.dto';

const dto: MeasurementsDto = {
  key: 'PM2.5',
  values: [
    { date: '2024-05-04 12:00:00', value: 15.3 },
    { date: '2024-05-04 11:00:00', value: null },
  ],
};

describe('mapMeasurementsDto', () => {
  it('maps non-null values', () => {
    expect(mapMeasurementsDto(dto, 101)).toHaveLength(1);
  });

  it('filters out null values', () => {
    const result = mapMeasurementsDto(dto, 101);
    expect(result.every((measurement) => measurement.value !== null)).toBe(true);
  });

  it('sets sensorId correctly', () => {
    expect(mapMeasurementsDto(dto, 101)[0].sensorId).toBe(101);
  });
});
