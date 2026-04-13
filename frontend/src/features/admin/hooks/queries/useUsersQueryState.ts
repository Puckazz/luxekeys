'use client';

import { useMemo } from 'react';
import {
  isOneOf,
  parsePositiveIntParam,
} from '@/features/admin/hooks/query-state.utils';
import { useQueryStateNavigation } from '@/features/admin/hooks/queries/useQueryStateNavigation';
import {
  ADMIN_USER_SORT_OPTIONS,
  ADMIN_USER_STATUSES,
  type AdminUserListQueryState,
} from '@/features/admin/types/admin-users.types';
import { USER_ROLES } from '@/lib/rbac';

const queryKeys = {
  search: 'search',
  role: 'role',
  status: 'status',
  sort: 'sort',
  page: 'page',
};

const DEFAULT_PAGE_SIZE = 7;

const isValidRole = (
  value: string
): value is AdminUserListQueryState['role'] => {
  return value === 'all' || isOneOf(value, USER_ROLES);
};

const isValidStatus = (
  value: string
): value is AdminUserListQueryState['status'] => {
  return value === 'all' || isOneOf(value, ADMIN_USER_STATUSES);
};

const isValidSort = (
  value: string
): value is AdminUserListQueryState['sort'] => {
  return isOneOf(value, ADMIN_USER_SORT_OPTIONS);
};

export const useAdminUsersQueryState = () => {
  const { searchParams, setField, setPage } = useQueryStateNavigation(
    queryKeys.page
  );

  const queryState: AdminUserListQueryState = useMemo(() => {
    const search = searchParams.get(queryKeys.search) ?? '';
    const rawRole = searchParams.get(queryKeys.role) ?? 'all';
    const rawStatus = searchParams.get(queryKeys.status) ?? 'all';
    const rawSort = searchParams.get(queryKeys.sort) ?? 'newest';

    return {
      search,
      role: isValidRole(rawRole) ? rawRole : 'all',
      status: isValidStatus(rawStatus) ? rawStatus : 'all',
      sort: isValidSort(rawSort) ? rawSort : 'newest',
      page: parsePositiveIntParam(searchParams.get(queryKeys.page), 1),
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  const setSearch = (search: string) => {
    setField(queryKeys.search, search.trim(), '');
  };

  const setRole = (role: AdminUserListQueryState['role']) => {
    setField(queryKeys.role, role, 'all');
  };

  const setStatus = (status: AdminUserListQueryState['status']) => {
    setField(queryKeys.status, status, 'all');
  };

  const setSort = (sort: AdminUserListQueryState['sort']) => {
    setField(queryKeys.sort, sort, 'newest');
  };

  return {
    queryState,
    setSearch,
    setRole,
    setStatus,
    setSort,
    setPage,
  };
};
