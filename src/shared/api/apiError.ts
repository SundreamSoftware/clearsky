export interface ApiError {
  message: string;
  statusCode: number | null;
  endpoint: string;
}

export class ApiRequestError extends Error implements ApiError {
  statusCode: number | null;
  endpoint: string;

  constructor(message: string, statusCode: number | null, endpoint: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}
