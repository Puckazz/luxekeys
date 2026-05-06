import type { ProductListQueryState } from '@/features/shop/types';
import type { ProductApiQueryParams } from '@/features/shop/types/product-api.types';

import { PRODUCT_TYPE_BY_CATEGORY } from './product-api.shared';

export const mapProductQueryStateToApiParams = (
  queryState: ProductListQueryState,
  limit: number
): ProductApiQueryParams => {
  const sortBy = queryState.sort === 'price' ? 'basePrice' : 'createdAt';
  const sortOrder = queryState.sort === 'price' ? 'asc' : 'desc';

  return {
    type: PRODUCT_TYPE_BY_CATEGORY[queryState.category],
    status: 'ACTIVE',
    minPrice: queryState.price.min,
    maxPrice: queryState.price.max,
    page: queryState.page,
    limit,
    sortBy,
    sortOrder,
  };
};
