'use client';

import { useMemo } from 'react';
import {
  isOneOf,
  parsePositiveIntParam,
} from '@/features/admin/hooks/query-state.utils';
import { useQueryStateNavigation } from '@/features/admin/hooks/queries/useQueryStateNavigation';
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
  return value === 'all' || isOneOf(value, ADMIN_PRODUCT_CATEGORIES);
};

const isValidStatus = (
  value: string
): value is AdminProductListQueryState['status'] => {
  return value === 'all' || isOneOf(value, ADMIN_PRODUCT_STATUS_FILTER_OPTIONS);
};

const isValidSort = (
  value: string
): value is AdminProductListQueryState['sort'] => {
  return isOneOf(value, ADMIN_PRODUCT_SORT_OPTIONS);
};

export const useAdminProductsQueryState = () => {
  const { searchParams, setField, setPage } = useQueryStateNavigation(
    queryKeys.page
  );

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

  const setSearch = (search: string) => {
    setField(queryKeys.search, search.trim(), '');
  };

  const setCategory = (category: AdminProductListQueryState['category']) => {
    setField(queryKeys.category, category, 'all');
  };

  const setStatus = (status: AdminProductListQueryState['status']) => {
    setField(queryKeys.status, status, 'all');
  };

  const setSort = (sort: AdminProductListQueryState['sort']) => {
    setField(queryKeys.sort, sort, 'newest');
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
