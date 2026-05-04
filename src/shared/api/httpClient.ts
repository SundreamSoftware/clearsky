import axios from 'axios';
import { ApiRequestError } from './apiError';

const instance = axios.create({
  baseURL: import.meta.env.VITE_GIOS_API_BASE_URL as string,
  timeout: 10_000,
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status: number | null = err.response?.status ?? null;
    const endpoint: string = err.config?.url ?? 'unknown';

    throw new ApiRequestError(err.message ?? 'Request failed', status, endpoint);
  },
);

export const httpClient = {
  get<T>(url: string): Promise<T> {
    return instance.get<T>(url).then((res) => res.data);
  },
};
