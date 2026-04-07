import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminCategoriesApi } from '@/api/admin-categories.api';
import { ADMIN_CATEGORIES_QUERY_KEYS } from '@/features/admin/hooks/admin-categories.query-keys';
import type { UpsertAdminCategoryInput } from '@/features/admin/types/admin-categories.types';

export const useCreateAdminCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminCategoryInput) => {
      return adminCategoriesApi.createCategory(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_CATEGORIES_QUERY_KEYS.all,
      });
    },
  });
};

export const useUpdateAdminCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminCategoryInput) => {
      return adminCategoriesApi.updateCategory(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_CATEGORIES_QUERY_KEYS.all,
      });
    },
  });
};

export const useSoftDeleteAdminCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => {
      return adminCategoriesApi.softDeleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_CATEGORIES_QUERY_KEYS.all,
      });
    },
  });
};

export const useRestoreAdminCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => {
      return adminCategoriesApi.restoreCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_CATEGORIES_QUERY_KEYS.all,
      });
    },
  });
};
