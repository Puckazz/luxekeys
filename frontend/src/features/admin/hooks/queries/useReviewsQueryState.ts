'use client';

import { useMemo } from 'react';
import {
  isOneOf,
  parsePositiveIntParam,
} from '@/features/admin/hooks/query-state.utils';
import { useQueryStateNavigation } from '@/features/admin/hooks/queries/useQueryStateNavigation';
import {
  ADMIN_REVIEW_SORT_OPTIONS,
  ADMIN_REVIEW_STATUSES,
  type AdminReviewListQueryState,
} from '@/features/admin/types/admin-reviews.types';

const queryKeys = {
  search: 'search',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 8;

const isValidStatus = (
  value: string
): value is AdminReviewListQueryState['status'] => {
  return value === 'all' || isOneOf(value, ADMIN_REVIEW_STATUSES);
};

const isValidSort = (
  value: string
): value is AdminReviewListQueryState['sort'] => {
  return isOneOf(value, ADMIN_REVIEW_SORT_OPTIONS);
};

export const useAdminReviewsQueryState = () => {
  const { searchParams, setField, setPage } = useQueryStateNavigation(
    queryKeys.page
  );

  const queryState: AdminReviewListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'published';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'newest';

    return {
      search,
      status: isValidStatus(rawStatus) ? rawStatus : 'published',
      sort: isValidSort(rawSort) ? rawSort : 'newest',
      page: parsePositiveIntParam(searchParams.get(queryKeys.page), 1),
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  const setSearch = (search: string) => {
    setField(queryKeys.search, search.trim(), '');
  };

  const setStatus = (status: AdminReviewListQueryState['status']) => {
    setField(queryKeys.status, status, 'published');
  };

  const setSort = (sort: AdminReviewListQueryState['sort']) => {
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
