import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/api/products.api';
import { ProductListQueryState } from '@/features/shop/types';

const createProductsQueryKey = (queryState: ProductListQueryState) => {
  return [
    'products',
    queryState.layouts.join(','),
    queryState.switchTypes.join(','),
    queryState.features.join(','),
    queryState.caseMaterial,
    queryState.price.min,
    queryState.price.max,
    queryState.sort,
    queryState.page,
  ] as const;
};

export const useProductsQuery = (queryState: ProductListQueryState) => {
  return useQuery({
    queryKey: createProductsQueryKey(queryState),
    queryFn: () => productsApi.getProducts(queryState),
    staleTime: 30_000,
  });
};
