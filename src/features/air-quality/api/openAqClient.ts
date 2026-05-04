import { createHttpClient } from '@/shared/api/createHttpClient';
import { ApiRequestError } from '@/shared/api/apiError';
import { OpenAqLocationPageSchema, OpenAqMeasurementPageSchema } from './openAq.schemas';
import type { OpenAqLocationDto, OpenAqMeasurementDto } from './openAq.dto';

export type OpenAqBbox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_OPENAQ_API_KEY as string | undefined;
  return key && key !== 'undefined' && key.trim() !== '' ? key : undefined;
}

function createClient() {
  const apiKey = getApiKey();
  const headers: Record<string, string> = apiKey ? { 'X-API-Key': apiKey } : {};
  return createHttpClient('https://api.openaq.org/v3', headers);
}

const client = createClient();

export const openAqClient = {
  async getLocationsByBbox(bbox: OpenAqBbox): Promise<OpenAqLocationDto[]> {
    if (!getApiKey()) return [];
    try {
      const { minLon, minLat, maxLon, maxLat } = bbox;
      const raw = await client.get<unknown>(
        `/locations?bbox=${minLon},${minLat},${maxLon},${maxLat}&limit=500`,
      );
      const parsed = OpenAqLocationPageSchema.parse(raw);
      return parsed.results;
    } catch (err) {
      if (err instanceof ApiRequestError && (err.statusCode === 401 || err.statusCode === 403)) {
        return [];
      }
      throw err;
    }
  },

  async getLatestMeasurements(sensorId: number): Promise<OpenAqMeasurementDto[]> {
    if (!getApiKey()) return [];
    try {
      const raw = await client.get<unknown>(
        `/sensors/${sensorId}/measurements?limit=1&period_name=hour`,
      );
      const parsed = OpenAqMeasurementPageSchema.parse(raw);
      return parsed.results;
    } catch (err) {
      if (err instanceof ApiRequestError && (err.statusCode === 401 || err.statusCode === 403)) {
        return [];
      }
      throw err;
    }
  },
};
