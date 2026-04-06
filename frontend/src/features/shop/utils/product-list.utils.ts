import {
  ProductListItem,
  ProductListQueryState,
  ProductPaginationMeta,
} from '@/features/shop/types';

const sortProducts = (
  products: ProductListItem[],
  sortOption: ProductListQueryState['sort']
): ProductListItem[] => {
  const copied = [...products];

  switch (sortOption) {
    case 'newest':
      return copied.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    case 'rating':
      return copied.sort((a, b) => b.rating - a.rating);
    case 'price':
      return copied.sort((a, b) => a.price - b.price);
    case 'popularity':
    default:
      return copied.sort((a, b) => b.popularity - a.popularity);
  }
};

export const applyProductFilters = (
  products: ProductListItem[],
  filterState: ProductListQueryState
): ProductListItem[] => {
  const filtered = products.filter((product) => {
    if (product.category !== filterState.category) {
      return false;
    }

    if (
      filterState.brands.length > 0 &&
      !filterState.brands.includes(product.brand)
    ) {
      return false;
    }

    if (
      filterState.keycapProfiles.length > 0 &&
      (!product.keycapProfile ||
        !filterState.keycapProfiles.includes(product.keycapProfile))
    ) {
      return false;
    }

    if (
      filterState.layouts.length > 0 &&
      !filterState.layouts.includes(product.layout)
    ) {
      return false;
    }

    if (
      filterState.switchTypes.length > 0 &&
      !filterState.switchTypes.includes(product.switchType)
    ) {
      return false;
    }

    if (
      filterState.features.length > 0 &&
      !filterState.features.every((feature) =>
        product.features.includes(feature)
      )
    ) {
      return false;
    }

    if (
      filterState.caseMaterial !== 'All' &&
      product.caseMaterial !== filterState.caseMaterial
    ) {
      return false;
    }

    if (
      product.price < filterState.price.min ||
      product.price > filterState.price.max
    ) {
      return false;
    }

    return true;
  });

  return sortProducts(filtered, filterState.sort);
};

export const paginateProducts = (
  products: ProductListItem[],
  page: number,
  pageSize: number
): { items: ProductListItem[]; meta: ProductPaginationMeta } => {
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: products.slice(start, end),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};
