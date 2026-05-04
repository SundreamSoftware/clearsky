export interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  voivodeship: string | null;
}
