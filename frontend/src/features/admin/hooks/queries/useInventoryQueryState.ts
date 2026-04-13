'use client';

import { useMemo } from 'react';
import {
  isOneOf,
  parsePositiveIntParam,
} from '@/features/admin/hooks/query-state.utils';
import { useQueryStateNavigation } from '@/features/admin/hooks/queries/useQueryStateNavigation';
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
  return value === 'all' || isOneOf(value, ADMIN_PRODUCT_CATEGORIES);
};

const isValidStatus = (
  value: string
): value is AdminInventoryListQueryState['status'] => {
  return (
    value === 'all' || isOneOf(value, ADMIN_INVENTORY_STATUS_FILTER_OPTIONS)
  );
};

const isValidSort = (
  value: string
): value is AdminInventoryListQueryState['sort'] => {
  return isOneOf(value, ADMIN_INVENTORY_SORT_OPTIONS);
};

export const useAdminInventoryQueryState = () => {
  const { searchParams, setField, setPage } = useQueryStateNavigation(
    queryKeys.page
  );

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

  const setSearch = (search: string) => {
    setField(queryKeys.search, search.trim(), '');
  };

  const setCategory = (category: AdminInventoryListQueryState['category']) => {
    setField(queryKeys.category, category, 'all');
  };

  const setStatus = (status: AdminInventoryListQueryState['status']) => {
    setField(queryKeys.status, status, 'all');
  };

  const setSort = (sort: AdminInventoryListQueryState['sort']) => {
    setField(queryKeys.sort, sort, 'updated-desc');
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
