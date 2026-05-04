import { describe, it, expect } from 'vitest';
import { getAqiInfo, UNKNOWN_AQI, AQI_SCALE } from './airQualityScale';

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
