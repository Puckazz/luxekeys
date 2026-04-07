import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminProductsApi } from '@/api/admin-products.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/admin-products.query-keys';
import type { UpsertAdminProductInput } from '@/features/admin/types/admin-products.types';

export const useCreateAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminProductInput) => {
      return adminProductsApi.createProduct(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};

export const useUpdateAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminProductInput) => {
      return adminProductsApi.updateProduct(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};

export const useSoftDeleteAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      return adminProductsApi.softDeleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};

export const useRestoreAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      return adminProductsApi.restoreProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};
