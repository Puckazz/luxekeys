import {
  type ArchiveAdminUserInput,
  type AdminUser,
  type AdminUserApiItem,
  type AdminUserListApiData,
  type AdminUserListApiResponse,
  type AdminUserListQueryState,
  type RestoreAdminUserInput,
  type UpsertAdminUserInput,
  type UpdateAdminUserRoleInput,
} from '@/features/admin/types/admin-users.types';
import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';
import {
  mapApiUserSummary,
  mapApiUserToAdminUser,
  mapPaginationMeta,
  mapUpsertUserInputToPayload,
  toQueryString,
  userRoleToApiRole,
  userSortToApiParams,
  userStatusFilterToApiStatus,
} from '@/features/admin/mappers';
import { authFetch, authFetchWithMeta } from '@/shared/api/http-client';

export const adminUsersApi = {
  getUsers: async (
    queryState: AdminUserListQueryState
  ): Promise<AdminUserListApiResponse> => {
    const sort = userSortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      role:
        queryState.role === 'all'
          ? undefined
          : userRoleToApiRole(queryState.role),
      status: userStatusFilterToApiStatus(queryState.status),
      page: queryState.page,
      limit: queryState.pageSize,
      sort: sort.sort,
    });
    const response = await authFetchWithMeta<
      AdminUserListApiData,
      AdminPaginationApiMeta
    >(`/users/management?${query}`);

    return {
      items: response.data.items.map(mapApiUserToAdminUser),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: mapApiUserSummary(response.data.summary),
    };
  },

  updateUserRole: async (
    input: UpdateAdminUserRoleInput
  ): Promise<AdminUser> => {
    const user = await authFetch<AdminUserApiItem>(
      `/users/${input.userId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          role: userRoleToApiRole(input.nextRole),
        }),
      }
    );

    return mapApiUserToAdminUser(user);
  },

  createUser: async (input: UpsertAdminUserInput): Promise<AdminUser> => {
    const user = await authFetch<AdminUserApiItem>('/users', {
      method: 'POST',
      body: JSON.stringify(mapUpsertUserInputToPayload(input)),
    });

    return mapApiUserToAdminUser(user);
  },

  updateUser: async (input: UpsertAdminUserInput): Promise<AdminUser> => {
    if (!input.id) {
      throw new Error('User id is required for update.');
    }

    const user = await authFetch<AdminUserApiItem>(`/users/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(mapUpsertUserInputToPayload(input)),
    });

    return mapApiUserToAdminUser(user);
  },

  softDeleteUser: async (input: ArchiveAdminUserInput): Promise<AdminUser> => {
    const user = await authFetch<AdminUserApiItem>(
      `/users/${input.userId}`,
      {
        method: 'DELETE',
      }
    );

    return mapApiUserToAdminUser(user);
  },

  restoreUser: async (input: RestoreAdminUserInput): Promise<AdminUser> => {
    const user = await authFetch<AdminUserApiItem>(
      `/users/${input.userId}/restore`,
      {
        method: 'PATCH',
      }
    );

    return mapApiUserToAdminUser(user);
  },
};
