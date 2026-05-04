import type { AqiDto } from '../api/gios.dto';
import type { AirQualityIndex } from '../model/airQualityIndex.types';

export function mapAqiDto(dto: AqiDto): AirQualityIndex {
  const index = dto['AqIndex'];
  return {
    stationId: index['Identyfikator stacji pomiarowej'],
    indexLevel: index['Wartość indeksu'] ?? null,
    indexName: index['Nazwa kategorii indeksu'] ?? null,
    calculatedAt: index['Data wykonania obliczeń indeksu'] ?? null,
    sourceDataDate:
      index[
        'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st'
      ] ?? null,
  };
}
