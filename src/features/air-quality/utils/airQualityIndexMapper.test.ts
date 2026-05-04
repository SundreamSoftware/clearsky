import { describe, it, expect } from 'vitest';
import { mapAqiDto } from './airQualityIndexMapper';
import type { AqiDto } from '../api/gios.dto';

const dto: AqiDto = {
  id: 114,
  stCalcDate: '2024-05-04 12:00:00',
  stIndexLevel: { id: 1, indexLevelName: 'Dobry' },
  stSourceDataDate: '2024-05-04 11:00:00',
};

describe('mapAqiDto', () => {
  it('maps indexLevel from stIndexLevel.id', () => {
    expect(mapAqiDto(dto).indexLevel).toBe(1);
  });

  it('sets indexLevel to null when stIndexLevel is null', () => {
    expect(mapAqiDto({ ...dto, stIndexLevel: null }).indexLevel).toBeNull();
  });

  it('maps indexName from stIndexLevel.indexLevelName', () => {
    expect(mapAqiDto(dto).indexName).toBe('Dobry');
  });

  it('maps calculatedAt from stCalcDate', () => {
    expect(mapAqiDto(dto).calculatedAt).toBe('2024-05-04 12:00:00');
  });
});
