import { z } from 'zod';

const StationCitySchema = z.object({
  id: z.number(),
  name: z.string(),
  commune: z
    .object({
      provinceName: z.string().nullable().optional(),
    })
    .optional(),
});

export const StationDtoSchema = z.object({
  id: z.number(),
  stationName: z.string(),
  gegrLat: z.string(),
  gegrLon: z.string(),
  city: StationCitySchema.nullable().optional(),
  addressStreet: z.string().nullable().optional(),
});

export const StationListDtoSchema = z.array(StationDtoSchema);

const SensorParamSchema = z.object({
  paramCode: z.string(),
  paramName: z.string(),
  paramFormula: z.string().nullable().optional(),
  idParam: z.number(),
});

export const SensorDtoSchema = z.object({
  id: z.number(),
  stationId: z.number(),
  param: SensorParamSchema,
});

export const SensorListDtoSchema = z.array(SensorDtoSchema);

const MeasurementValueSchema = z.object({
  date: z.string(),
  value: z.number().nullable(),
});

export const MeasurementsDtoSchema = z.object({
  key: z.string(),
  values: z.array(MeasurementValueSchema),
});

const AqiLevelSchema = z
  .object({
    id: z.number().nullable(),
    indexLevelName: z.string().nullable(),
  })
  .nullable();

export const AqiDtoSchema = z.object({
  id: z.number(),
  stCalcDate: z.string().nullable(),
  stIndexLevel: AqiLevelSchema.optional(),
  stSourceDataDate: z.string().nullable().optional(),
});
