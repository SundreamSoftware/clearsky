import type { OpenAqLocationDto } from '../api/openAq.dto';
import type { Station } from '../model/station.types';

function extractPm25SensorId(dto: OpenAqLocationDto): number | undefined {
  const pm25Sensor = dto.sensors?.find(
    (s) => s.parameter?.name === 'pm25' || s.name?.toLowerCase().includes('pm2.5'),
  );
  return pm25Sensor?.id;
}

export function mapOpenAqLocationToStation(dto: OpenAqLocationDto): Station {
  const pm25Id = extractPm25SensorId(dto);
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
    sensorIds: pm25Id !== undefined ? { pm25: pm25Id } : undefined,
  };
}

export function mapOpenAqLocationsToStations(dtos: OpenAqLocationDto[]): Station[] {
  return dtos.map(mapOpenAqLocationToStation);
}
