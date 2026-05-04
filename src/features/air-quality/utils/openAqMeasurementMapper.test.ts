import { describe, it, expect } from 'vitest';
import { mapOpenAqMeasurements } from './openAqMeasurementMapper';
import type { OpenAqMeasurementDto } from '../api/openAq.dto';

const mockDtos: OpenAqMeasurementDto[] = [
  {
    value: 15.4,
    period: {
      datetimeFrom: { utc: '2024-05-04T10:00:00Z' },
      datetimeTo: { utc: '2024-05-04T11:00:00Z' },
    },
    parameter: { name: 'pm25', displayName: 'PM2.5', units: 'µg/m³' },
  },
  {
    value: null,
    period: {
      datetimeFrom: { utc: '2024-05-04T09:00:00Z' },
      datetimeTo: { utc: '2024-05-04T10:00:00Z' },
    },
    parameter: { name: 'pm25', displayName: 'PM2.5', units: 'µg/m³' },
  },
];

describe('mapOpenAqMeasurements', () => {
  it('filters out measurements with null value', () => {
    const result = mapOpenAqMeasurements(mockDtos, 99);
    expect(result).toHaveLength(1);
  });

  it('maps value correctly', () => {
    const result = mapOpenAqMeasurements(mockDtos, 99);
    expect(result[0].value).toBe(15.4);
  });

  it('maps date from datetimeTo.utc', () => {
    const result = mapOpenAqMeasurements(mockDtos, 99);
    expect(result[0].date).toBe('2024-05-04T11:00:00Z');
  });

  it('maps unit from parameter.units', () => {
    const result = mapOpenAqMeasurements(mockDtos, 99);
    expect(result[0].unit).toBe('µg/m³');
  });

  it('maps sensorId', () => {
    const result = mapOpenAqMeasurements(mockDtos, 99);
    expect(result[0].sensorId).toBe(99);
  });
});
