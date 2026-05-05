import { z } from 'zod';
import { WaqiBoundsResponseSchema, WaqiFeedResponseSchema } from './waqi.schemas';

export type WaqiBoundsResponseDto = z.infer<typeof WaqiBoundsResponseSchema>;
export type WaqiBoundsStationDto = WaqiBoundsResponseDto['data'][number];
export type WaqiFeedResponseDto = z.infer<typeof WaqiFeedResponseSchema>;
export type WaqiFeedDataDto = WaqiFeedResponseDto['data'];
