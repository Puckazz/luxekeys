import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/features/auth/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 1,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
