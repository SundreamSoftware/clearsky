export interface AirQualityIndex {
  stationId: number;
  indexLevel: number | null;
  indexName: string | null;
  calculatedAt: string | null;
  sourceDataDate: string | null;
}
