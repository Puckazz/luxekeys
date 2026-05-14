import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBrandsApi } from '@/features/admin/api/admin-brands.api';
import { ADMIN_BRANDS_QUERY_KEYS } from '@/features/admin/hooks/brands.key';
import type { UpsertAdminBrandInput } from '@/features/admin/types/admin-brands.types';

export const useCreateAdminBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminBrandInput) => {
      return adminBrandsApi.createBrand(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_BRANDS_QUERY_KEYS.all,
      });
    },
  });
};

export const useUpdateAdminBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertAdminBrandInput) => {
      return adminBrandsApi.updateBrand(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_BRANDS_QUERY_KEYS.all,
      });
    },
  });
};

export const useSoftDeleteAdminBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => {
      return adminBrandsApi.softDeleteBrand(brandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_BRANDS_QUERY_KEYS.all,
      });
    },
  });
};

export const useRestoreAdminBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => {
      return adminBrandsApi.restoreBrand(brandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_BRANDS_QUERY_KEYS.all,
      });
    },
  });
};
