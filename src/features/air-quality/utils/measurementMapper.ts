import type { MeasurementsDto } from '../api/gios.dto';
import type { Measurement } from '../model/measurement.types';

export function mapMeasurementsDto(
  dto: MeasurementsDto,
  sensorId: number,
  paramCode: string,
): Measurement[] {
  return dto['Lista danych pomiarowych']
    .filter((v): v is { Data: string; Wartość: number } => v['Wartość'] !== null)
    .map((v) => ({
      sensorId,
      date: v['Data'],
      value: v['Wartość'],
      unit: paramCode,
    }));
}
