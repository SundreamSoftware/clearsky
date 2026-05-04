import { describe, it, expect } from 'vitest';
import { mapStationDto } from './stationMapper';
import type { StationDto } from '../api/gios.dto';

const dto: StationDto = {
  id: 114,
  stationName: 'Warszawa-Komunikacyjna',
  gegrLat: '52.219464',
  gegrLon: '21.006232',
  city: {
    id: 1,
    name: 'Warszawa',
    commune: { provinceName: 'MAZOWIECKIE' },
  },
  addressStreet: 'ul. Sikorskiego',
};

describe('mapStationDto', () => {
  it('maps id correctly', () => {
    expect(mapStationDto(dto).id).toBe(114);
  });

  it('parses latitude as float', () => {
    expect(mapStationDto(dto).latitude).toBe(52.219464);
  });

  it('parses longitude as float', () => {
    expect(mapStationDto(dto).longitude).toBe(21.006232);
  });

  it('uses city name from dto', () => {
    expect(mapStationDto(dto).city).toBe('Warszawa');
  });

  it('falls back to empty string for missing address', () => {
    expect(mapStationDto({ ...dto, addressStreet: null }).address).toBe('');
  });

  it('extracts voivodeship from commune.provinceName', () => {
    expect(mapStationDto(dto).voivodeship).toBe('MAZOWIECKIE');
  });

  it('sets voivodeship to null when commune is missing', () => {
    expect(mapStationDto({ ...dto, city: { id: 1, name: 'Warszawa' } }).voivodeship).toBeNull();
  });
});
