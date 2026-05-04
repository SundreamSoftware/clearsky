import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './dateTime';

describe('dateTime utils', () => {
  it('formats ISO date strings to a short date', () => {
    expect(formatDate('2024-05-04T12:00:00')).toBe('04.05.2024');
  });

  it('formats ISO date strings to date and time', () => {
    expect(formatDateTime('2024-05-04T12:00:00')).toBe('04.05.2024 12:00');
  });

  it('formats GIOŚ space-separated date strings', () => {
    expect(formatDateTime('2024-05-04 12:00:00')).toBe('04.05.2024 12:00');
    expect(formatDate('2024-05-04 12:00:00')).toBe('04.05.2024');
  });

  it('returns the original value for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
  });
});
