import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/features/shop/api/products.api';
import {
  ProductListApiResponse,
  ProductListQueryState,
} from '@/features/shop/types';

const createProductsQueryKey = (queryState: ProductListQueryState) => {
  return [
    'products',
    queryState.categories.join(','),
    queryState.brands.join(','),
    queryState.categorySlugs.join(','),
    queryState.keycapProfiles.join(','),
    queryState.layouts.join(','),
    queryState.switchTypes.join(','),
    queryState.price.min,
    queryState.price.max,
    queryState.sort,
    queryState.page,
  ] as const;
};

type UseProductsQueryOptions = {
  initialData?: ProductListApiResponse;
};

export const useProductsQuery = (
  queryState: ProductListQueryState,
  options: UseProductsQueryOptions = {}
) => {
  return useQuery({
    queryKey: createProductsQueryKey(queryState),
    queryFn: () => productsApi.getProducts(queryState),
    staleTime: 30_000,
    initialData: options.initialData,
  });
};
