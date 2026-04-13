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
  return value === 'all' || USER_ROLES.includes(value as never);
};

const isValidStatus = (
  value: string
): value is AdminUserListQueryState['status'] => {
  return value === 'all' || ADMIN_USER_STATUSES.includes(value as never);
};

const isValidSort = (
  value: string
): value is AdminUserListQueryState['sort'] => {
  return ADMIN_USER_SORT_OPTIONS.includes(value as never);
};

export const useAdminUsersQueryState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const setRole = (role: AdminUserListQueryState['role']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.role, role, 'all');
      resetPage(params);
    });
  };

  const setStatus = (status: AdminUserListQueryState['status']) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, queryKeys.status, status, 'all');
      resetPage(params);
    });
  };

  const setSort = (sort: AdminUserListQueryState['sort']) => {
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
    setRole,
    setStatus,
    setSort,
    setPage,
  };
};
