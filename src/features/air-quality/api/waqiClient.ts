import { createHttpClient } from '@/shared/api/createHttpClient';
import { WaqiBoundsResponseSchema, WaqiFeedResponseSchema } from './waqi.schemas';
import type { WaqiBoundsStationDto, WaqiFeedDataDto } from './waqi.dto';

// Token is injected server-side (Vite proxy in dev, Nginx in prod) — never exposed to client
const client = createHttpClient('/waqi-api');

export type WaqiBounds = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export const waqiClient = {
  async getLocationsByBounds(bounds: WaqiBounds): Promise<WaqiBoundsStationDto[]> {
    const { minLat, minLon, maxLat, maxLon } = bounds;
    const path = `/v2/map/bounds/?latlng=${minLat},${minLon},${maxLat},${maxLon}&networks=all`;
    if (import.meta.env.DEV) {
      console.debug('[WAQI] getLocationsByBounds', { bounds, path: `/waqi-api${path}` });
    }
    const raw = await client.get<unknown>(path);
    const parsed = WaqiBoundsResponseSchema.parse(raw);
    if (import.meta.env.DEV) {
      console.debug('[WAQI] response status:', parsed.status, '| stations:', parsed.data.length);
    }
    if (parsed.status !== 'ok') return [];
    return parsed.data;
  },

  async getStationFeed(uid: number): Promise<WaqiFeedDataDto> {
    const raw = await client.get<unknown>(`/feed/@${uid}/`);
    const parsed = WaqiFeedResponseSchema.parse(raw);
    return parsed.data;
  },
};
