import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiFailure, ApiFieldError, ApiSuccess } from '@/types/api';
import { tokenStorage } from './storage';

/** Normalised error thrown for every failed API call. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const http = axios.create({ baseURL: env.apiUrl, timeout: 30000 });

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const status = error.response?.status ?? 0;
    if (status === 401 && tokenStorage.get() && typeof window !== 'undefined') {
      tokenStorage.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    const message = error.response?.data?.message ?? (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : 'Something went wrong');
    return Promise.reject(new ApiClientError(message, status, error.response?.data?.errors ?? []));
  },
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiSuccess<T>>(config);
  return response.data.data;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => request<T>({ url, method: 'GET', params }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ url, method: 'POST', data, ...config }),
  patch: <T>(url: string, data?: unknown) => request<T>({ url, method: 'PATCH', data }),
  delete: <T>(url: string) => request<T>({ url, method: 'DELETE' }),
};

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof ApiClientError) {
    const first = error.errors[0];
    return first?.field ? `${error.message}: ${first.message}` : error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

/** Maps API validation errors to { fieldName: message } for inline display. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError)) return {};
  return Object.fromEntries(error.errors.filter((e) => e.field).map((e) => [e.field as string, e.message]));
}
