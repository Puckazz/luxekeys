import type { ProductListQueryState } from '@/features/shop/types';
import type { ProductApiQueryParams } from '@/features/shop/types/product-api.types';
import type { ProductBrandOptionItem } from '@/features/shop/types/product-list.types';

import { PRODUCT_TYPE_BY_CATEGORY } from './product-api.shared';

export const mapProductQueryStateToApiParams = (
  queryState: ProductListQueryState,
  limit: number,
  brandOptions: ProductBrandOptionItem[] = []
): ProductApiQueryParams => {
  const sortConfig = (() => {
    switch (queryState.sort) {
      case 'featured':
        return { sortBy: 'isFeatured', sortOrder: 'desc' } as const;
      case 'price-asc':
        return { sortBy: 'basePrice', sortOrder: 'asc' } as const;
      case 'price-desc':
        return { sortBy: 'basePrice', sortOrder: 'desc' } as const;
      case 'name-asc':
        return { sortBy: 'name', sortOrder: 'asc' } as const;
      case 'name-desc':
        return { sortBy: 'name', sortOrder: 'desc' } as const;
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' } as const;
    }
  })();
  const selectedBrandIds = brandOptions
    .filter((brand) => queryState.brands.includes(brand.slug))
    .map((brand) => brand.id);

  const selectedTypes = Array.from(
    new Set(
      queryState.categories.map(
        (category) => PRODUCT_TYPE_BY_CATEGORY[category]
      )
    )
  );

  return {
    ...(selectedTypes.length > 0 && { type: selectedTypes.join(',') }),
    status: 'ACTIVE',
    ...(selectedBrandIds.length > 0 && { brandId: selectedBrandIds.join(',') }),
    ...(queryState.categorySlugs.length > 0 && {
      categorySlug: queryState.categorySlugs.join(','),
    }),
    ...(queryState.layouts.length > 0 && {
      layout: queryState.layouts.join(','),
    }),
    ...(queryState.switchTypes.length > 0 && {
      switchType: queryState.switchTypes.join(','),
    }),
    ...(queryState.keycapProfiles.length > 0 && {
      keycapProfile: queryState.keycapProfiles.join(','),
    }),
    ...(queryState.search?.trim() && { search: queryState.search.trim() }),
    minPrice: queryState.price.min,
    maxPrice: queryState.price.max,
    page: queryState.page,
    limit,
    sortBy: sortConfig.sortBy,
    sortOrder: sortConfig.sortOrder,
  };
};
