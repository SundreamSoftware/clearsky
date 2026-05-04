import { createHttpClient } from './createHttpClient';

export const httpClient = createHttpClient(import.meta.env.VITE_GIOS_API_BASE_URL as string);
