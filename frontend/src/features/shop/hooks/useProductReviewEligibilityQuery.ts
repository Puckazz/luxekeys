import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/features/shop/api/products.api';

export const useProductReviewEligibilityQuery = (
  productId: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ['product-review-eligibility', productId],
    queryFn: () => productsApi.getReviewEligibility(productId),
    staleTime: 30_000,
    retry: 1,
    enabled: Boolean(productId) && enabled,
  });
};
