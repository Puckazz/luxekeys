import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';

export const toQueryString = (
  params: Record<string, string | number | undefined>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const mapPaginationMeta = (
  meta: AdminPaginationApiMeta | undefined,
  fallbackPage: number,
  fallbackPageSize: number
) => {
  return {
    page: meta?.page ?? fallbackPage,
    pageSize: meta?.limit ?? fallbackPageSize,
    totalItems: meta?.total ?? 0,
    totalPages: meta?.totalPages ?? 1,
  };
};
