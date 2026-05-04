import type { OpenAqMeasurementDto } from '../api/openAq.dto';
import type { Measurement } from '../model/measurement.types';

export function mapOpenAqMeasurements(
  dtos: OpenAqMeasurementDto[],
  sensorId: number,
): Measurement[] {
  return dtos
    .filter((dto) => dto.value !== null)
    .map((dto) => ({
      sensorId,
      date: dto.period?.datetimeTo?.utc ?? dto.period?.datetimeFrom?.utc ?? '',
      value: dto.value as number,
      unit: dto.parameter?.units ?? '',
    }));
}
