import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminUsersApi } from '@/api/admin-users.api';
import { ADMIN_USERS_QUERY_KEYS } from '@/features/admin/hooks/users.key';
import type {
  ArchiveAdminUserInput,
  RestoreAdminUserInput,
  UpsertAdminUserInput,
  UpdateAdminUserRoleInput,
} from '@/features/admin/types/admin-users.types';

const useInvalidateAdminUsersList = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });
  };

  return { invalidate };
};

export const useCreateAdminUserMutation = () => {
  const { invalidate } = useInvalidateAdminUsersList();

  return useMutation({
    mutationFn: (input: UpsertAdminUserInput) =>
      adminUsersApi.createUser(input),
    onSuccess: invalidate,
  });
};

export const useUpdateAdminUserMutation = () => {
  const { invalidate } = useInvalidateAdminUsersList();

  return useMutation({
    mutationFn: (input: UpsertAdminUserInput) =>
      adminUsersApi.updateUser(input),
    onSuccess: invalidate,
  });
};

export const useSoftDeleteAdminUserMutation = () => {
  const { invalidate } = useInvalidateAdminUsersList();

  return useMutation({
    mutationFn: (input: ArchiveAdminUserInput) =>
      adminUsersApi.softDeleteUser(input),
    onSuccess: invalidate,
  });
};

export const useRestoreAdminUserMutation = () => {
  const { invalidate } = useInvalidateAdminUsersList();

  return useMutation({
    mutationFn: (input: RestoreAdminUserInput) =>
      adminUsersApi.restoreUser(input),
    onSuccess: invalidate,
  });
};

export const useUpdateAdminUserRoleMutation = () => {
  const { invalidate } = useInvalidateAdminUsersList();

  return useMutation({
    mutationFn: (input: UpdateAdminUserRoleInput) =>
      adminUsersApi.updateUserRole(input),
    onSuccess: invalidate,
  });
};
