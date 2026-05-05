import type { AqiLevel } from '../utils/airQualityScale';

export type StationSource = 'gios' | 'waqi';

export interface Station {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  voivodeship: string | null;
  source: StationSource;
  country: string | null;
  /** Pre-fetched AQI level for WAQI stations (from bounds response). Undefined for GIOŚ. */
  aqiLevel?: AqiLevel | null;
  sensorIds?: { pm25?: number };
}
