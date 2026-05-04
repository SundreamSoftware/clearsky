export interface AirQualityIndex {
  stationId: string;
  indexLevel: number | null;
  indexName: string | null;
  calculatedAt: string | null;
  sourceDataDate: string | null;
}
