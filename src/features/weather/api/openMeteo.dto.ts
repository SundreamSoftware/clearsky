import type { z } from 'zod';
import type { OpenMeteoCurrentSchema } from './openMeteo.schemas';

export type OpenMeteoCurrentDto = z.infer<typeof OpenMeteoCurrentSchema>;
