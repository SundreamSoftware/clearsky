import { z } from 'zod';

// ── Station ──────────────────────────────────────────────────────────────────

export const StationDtoSchema = z.object({
  'Identyfikator stacji': z.number(),
  'Nazwa stacji': z.string(),
  'WGS84 φ N': z.string(),
  'WGS84 λ E': z.string(),
  'Nazwa miasta': z.string().nullable().optional(),
  'Województwo': z.string().nullable().optional(),
  'Ulica': z.string().nullable().optional(),
});

export const StationPageDtoSchema = z.object({
  'Lista stacji pomiarowych': z.array(StationDtoSchema),
  totalPages: z.number(),
});

// ── Sensor ───────────────────────────────────────────────────────────────────

export const SensorDtoSchema = z.object({
  'Identyfikator stanowiska': z.number(),
  'Identyfikator stacji': z.number(),
  'Wskaźnik': z.string(),
  'Wskaźnik - wzór': z.string().nullable().optional(),
  'Wskaźnik - kod': z.string(),
  'Id wskaźnika': z.number(),
});

export const SensorListDtoSchema = z.object({
  'Lista stanowisk pomiarowych dla podanej stacji': z.array(SensorDtoSchema),
});

// ── Measurements ─────────────────────────────────────────────────────────────

const MeasurementValueSchema = z.object({
  'Data': z.string(),
  'Wartość': z.number().nullable(),
});

export const MeasurementsDtoSchema = z.object({
  'Lista danych pomiarowych': z.array(MeasurementValueSchema),
});

// ── AQI ──────────────────────────────────────────────────────────────────────

export const AqiDtoSchema = z.object({
  'AqIndex': z.object({
    'Identyfikator stacji pomiarowej': z.number(),
    'Data wykonania obliczeń indeksu': z.string().nullable().optional(),
    'Wartość indeksu': z.number().nullable().optional(),
    'Nazwa kategorii indeksu': z.string().nullable().optional(),
    'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st': z.string().nullable().optional(),
  }),
});
