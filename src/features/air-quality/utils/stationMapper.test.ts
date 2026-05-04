import { describe, it, expect } from 'vitest';
import { mapStationDto } from './stationMapper';
import type { StationDto } from '../api/gios.dto';

const dto: StationDto = {
  'Identyfikator stacji': 114,
  'Nazwa stacji': 'Warszawa-Komunikacyjna',
  'WGS84 φ N': '52.219464',
  'WGS84 λ E': '21.006232',
  'Nazwa miasta': 'Warszawa',
  'Województwo': 'MAZOWIECKIE',
  'Ulica': 'ul. Sikorskiego',
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
    expect(mapStationDto({ ...dto, 'Ulica': null }).address).toBe('');
  });

  it('extracts voivodeship from Województwo', () => {
    expect(mapStationDto(dto).voivodeship).toBe('MAZOWIECKIE');
  });

  it('sets voivodeship to null when Województwo is missing', () => {
    expect(mapStationDto({ ...dto, 'Województwo': null }).voivodeship).toBeNull();
  });
});
