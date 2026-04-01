import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/api/products.api';

const createProductReviewsQueryKey = (slug: string, limit: number) => {
  return ['product-reviews', slug, limit] as const;
};

export const useProductReviewsQuery = (slug: string, limit: number) => {
  return useQuery({
    queryKey: createProductReviewsQueryKey(slug, limit),
    queryFn: () => productsApi.getProductReviews(slug, limit),
    staleTime: 15_000,
    retry: 1,
    enabled: Boolean(slug) && limit > 0,
  });
};
