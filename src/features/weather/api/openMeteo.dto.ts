import type { z } from 'zod';
import type { OpenMeteoCurrentSchema, OpenMeteoHourlySchema } from './openMeteo.schemas';

export type OpenMeteoCurrentDto = z.infer<typeof OpenMeteoCurrentSchema>;
export type OpenMeteoHourlyDto = z.infer<typeof OpenMeteoHourlySchema>;
