import type { StationDto } from '../api/gios.dto';
import type { Station } from '../model/station.types';

export function mapStationDto(dto: StationDto): Station {
  return {
    id: dto['Identyfikator stacji'],
    name: dto['Nazwa stacji'],
    city: dto['Nazwa miasta'] ?? 'Unknown',
    address: dto['Ulica'] ?? '',
    latitude: parseFloat(dto['WGS84 φ N']),
    longitude: parseFloat(dto['WGS84 λ E']),
    voivodeship: dto['Województwo'] ?? null,
  };
}

export function mapStationListDto(dtos: StationDto[]): Station[] {
  return dtos.map(mapStationDto);
}
