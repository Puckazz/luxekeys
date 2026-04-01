import {
  PRODUCT_LIST_PAGE_SIZE,
  productsCatalog,
} from '@/features/shop/mocks/products.data';
import {
  ProductListApiResponse,
  ProductListQueryState,
} from '@/features/shop/types';
import {
  applyProductFilters,
  paginateProducts,
} from '@/features/shop/utils/product-list.utils';

const MOCK_NETWORK_DELAY = 120;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const PRODUCT_PRICE_BOUNDS = {
  min: Math.min(...productsCatalog.map((product) => product.price)),
  max: Math.max(...productsCatalog.map((product) => product.price)),
};

export const productsApi = {
  getProducts: async (
    queryState: ProductListQueryState
  ): Promise<ProductListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const filtered = applyProductFilters(productsCatalog, queryState);
    const paginated = paginateProducts(
      filtered,
      queryState.page,
      PRODUCT_LIST_PAGE_SIZE
    );

    return {
      items: paginated.items,
      meta: paginated.meta,
      priceBounds: PRODUCT_PRICE_BOUNDS,
    };
  },
};
