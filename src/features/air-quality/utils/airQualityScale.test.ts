import { describe, it, expect } from 'vitest';
import { getAqiInfo, UNKNOWN_AQI, AQI_SCALE, pm25ToAqiLevel, usAqiToLevel } from './airQualityScale';

describe('getAqiInfo', () => {
  it('returns correct colour for level 0', () => {
    expect(getAqiInfo(0)).toEqual(AQI_SCALE[0]);
  });

  it('returns correct colour for level 5', () => {
    expect(getAqiInfo(5)).toEqual(AQI_SCALE[5]);
  });

  it('returns UNKNOWN_AQI for null', () => {
    expect(getAqiInfo(null)).toEqual(UNKNOWN_AQI);
  });

  it('returns UNKNOWN_AQI for out-of-range value', () => {
    expect(getAqiInfo(99)).toEqual(UNKNOWN_AQI);
  });
});

describe('pm25ToAqiLevel', () => {
  it('returns 0 for PM2.5 <= 12 (good)', () => {
    expect(pm25ToAqiLevel(0)).toBe(0);
    expect(pm25ToAqiLevel(12)).toBe(0);
  });

  it('returns 1 for PM2.5 12–35 (moderate)', () => {
    expect(pm25ToAqiLevel(13)).toBe(1);
    expect(pm25ToAqiLevel(35)).toBe(1);
  });

  it('returns 2 for PM2.5 35–55', () => {
    expect(pm25ToAqiLevel(36)).toBe(2);
    expect(pm25ToAqiLevel(55)).toBe(2);
  });

  it('returns 3 for PM2.5 55–150', () => {
    expect(pm25ToAqiLevel(56)).toBe(3);
    expect(pm25ToAqiLevel(150)).toBe(3);
  });

  it('returns 4 for PM2.5 150–250', () => {
    expect(pm25ToAqiLevel(151)).toBe(4);
    expect(pm25ToAqiLevel(250)).toBe(4);
  });

  it('returns 5 for PM2.5 > 250 (hazardous)', () => {
    expect(pm25ToAqiLevel(251)).toBe(5);
    expect(pm25ToAqiLevel(500)).toBe(5);
  });
});

describe('usAqiToLevel', () => {
  it('returns 0 for AQI <= 50', () => {
    expect(usAqiToLevel(0)).toBe(0);
    expect(usAqiToLevel(50)).toBe(0);
  });

  it('returns 1 for AQI 50–100', () => {
    expect(usAqiToLevel(51)).toBe(1);
    expect(usAqiToLevel(100)).toBe(1);
  });

  it('returns 5 for AQI > 300', () => {
    expect(usAqiToLevel(301)).toBe(5);
  });
});
