'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ADMIN_CATEGORY_STATUSES } from '@/features/admin/types';
import {
  ADMIN_CATEGORY_SORT_OPTIONS,
  type AdminCategoryListQueryState,
} from '@/features/admin/types/admin-categories.types';

const queryKeys = {
  search: 'search',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 8;

const isValidStatus = (
  value: string
): value is AdminCategoryListQueryState['status'] => {
  return value === 'all' || ADMIN_CATEGORY_STATUSES.includes(value as never);
};

const isValidSort = (
  value: string
): value is AdminCategoryListQueryState['sort'] => {
  return ADMIN_CATEGORY_SORT_OPTIONS.includes(value as never);
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const next = Number(value);

  if (!Number.isInteger(next) || next <= 0) {
    return fallback;
  }

  return next;
};

export const useAdminCategoriesQueryState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState: AdminCategoryListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'all';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'newest';

    return {
      search,
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

  const setStatus = (status: AdminCategoryListQueryState['status']) => {
    updateSearchParams((params) => {
      if (status === 'all') {
        params.delete(queryKeys.status);
      } else {
        params.set(queryKeys.status, status);
      }
      resetPage(params);
    });
  };

  const setSort = (sort: AdminCategoryListQueryState['sort']) => {
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
    setStatus,
    setSort,
    setPage,
  };
};
