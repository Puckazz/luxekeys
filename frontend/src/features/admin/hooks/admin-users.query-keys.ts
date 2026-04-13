import type { AdminUserListQueryState } from '@/features/admin/types/admin-users.types';

export const ADMIN_USERS_QUERY_KEYS = {
  all: ['admin-users'] as const,
  list: (queryState: AdminUserListQueryState) => {
    return [
      ...ADMIN_USERS_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.role,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
};
