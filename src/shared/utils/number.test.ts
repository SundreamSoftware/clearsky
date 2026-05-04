import { describe, expect, it } from 'vitest';
import { formatNumber } from './number';

describe('formatNumber', () => {
  it('formats numbers with default decimals', () => {
    expect(formatNumber(12.345)).toBe('12.35');
  });

  it('supports custom decimal precision', () => {
    expect(formatNumber(12.345, 1)).toBe('12.3');
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0.00');
  });
});
