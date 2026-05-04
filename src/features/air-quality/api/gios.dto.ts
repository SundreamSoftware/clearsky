import { z } from 'zod';
import {
  StationDtoSchema,
  SensorDtoSchema,
  MeasurementsDtoSchema,
  AqiDtoSchema,
} from './gios.schemas';

export type StationDto = z.infer<typeof StationDtoSchema>;
export type SensorDto = z.infer<typeof SensorDtoSchema>;
export type MeasurementsDto = z.infer<typeof MeasurementsDtoSchema>;
export type AqiDto = z.infer<typeof AqiDtoSchema>;
