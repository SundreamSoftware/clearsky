import { httpClient } from '@/shared/api/httpClient';
import {
  StationListDtoSchema,
  SensorListDtoSchema,
  MeasurementsDtoSchema,
  AqiDtoSchema,
} from './gios.schemas';
import type {
  StationDto,
  SensorDto,
  MeasurementsDto,
  AqiDto,
} from './gios.dto';

export const giosClient = {
  async getStations(): Promise<StationDto[]> {
    const raw = await httpClient.get<unknown>('/station/findAll');
    return StationListDtoSchema.parse(raw);
  },

  async getSensors(stationId: number): Promise<SensorDto[]> {
    const raw = await httpClient.get<unknown>(`/station/sensors/${stationId}`);
    return SensorListDtoSchema.parse(raw);
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
