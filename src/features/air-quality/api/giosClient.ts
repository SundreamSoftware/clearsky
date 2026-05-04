import { httpClient } from '@/shared/api/httpClient';
import {
  StationPageDtoSchema,
  SensorListDtoSchema,
  MeasurementsDtoSchema,
  AqiDtoSchema,
} from './gios.schemas';
import type { StationDto, SensorDto, MeasurementsDto, AqiDto } from './gios.dto';

export const giosClient = {
  async getStations(): Promise<StationDto[]> {
    const firstPage = await httpClient.get<unknown>('/station/findAll?size=20&page=0');
    const parsed = StationPageDtoSchema.parse(firstPage);
    const { totalPages } = parsed;
    const stations = [...parsed['Lista stacji pomiarowych']];

    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);
      const results = await Promise.all(
        remainingPages.map((page) =>
          httpClient
            .get<unknown>(`/station/findAll?size=20&page=${page}`)
            .then((raw) => StationPageDtoSchema.parse(raw)['Lista stacji pomiarowych']),
        ),
      );
      stations.push(...results.flat());
    }

    return stations;
  },

  async getSensors(stationId: number): Promise<SensorDto[]> {
    const raw = await httpClient.get<unknown>(`/station/sensors/${stationId}`);
    const parsed = SensorListDtoSchema.parse(raw);
    return parsed['Lista stanowisk pomiarowych dla podanej stacji'];
  },

  async getMeasurements(sensorId: number): Promise<MeasurementsDto> {
    const raw = await httpClient.get<unknown>(`/data/getData/${sensorId}`);
    return MeasurementsDtoSchema.parse(raw);
  },

  async getAirQualityIndex(stationId: number): Promise<AqiDto> {
    const raw = await httpClient.get<unknown>(`/aqindex/getIndex/${stationId}`);
    return AqiDtoSchema.parse(raw);
  },
};
