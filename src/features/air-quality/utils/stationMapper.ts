import type { StationDto } from '../api/gios.dto';
import type { Station } from '../model/station.types';

export function mapStationDto(dto: StationDto): Station {
  return {
    id: dto.id,
    name: dto.stationName,
    city: dto.city?.name ?? 'Unknown',
    address: dto.addressStreet ?? '',
    latitude: parseFloat(dto.gegrLat),
    longitude: parseFloat(dto.gegrLon),
    voivodeship: dto.city?.commune?.provinceName ?? null,
  };
}

export function mapStationListDto(dtos: StationDto[]): Station[] {
  return dtos.map(mapStationDto);
}
