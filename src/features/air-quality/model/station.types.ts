export type StationSource = 'gios' | 'openaq';

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
  sensorIds?: { pm25?: number };
}
