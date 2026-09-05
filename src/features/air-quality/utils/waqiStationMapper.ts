import type { WaqiBoundsStationDto } from '../api/waqi.dto';
import type { Station } from '../model/station.types';
import { usAqiToLevel } from './airQualityScale';
import { parseAqi, isCurrentReading } from './dataValidity';

export function mapWaqiBoundsStationToStation(
  dto: WaqiBoundsStationDto,
): Station {
  const rawAqi = parseAqi(dto.aqi);
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
    aqiLevel: rawAqi === null ? null : usAqiToLevel(rawAqi),
    rawAqi,
    observedAt: typeof dto.station.time === 'string' ? dto.station.time : null,
  };
}

export function mapWaqiBoundsStationsToStations(
  dtos: WaqiBoundsStationDto[],
): Station[] {
  return Array.from(
    new Map(
      dtos
        .map(mapWaqiBoundsStationToStation)
        .filter(
          (station) =>
            station.aqiLevel != null &&
            isCurrentReading(station.observedAt) &&
            Number.isFinite(station.latitude) &&
            Math.abs(station.latitude) <= 90 &&
            Number.isFinite(station.longitude) &&
            Math.abs(station.longitude) <= 180,
        )
        .map((station) => [station.id, station]),
    ).values(),
  );
}
