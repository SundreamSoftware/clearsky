import { describe, it, expect } from 'vitest';
import { mapAqiDto } from './airQualityIndexMapper';
import type { AqiDto } from '../api/gios.dto';

const dto: AqiDto = {
  'AqIndex': {
    'Identyfikator stacji pomiarowej': 114,
    'Data wykonania obliczeń indeksu': '2024-05-04 12:00:00',
    'Wartość indeksu': 1,
    'Nazwa kategorii indeksu': 'Dobry',
    'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st': '2024-05-04 11:00:00',
  },
};

describe('mapAqiDto', () => {
  it('maps indexLevel from Wartość indeksu', () => {
    expect(mapAqiDto(dto).indexLevel).toBe(1);
  });

  it('sets indexLevel to null when Wartość indeksu is null', () => {
    expect(
      mapAqiDto({ 'AqIndex': { ...dto['AqIndex'], 'Wartość indeksu': null } }).indexLevel,
    ).toBeNull();
  });

  it('maps indexName from Nazwa kategorii indeksu', () => {
    expect(mapAqiDto(dto).indexName).toBe('Dobry');
  });

  it('maps calculatedAt from Data wykonania obliczeń indeksu', () => {
    expect(mapAqiDto(dto).calculatedAt).toBe('2024-05-04 12:00:00');
  });
});
