import { describe, it, expect } from 'vitest';
import { formatMeasurementValue } from './measurementFormatter';

describe('formatMeasurementValue', () => {
  it('formats value with unit', () => {
    expect(formatMeasurementValue(12.5, 'µg/m³')).toBe('12.50 µg/m³');
  });

  it('returns dash for null value', () => {
    expect(formatMeasurementValue(null, 'µg/m³')).toBe('—');
  });
});
