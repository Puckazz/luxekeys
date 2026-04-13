import { useQuery } from '@tanstack/react-query';

import { adminUsersApi } from '@/api/admin-users.api';
import { ADMIN_USERS_QUERY_KEYS } from '@/features/admin/hooks/users.key';
import type { AdminUserListQueryState } from '@/features/admin/types/admin-users.types';

export const useAdminUsersQuery = (queryState: AdminUserListQueryState) => {
  return useQuery({
    queryKey: ADMIN_USERS_QUERY_KEYS.list(queryState),
    queryFn: () => adminUsersApi.getUsers(queryState),
    staleTime: 15_000,
  });
};
