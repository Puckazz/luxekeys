import type { AdminHealthCheck } from '@/features/admin/types/admin-health.types';
import { API_BASE_URL } from '@/shared/api/http-client';

type BackendSuccessResponse<T> = {
  success: true;
  data: T;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getHealthUrl = (): string => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return new URL('/healthz', API_BASE_URL).toString();
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  return new URL('/healthz', origin).toString();
};

export const adminHealthApi = {
  getHealth: async (): Promise<AdminHealthCheck> => {
    const response = await fetch(getHealthUrl(), {
      cache: 'no-store',
      credentials: 'include',
    });
    const payload = (await response.json().catch(() => undefined)) as unknown;

    if (!response.ok) {
      throw new Error('API health check failed');
    }

    if (!isRecord(payload) || !isRecord(payload.data)) {
      throw new Error('Unexpected health check response');
    }

    return (payload as BackendSuccessResponse<AdminHealthCheck>).data;
  },
};
