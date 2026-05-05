import { z } from 'zod';

// Bounds response: GET /v2/map/bounds/
const WaqiBoundsStationSchema = z.object({
  uid: z.number(),
  aqi: z.union([z.number(), z.string()]), // number or "-" when no data
  lat: z.number(),
  lon: z.number(),
  station: z.object({
    name: z.string(),
    // WAQI returns `time` as a string timestamp in the bounds endpoint — z.unknown() accepts any shape.
    time: z.unknown().optional(),
  }),
});

export const WaqiBoundsResponseSchema = z.object({
  status: z.string(),
  data: z.array(WaqiBoundsStationSchema),
});

// Feed response: GET /feed/@{uid}/
const WaqiIaqiValueSchema = z.object({ v: z.number() });

const WaqiFeedDataSchema = z.object({
  aqi: z.union([z.number(), z.string()]),
  idx: z.number(),
  city: z
    .object({
      name: z.string().optional(),
      geo: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
  time: z
    .object({
      s: z.string().optional(),
      tz: z.string().optional(),
      v: z.number().optional(),
    })
    .optional(),
  iaqi: z
    .object({
      pm25: WaqiIaqiValueSchema.optional(),
      pm10: WaqiIaqiValueSchema.optional(),
      no2: WaqiIaqiValueSchema.optional(),
      o3: WaqiIaqiValueSchema.optional(),
      so2: WaqiIaqiValueSchema.optional(),
      co: WaqiIaqiValueSchema.optional(),
      t: WaqiIaqiValueSchema.optional(), // temperature
      h: WaqiIaqiValueSchema.optional(), // humidity
      p: WaqiIaqiValueSchema.optional(), // pressure
      w: WaqiIaqiValueSchema.optional(), // wind speed
      wd: WaqiIaqiValueSchema.optional(), // wind direction
    })
    .optional(),
});

export const WaqiFeedResponseSchema = z.object({
  status: z.string(),
  data: WaqiFeedDataSchema,
});
