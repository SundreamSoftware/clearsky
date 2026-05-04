import { z } from 'zod';

export const OpenAqSensorSchema = z.object({
  id: z.number(),
  name: z.string(),
  parameter: z
    .object({
      name: z.string(),
      displayName: z.string().nullable().optional(),
      units: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const OpenAqLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  locality: z.string().nullable().optional(),
  country: z.object({
    id: z.string(),
    name: z.string(),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  sensors: z.array(OpenAqSensorSchema).nullable().optional(),
});

export const OpenAqLocationPageSchema = z.object({
  meta: z.object({
    found: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
  results: z.array(OpenAqLocationSchema),
});

export const OpenAqMeasurementSchema = z.object({
  value: z.number().nullable(),
  period: z
    .object({
      datetimeFrom: z.object({ utc: z.string() }).nullable().optional(),
      datetimeTo: z.object({ utc: z.string() }).nullable().optional(),
    })
    .nullable()
    .optional(),
  parameter: z
    .object({
      name: z.string(),
      displayName: z.string().nullable().optional(),
      units: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const OpenAqMeasurementPageSchema = z.object({
  results: z.array(OpenAqMeasurementSchema),
});
