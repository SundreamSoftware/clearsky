import type { OpenAqLocationDto } from '../api/openAq.dto';
import type { Station } from '../model/station.types';

export function mapOpenAqLocationToStation(dto: OpenAqLocationDto): Station {
  return {
    id: String(dto.id),
    name: dto.name,
    city: dto.locality ?? dto.country.name,
    address: '',
    latitude: dto.coordinates.latitude,
    longitude: dto.coordinates.longitude,
    voivodeship: null,
    source: 'openaq',
    country: dto.country.id,
  };
}

export function mapOpenAqLocationsToStations(dtos: OpenAqLocationDto[]): Station[] {
  return dtos.map(mapOpenAqLocationToStation);
}
