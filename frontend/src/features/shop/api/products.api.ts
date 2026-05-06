import {
  PRODUCT_LIST_PAGE_SIZE,
  productDetailsBySlug,
  productsCatalog,
} from '@/features/shop/mocks/products.data';
import {
  ProductDetail,
  ProductListApiResponse,
  ProductListQueryState,
  ProductReviewItem,
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
  getProductDetailBySlug: async (slug: string): Promise<ProductDetail> => {
    await delay(MOCK_NETWORK_DELAY);

    const productDetail = productDetailsBySlug[slug];

    if (!productDetail) {
      throw new Error('Product not found');
    }

    return productDetail;
  },
  getProductReviews: async (
    slug: string,
    limit: number
  ): Promise<ProductReviewItem[]> => {
    await delay(MOCK_NETWORK_DELAY);

    const productDetail = productDetailsBySlug[slug];

    if (!productDetail) {
      throw new Error('Product not found');
    }

    return productDetail.reviews.slice(0, limit);
  },
};
