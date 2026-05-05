import type { WaqiBoundsStationDto } from '../api/waqi.dto';
import type { Station } from '../model/station.types';
import { usAqiToLevel } from './airQualityScale';
import type { AqiLevel } from './airQualityScale';

function parseAqiLevel(aqi: number | string): AqiLevel | null {
  if (typeof aqi === 'number' && aqi >= 0) {
    return usAqiToLevel(aqi);
  }
  return null;
}

export function mapWaqiBoundsStationToStation(dto: WaqiBoundsStationDto): Station {
  return {
    id: `waqi-${dto.uid}`,
    name: dto.station.name,
    city: dto.station.name,
    address: '',
    latitude: dto.lat,
    longitude: dto.lon,
    voivodeship: null,
    source: 'waqi',
    country: null,
    aqiLevel: parseAqiLevel(dto.aqi),
  };
}

export function mapWaqiBoundsStationsToStations(dtos: WaqiBoundsStationDto[]): Station[] {
  return dtos.map(mapWaqiBoundsStationToStation);
}
