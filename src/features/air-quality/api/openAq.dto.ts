import type { z } from 'zod';
import type {
  OpenAqLocationSchema,
  OpenAqLocationPageSchema,
  OpenAqSensorSchema,
  OpenAqMeasurementSchema,
  OpenAqMeasurementPageSchema,
} from './openAq.schemas';

export type OpenAqSensorDto = z.infer<typeof OpenAqSensorSchema>;
export type OpenAqLocationDto = z.infer<typeof OpenAqLocationSchema>;
export type OpenAqLocationPageDto = z.infer<typeof OpenAqLocationPageSchema>;
export type OpenAqMeasurementDto = z.infer<typeof OpenAqMeasurementSchema>;
export type OpenAqMeasurementPageDto = z.infer<typeof OpenAqMeasurementPageSchema>;
