import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/api/products.api';
import {
  ProductListApiResponse,
  ProductListQueryState,
} from '@/features/shop/types';

const createProductsQueryKey = (queryState: ProductListQueryState) => {
  return [
    'products',
    queryState.category,
    queryState.brands.join(','),
    queryState.keycapProfiles.join(','),
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
