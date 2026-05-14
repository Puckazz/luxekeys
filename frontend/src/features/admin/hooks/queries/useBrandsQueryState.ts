'use client';

import { useMemo } from 'react';

import {
  isOneOf,
  parsePositiveIntParam,
} from '@/features/admin/hooks/query-state.utils';
import { useQueryStateNavigation } from '@/features/admin/hooks/queries/useQueryStateNavigation';
import { ADMIN_BRAND_STATUSES } from '@/features/admin/types';
import {
  ADMIN_BRAND_SORT_OPTIONS,
  type AdminBrandListQueryState,
} from '@/features/admin/types/admin-brands.types';

const queryKeys = {
  search: 'search',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 8;

const isValidStatus = (
  value: string
): value is AdminBrandListQueryState['status'] => {
  return value === 'all' || isOneOf(value, ADMIN_BRAND_STATUSES);
};

const isValidSort = (
  value: string
): value is AdminBrandListQueryState['sort'] => {
  return isOneOf(value, ADMIN_BRAND_SORT_OPTIONS);
};

export const useAdminBrandsQueryState = () => {
  const { searchParams, setField, setPage } = useQueryStateNavigation(
    queryKeys.page
  );

  const queryState: AdminBrandListQueryState = useMemo(() => {
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

  const setSearch = (search: string) => {
    setField(queryKeys.search, search.trim(), '');
  };

  const setStatus = (status: AdminBrandListQueryState['status']) => {
    setField(queryKeys.status, status, 'all');
  };

  const setSort = (sort: AdminBrandListQueryState['sort']) => {
    setField(queryKeys.sort, sort, 'newest');
  };

  return {
    queryState,
    setSearch,
    setStatus,
    setSort,
    setPage,
  };
};
