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
  ADMIN_PRODUCT_SORT_OPTIONS,
  ADMIN_PRODUCT_STATUS_FILTER_OPTIONS,
  type AdminProductListQueryState,
} from '@/features/admin/types/admin-products.types';

const queryKeys = {
  search: 'search',
  category: 'category',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 7;

const isValidCategory = (
  value: string
): value is AdminProductListQueryState['category'] => {
  return value === 'all' || ADMIN_PRODUCT_CATEGORIES.includes(value as never);
};

const isValidStatus = (
  value: string
): value is AdminProductListQueryState['status'] => {
  return (
    value === 'all' ||
    ADMIN_PRODUCT_STATUS_FILTER_OPTIONS.includes(value as never)
  );
};

const isValidSort = (
  value: string
): value is AdminProductListQueryState['sort'] => {
  return ADMIN_PRODUCT_SORT_OPTIONS.includes(value as never);
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

  const setCategory = (category: AdminProductListQueryState['category']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.category, category, 'all');
      resetPage(params);
    });
  };

  const setStatus = (status: AdminProductListQueryState['status']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.status, status, 'all');
      resetPage(params);
    });
  };

  const setSort = (sort: AdminProductListQueryState['sort']) => {
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
    setCategory,
    setStatus,
    setSort,
    setPage,
  };
};
