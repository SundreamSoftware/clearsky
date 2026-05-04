import type { AqiDto } from '../api/gios.dto';
import type { AirQualityIndex } from '../model/airQualityIndex.types';

export function mapAqiDto(dto: AqiDto): AirQualityIndex {
  return {
    stationId: dto.id,
    indexLevel: dto.stIndexLevel?.id ?? null,
    indexName: dto.stIndexLevel?.indexLevelName ?? null,
    calculatedAt: dto.stCalcDate,
    sourceDataDate: dto.stSourceDataDate ?? null,
  };
}
