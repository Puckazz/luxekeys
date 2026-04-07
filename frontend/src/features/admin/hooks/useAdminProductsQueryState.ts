'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_PRODUCT_STATUSES,
} from '@/features/admin/types';
import {
  ADMIN_PRODUCT_SORT_OPTIONS,
  type AdminProductListQueryState,
} from '@/features/admin/types/admin-products.types';

const queryKeys = {
  search: 'search',
  category: 'category',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 8;

const isValidCategory = (
  value: string
): value is AdminProductListQueryState['category'] => {
  return value === 'all' || ADMIN_PRODUCT_CATEGORIES.includes(value as never);
};

const isValidStatus = (
  value: string
): value is AdminProductListQueryState['status'] => {
  return value === 'all' || ADMIN_PRODUCT_STATUSES.includes(value as never);
};

const isValidSort = (
  value: string
): value is AdminProductListQueryState['sort'] => {
  return ADMIN_PRODUCT_SORT_OPTIONS.includes(value as never);
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const next = Number(value);

  if (!Number.isInteger(next) || next <= 0) {
    return fallback;
  }

  return next;
};

export const useAdminProductsQueryState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState: AdminProductListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawCategory = searchParams.get(queryKeys.category) ?? 'all';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'all';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'newest';

    return {
      search,
      category: isValidCategory(rawCategory) ? rawCategory : 'all',
      status: isValidStatus(rawStatus) ? rawStatus : 'all',
      sort: isValidSort(rawSort) ? rawSort : 'newest',
      page: parsePositiveInt(searchParams.get(queryKeys.page), 1),
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const resetPage = (params: URLSearchParams) => {
    params.delete(queryKeys.page);
  };

  const setSearch = (search: string) => {
    updateSearchParams((params) => {
      const normalized = search.trim();
      if (!normalized) {
        params.delete(queryKeys.search);
      } else {
        params.set(queryKeys.search, normalized);
      }
      resetPage(params);
    });
  };

  const setCategory = (category: AdminProductListQueryState['category']) => {
    updateSearchParams((params) => {
      if (category === 'all') {
        params.delete(queryKeys.category);
      } else {
        params.set(queryKeys.category, category);
      }
      resetPage(params);
    });
  };

  const setStatus = (status: AdminProductListQueryState['status']) => {
    updateSearchParams((params) => {
      if (status === 'all') {
        params.delete(queryKeys.status);
      } else {
        params.set(queryKeys.status, status);
      }
      resetPage(params);
    });
  };

  const setSort = (sort: AdminProductListQueryState['sort']) => {
    updateSearchParams((params) => {
      if (sort === 'newest') {
        params.delete(queryKeys.sort);
      } else {
        params.set(queryKeys.sort, sort);
      }
      resetPage(params);
    });
  };

  const setPage = (page: number) => {
    updateSearchParams((params) => {
      if (page <= 1) {
        params.delete(queryKeys.page);
      } else {
        params.set(queryKeys.page, String(page));
      }
    });
  };

  return {
    queryState,
    setSearch,
    setCategory,
    setStatus,
    setSort,
    setPage,
  };
};
