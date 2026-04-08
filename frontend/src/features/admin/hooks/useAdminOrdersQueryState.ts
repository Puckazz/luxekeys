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
import {
  ADMIN_ORDER_SORT_OPTIONS,
  ADMIN_ORDER_STATUS_FILTER_OPTIONS,
  type AdminOrderListQueryState,
} from '@/features/admin/types/admin-orders.types';

const queryKeys = {
  search: 'search',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 8;

const isValidStatus = (
  value: string
): value is AdminOrderListQueryState['status'] => {
  return (
    value === 'all' ||
    ADMIN_ORDER_STATUS_FILTER_OPTIONS.includes(value as never)
  );
};

const isValidSort = (
  value: string
): value is AdminOrderListQueryState['sort'] => {
  return ADMIN_ORDER_SORT_OPTIONS.includes(value as never);
};

export const useAdminOrdersQueryState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState: AdminOrderListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'all';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'newest';

    return {
      search,
      status: isValidStatus(rawStatus) ? rawStatus : 'all',
      sort: isValidSort(rawSort) ? rawSort : 'newest',
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

  const setStatus = (status: AdminOrderListQueryState['status']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.status, status, 'all');
      resetPage(params);
    });
  };

  const setSort = (sort: AdminOrderListQueryState['sort']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.sort, sort, 'newest');
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
    setStatus,
    setSort,
    setPage,
  };
};
