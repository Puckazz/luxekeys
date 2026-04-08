'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  getNextSearchParamsString,
  parsePositiveIntParam,
  resetPageParam,
  setPageParam,
  setParamWithDefault,
} from '@/features/admin/hooks/admin-query-state.utils';
import { ADMIN_PRODUCT_CATEGORIES } from '@/features/admin/types';
import {
  ADMIN_INVENTORY_SORT_OPTIONS,
  ADMIN_INVENTORY_STATUS_FILTER_OPTIONS,
  type AdminInventoryListQueryState,
} from '@/features/admin/types/admin-inventory.types';

const queryKeys = {
  search: 'search',
  category: 'category',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 10;

const isValidCategory = (
  value: string
): value is AdminInventoryListQueryState['category'] => {
  return value === 'all' || ADMIN_PRODUCT_CATEGORIES.includes(value as never);
};

const isValidStatus = (
  value: string
): value is AdminInventoryListQueryState['status'] => {
  return (
    value === 'all' ||
    ADMIN_INVENTORY_STATUS_FILTER_OPTIONS.includes(value as never)
  );
};

const isValidSort = (
  value: string
): value is AdminInventoryListQueryState['sort'] => {
  return ADMIN_INVENTORY_SORT_OPTIONS.includes(value as never);
};

export const useAdminInventoryQueryState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState: AdminInventoryListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawCategory = searchParams.get(queryKeys.category) ?? 'all';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'all';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'updated-desc';

    return {
      search,
      category: isValidCategory(rawCategory) ? rawCategory : 'all',
      status: isValidStatus(rawStatus) ? rawStatus : 'all',
      sort: isValidSort(rawSort) ? rawSort : 'updated-desc',
      page: parsePositiveIntParam(searchParams.get(queryKeys.page), 1),
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const query = getNextSearchParamsString(searchParams, updater);
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const resetPage = (params: URLSearchParams) => {
    resetPageParam(params, queryKeys.page);
  };

  const setSearch = (search: string) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.search, search.trim(), '');
      resetPage(params);
    });
  };

  const setCategory = (category: AdminInventoryListQueryState['category']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.category, category, 'all');
      resetPage(params);
    });
  };

  const setStatus = (status: AdminInventoryListQueryState['status']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.status, status, 'all');
      resetPage(params);
    });
  };

  const setSort = (sort: AdminInventoryListQueryState['sort']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.sort, sort, 'updated-desc');
      resetPage(params);
    });
  };

  const setPage = (page: number) => {
    updateSearchParams((params) => {
      setPageParam(params, queryKeys.page, page);
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
