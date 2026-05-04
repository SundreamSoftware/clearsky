import type { MeasurementsDto } from '../api/gios.dto';
import type { Measurement } from '../model/measurement.types';
import { resolveUnit } from './sensorMapper';

export function mapMeasurementsDto(
  dto: MeasurementsDto,
  sensorId: number,
): Measurement[] {
  return dto.values
    .filter((v): v is { date: string; value: number } => v.value !== null)
    .map((v) => ({
      sensorId,
      date: v.date,
      value: v.value,
      unit: resolveUnit(dto.key),
    }));
}
