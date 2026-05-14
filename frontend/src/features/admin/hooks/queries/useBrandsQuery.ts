import { useQuery } from '@tanstack/react-query';

import { adminBrandsApi } from '@/features/admin/api/admin-brands.api';
import { ADMIN_BRANDS_QUERY_KEYS } from '@/features/admin/hooks/brands.key';
import type { AdminBrandListQueryState } from '@/features/admin/types/admin-brands.types';

export const useAdminBrandsQuery = (queryState: AdminBrandListQueryState) => {
  return useQuery({
    queryKey: ADMIN_BRANDS_QUERY_KEYS.list(queryState),
    queryFn: () => adminBrandsApi.getBrands(queryState),
    staleTime: 15_000,
  });
};
