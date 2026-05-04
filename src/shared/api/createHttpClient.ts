import axios from 'axios';
import { ApiRequestError } from './apiError';

export function createHttpClient(
  baseURL: string,
  headers?: Record<string, string>,
): { get<T>(url: string): Promise<T> } {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
    headers,
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status: number | null = err.response?.status ?? null;
      const endpoint: string = err.config?.url ?? 'unknown';
      throw new ApiRequestError(err.message ?? 'Request failed', status, endpoint);
    },
  );

  return {
    get<T>(url: string): Promise<T> {
      return instance.get<T>(url).then((res) => res.data);
    },
  };
}
