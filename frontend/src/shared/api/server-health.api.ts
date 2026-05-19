import { API_BASE_URL } from '@/shared/api/http-client';

const getHealthUrl = (): string => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return new URL('/healthz', API_BASE_URL).toString();
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';

  return new URL('/healthz', origin).toString();
};

export const serverHealthApi = {
  check: async (signal?: AbortSignal): Promise<void> => {
    const response = await fetch(getHealthUrl(), {
      cache: 'no-store',
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error('Server is not ready');
    }
  },
};
