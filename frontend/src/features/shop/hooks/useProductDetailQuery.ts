import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/api/products.api';

const createProductDetailQueryKey = (slug: string) => {
  return ['product-detail', slug] as const;
};

export const useProductDetailQuery = (slug: string) => {
  return useQuery({
    queryKey: createProductDetailQueryKey(slug),
    queryFn: () => productsApi.getProductDetailBySlug(slug),
    staleTime: 60_000,
    retry: 1,
    enabled: Boolean(slug),
  });
};
