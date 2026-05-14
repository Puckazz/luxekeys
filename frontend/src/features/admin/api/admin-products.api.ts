import type {
  AdminProduct,
} from '@/features/admin/types';
import type {
  AdminPaginationApiMeta,
  AdminProductBrandOption,
  AdminProductCategoryOption,
  AdminProductApiItem,
  AdminProductImageApiItem,
  AdminProductListApiData,
  AdminProductListResponse,
  AdminProductListQueryState,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';
import {
  mapApiProductToAdminProduct,
  mapApiSummary,
  mapPaginationMeta,
  mapUpsertInputToPayload,
  productSortToApiParams,
  productStatusFilterToApiStatus,
  toQueryString,
} from '@/features/admin/mappers';
import {
  apiRequestWithMeta,
  authFetch,
  authFetchWithMeta,
} from '@/shared/api/http-client';

export const adminProductsApi = {
  getBrandOptions: async (): Promise<AdminProductBrandOption[]> => {
    const query = toQueryString({
      isActive: 'true',
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    const response = await apiRequestWithMeta<AdminProductBrandOption[]>(
      `/brands?${query}`
    );

    return response.data;
  },

  getCategoryOptions: async (): Promise<AdminProductCategoryOption[]> => {
    const query = toQueryString({
      isActive: 'true',
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    const response = await apiRequestWithMeta<AdminProductCategoryOption[]>(
      `/categories?${query}`
    );

    return response.data;
  },

  getProducts: async (
    queryState: AdminProductListQueryState
  ): Promise<AdminProductListResponse> => {
    const sort = productSortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      categoryId:
        queryState.category === 'all' ? undefined : queryState.category,
      status: productStatusFilterToApiStatus(queryState.status),
      page: queryState.page,
      limit: queryState.pageSize,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    });
    const response = await authFetchWithMeta<
      AdminProductListApiData,
      AdminPaginationApiMeta
    >(`/products/admin?${query}`);

    return {
      items: response.data.items.map(mapApiProductToAdminProduct),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: mapApiSummary(response.data.summary),
    };
  },

  createProduct: async (
    input: UpsertAdminProductInput
  ): Promise<AdminProduct> => {
    const product = await authFetch<AdminProductApiItem>('/products/admin', {
      method: 'POST',
      body: JSON.stringify(mapUpsertInputToPayload(input)),
    });
    const mappedProduct = mapApiProductToAdminProduct(product);

    for (const file of input.imageFiles ?? []) {
      await adminProductsApi.uploadProductImage(mappedProduct.id, file);
    }

    return mappedProduct;
  },

  updateProduct: async (
    input: UpsertAdminProductInput
  ): Promise<AdminProduct> => {
    if (!input.id) {
      throw new Error('Product id is required for update.');
    }

    const product = await authFetch<AdminProductApiItem>(
      `/products/admin/${input.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(mapUpsertInputToPayload(input)),
      }
    );

    for (const file of input.imageFiles ?? []) {
      await adminProductsApi.uploadProductImage(input.id, file);
    }

    return mapApiProductToAdminProduct(product);
  },

  softDeleteProduct: async (productId: string): Promise<AdminProduct> => {
    const product = await authFetch<AdminProductApiItem>(
      `/products/admin/${productId}`,
      {
        method: 'DELETE',
      }
    );

    return mapApiProductToAdminProduct(product);
  },

  restoreProduct: async (productId: string): Promise<AdminProduct> => {
    const product = await authFetch<AdminProductApiItem>(
      `/products/admin/${productId}/restore`,
      {
        method: 'PATCH',
      }
    );

    return mapApiProductToAdminProduct(product);
  },

  getProductImages: async (
    productId: string
  ): Promise<AdminProductImageApiItem[]> => {
    return authFetch<AdminProductImageApiItem[]>(`/products/${productId}/images`);
  },

  uploadProductImage: async (
    productId: string,
    file: File
  ): Promise<AdminProductImageApiItem> => {
    const formData = new FormData();
    formData.append('file', file);

    return authFetch<AdminProductImageApiItem>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    });
  },

  updateProductImage: async (
    productId: string,
    imageId: string,
    input: { isPrimary?: boolean; sortOrder?: number }
  ): Promise<AdminProductImageApiItem> => {
    return authFetch<AdminProductImageApiItem>(
      `/products/${productId}/images/${imageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
  },

  deleteProductImage: async (
    productId: string,
    imageId: string
  ): Promise<AdminProductImageApiItem> => {
    return authFetch<AdminProductImageApiItem>(
      `/products/${productId}/images/${imageId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
