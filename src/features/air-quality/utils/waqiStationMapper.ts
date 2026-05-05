import type { WaqiBoundsStationDto } from '../api/waqi.dto';
import type { Station } from '../model/station.types';
import { usAqiToLevel } from './airQualityScale';
import type { AqiLevel } from './airQualityScale';

function parseAqiLevel(aqi: number | string): AqiLevel | null {
  const value = typeof aqi === 'string' ? parseInt(aqi, 10) : aqi;
  if (typeof value === 'number' && !isNaN(value) && value >= 0) {
    return usAqiToLevel(value);
  }
  return null;
}

function parseRawAqi(aqi: number | string): number | null {
  const value = typeof aqi === 'string' ? parseInt(aqi, 10) : aqi;
  return typeof value === 'number' && !isNaN(value) && value >= 0 ? value : null;
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
    rawAqi: parseRawAqi(dto.aqi),
  };
}

export function mapWaqiBoundsStationsToStations(dtos: WaqiBoundsStationDto[]): Station[] {
  return dtos.map(mapWaqiBoundsStationToStation);
}
