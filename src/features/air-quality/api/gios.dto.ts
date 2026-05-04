import { z } from 'zod';
import {
  StationDtoSchema,
  StationPageDtoSchema,
  SensorDtoSchema,
  SensorListDtoSchema,
  MeasurementsDtoSchema,
  AqiDtoSchema,
} from './gios.schemas';

export type StationDto = z.infer<typeof StationDtoSchema>;
export type StationPageDto = z.infer<typeof StationPageDtoSchema>;
export type SensorDto = z.infer<typeof SensorDtoSchema>;
export type SensorListDto = z.infer<typeof SensorListDtoSchema>;
export type MeasurementsDto = z.infer<typeof MeasurementsDtoSchema>;
export type AqiDto = z.infer<typeof AqiDtoSchema>;

