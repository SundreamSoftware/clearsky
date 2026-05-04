import { z } from 'zod';

export const OpenMeteoCurrentSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current_units: z
    .object({
      temperature_2m: z.string().optional(),
      relative_humidity_2m: z.string().optional(),
      surface_pressure: z.string().optional(),
      wind_speed_10m: z.string().optional(),
      wind_direction_10m: z.string().optional(),
    })
    .optional(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    surface_pressure: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
  }),
});

export const OpenMeteoHourlySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly_units: z
    .object({
      time: z.string().optional(),
      temperature_2m: z.string().optional(),
      relative_humidity_2m: z.string().optional(),
      wind_speed_10m: z.string().optional(),
    })
    .optional(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number().nullable()),
    relative_humidity_2m: z.array(z.number().nullable()),
    wind_speed_10m: z.array(z.number().nullable()),
  }),
});
