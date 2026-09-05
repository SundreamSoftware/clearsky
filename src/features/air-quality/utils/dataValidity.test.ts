import { describe, expect, it } from 'vitest';
import {
  giosTimestamp,
  isCurrentReading,
  MAX_READING_AGE_MS,
  parseAqi,
} from './dataValidity';

describe('measurement validity', () => {
  it.each(['', ' ', '-', '12abc', -1, Infinity, NaN, null, undefined])(
    'rejects invalid AQI %s',
    (value) => {
      expect(parseAqi(value)).toBeNull();
    },
  );
  it('retains a measured zero', () => {
    expect(parseAqi('0')).toBe(0);
  });
  it('checks freshness boundaries, invalid dates and future timestamps', () => {
    const now = Date.parse('2026-09-05T20:00:00Z');
    expect(
      isCurrentReading(new Date(now - MAX_READING_AGE_MS).toISOString(), now),
    ).toBe(true);
    expect(
      isCurrentReading(
        new Date(now - MAX_READING_AGE_MS - 1).toISOString(),
        now,
      ),
    ).toBe(false);
    expect(isCurrentReading('invalid', now)).toBe(false);
    expect(isCurrentReading('2026-09-05T21:00:00Z', now)).toBe(false);
    expect(isCurrentReading('2026-09-06T05:00:00+09:00', now)).toBe(true);
  });
  it('interprets GIOŚ timestamps in Warsaw in summer and winter', () => {
    expect(giosTimestamp('2026-09-05 23:00:00')).toBe(
      '2026-09-05T21:00:00.000Z',
    );
    expect(giosTimestamp('2026-01-05 23:00:00')).toBe(
      '2026-01-05T22:00:00.000Z',
    );
    expect(giosTimestamp('2026-09-05T21:00:00Z')).toBe('2026-09-05T21:00:00Z');
    expect(giosTimestamp('invalid')).toBeNull();
  });
});
