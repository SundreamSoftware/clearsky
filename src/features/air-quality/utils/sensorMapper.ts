import type { SensorDto } from '../api/gios.dto';
import type { Sensor } from '../model/sensor.types';

const UNIT_MAP: Record<string, string> = {
  'PM2.5': 'µg/m³',
  PM10: 'µg/m³',
  NO2: 'µg/m³',
  O3: 'µg/m³',
  SO2: 'µg/m³',
  CO: 'mg/m³',
};

export function resolveUnit(paramCode: string): string {
  return UNIT_MAP[paramCode] ?? '';
}

export function mapSensorDto(dto: SensorDto): Sensor {
  return {
    id: dto.id,
    stationId: dto.stationId,
    parameterCode: dto.param.paramCode,
    parameterName: dto.param.paramName,
    unit: resolveUnit(dto.param.paramCode),
  };
}

export function mapSensorListDto(dtos: SensorDto[], _stationId: number): Sensor[] {
  return dtos.map(mapSensorDto);
}
