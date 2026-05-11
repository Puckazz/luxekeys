import {
  mapApiProductToDetail,
  mapApiProductToListItem,
  mapApiReviewToReviewItem,
  mapProductQueryStateToApiParams,
} from '@/features/shop/mappers/product-api.mapper';
import type {
  ProductDetail,
  ProductListApiResponse,
  ProductListItem,
  ProductListQueryState,
  ProductReviewItem,
} from '@/features/shop/types';
import type { ProductBrandOptionItem } from '@/features/shop/types/product-list.types';
import type {
  CustomerProductApiPaginationMeta,
  CustomerProductDetailApiItem,
  CustomerProductListApiData,
  CustomerReviewApiItem,
} from '@/features/shop/types/product-api.types';
import { apiRequest, apiRequestWithMeta } from '@/shared/api/http-client';

export const PRODUCT_LIST_PAGE_SIZE = 6;

type CustomerBrandApiItem = {
  id: string;
  name: string;
  slug: string;
};

const toQueryString = (
  params: Record<string, string | number | undefined>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

const mapPaginationMeta = (
  meta: CustomerProductApiPaginationMeta | undefined,
  fallbackPage: number
) => {
  return {
    page: meta?.page ?? fallbackPage,
    pageSize: meta?.limit ?? PRODUCT_LIST_PAGE_SIZE,
    totalItems: meta?.total ?? 0,
    totalPages: meta?.totalPages ?? 1,
  };
};

export const PRODUCT_SEARCH_LIMIT = 8;

export const productsApi = {
  searchProducts: async (query: string): Promise<ProductListItem[]> => {
    const qs = toQueryString({
      search: query,
      status: 'ACTIVE',
      page: 1,
      limit: PRODUCT_SEARCH_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    const response = await apiRequestWithMeta<
      CustomerProductListApiData,
      CustomerProductApiPaginationMeta
    >(`/products?${qs}`);

    return response.data.items.map(mapApiProductToListItem);
  },
  getBrandOptions: async (): Promise<ProductBrandOptionItem[]> => {
    const query = toQueryString({
      isActive: 'true',
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    const response = await apiRequestWithMeta<CustomerBrandApiItem[]>(
      `/brands?${query}`
    );

    return response.data.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    }));
  },

  getProducts: async (
    queryState: ProductListQueryState
  ): Promise<ProductListApiResponse> => {
    const brandOptions =
      queryState.brands.length > 0 ? await productsApi.getBrandOptions() : [];
    const apiParams = mapProductQueryStateToApiParams(
      queryState,
      PRODUCT_LIST_PAGE_SIZE,
      brandOptions
    );
    const query = toQueryString(apiParams);
    const response = await apiRequestWithMeta<
      CustomerProductListApiData,
      CustomerProductApiPaginationMeta
    >(`/products?${query}`);
    const items = response.data.items.map(mapApiProductToListItem);

    return {
      items,
      meta: mapPaginationMeta(response.meta, queryState.page),
      priceBounds: {
        min: 0,
        max: response.data.priceBounds.max,
      },
    };
  },

  getProductDetailBySlug: async (slug: string): Promise<ProductDetail> => {
    const product = await apiRequest<CustomerProductDetailApiItem>(
      `/products/slug/${slug}`
    );

    return mapApiProductToDetail(product);
  },

  getProductReviews: async (
    slug: string,
    limit: number
  ): Promise<ProductReviewItem[]> => {
    const product = await apiRequest<CustomerProductDetailApiItem>(
      `/products/slug/${slug}`
    );
    const query = toQueryString({
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    const response = await apiRequestWithMeta<
      CustomerReviewApiItem[],
      CustomerProductApiPaginationMeta
    >(`/products/${product.id}/reviews?${query}`);

    return response.data.map(mapApiReviewToReviewItem);
  },
};
