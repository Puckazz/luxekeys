'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';
import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/features/shop/api/products.api';
import {
  KeycapProfile,
  ProductCategory,
  ProductLayout,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import {
  parseProductListQueryState,
  productListQueryKeys,
} from '@/features/shop/utils/product-list-query.utils';
import {
  KEYCAP_PROFILE_OPTIONS,
  PRODUCT_CATEGORY_FILTER_CAPABILITIES,
  PRODUCT_CATEGORY_SLUGS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';

type PriceRange = {
  min: number;
  max: number;
};

type UseProductListQueryStateOptions = {
  defaultCategories: ProductCategory[];
  priceBounds: PriceRange;
};

const serializeList = (items: string[]): string => {
  return items.join(',');
};

const toggleListItem = <T extends string>(items: T[], value: T): T[] => {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
};

export const useProductListQueryState = ({
  defaultCategories,
  priceBounds,
}: UseProductListQueryStateOptions) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loader = useTopLoader();

  const queryState = useMemo(() => {
    return parseProductListQueryState(
      defaultCategories,
      searchParams,
      priceBounds
    );
  }, [defaultCategories, searchParams, priceBounds]);

  const capabilities = useMemo(() => {
    const capabilityCategories =
      queryState.categories.length > 0
        ? queryState.categories
        : PRODUCT_CATEGORY_SLUGS;

    return capabilityCategories.reduce(
      (acc, selectedCategory) => {
        const next = PRODUCT_CATEGORY_FILTER_CAPABILITIES[selectedCategory];

        return {
          showBrandFilter: acc.showBrandFilter || next.showBrandFilter,
          showProfileFilter: acc.showProfileFilter || next.showProfileFilter,
          showLayoutFilter: acc.showLayoutFilter || next.showLayoutFilter,
          showSwitchTypeFilter:
            acc.showSwitchTypeFilter || next.showSwitchTypeFilter,
        };
      },
      {
        showBrandFilter: false,
        showProfileFilter: false,
        showLayoutFilter: false,
        showSwitchTypeFilter: false,
      }
    );
  }, [queryState.categories]);
  const brandOptionsQuery = useQuery({
    queryKey: ['product-brand-options'],
    queryFn: () => productsApi.getBrandOptions(),
    staleTime: 60_000,
    enabled: capabilities.showBrandFilter,
  });

  useEffect(() => {
    loader.done();
  }, [loader, pathname, searchParams]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);

    const query = next.toString();
    loader.start();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setPage = (page: number) => {
    updateSearchParams((params) => {
      if (page <= 1) {
        params.delete(productListQueryKeys.page);
      } else {
        params.set(productListQueryKeys.page, String(page));
      }
    });
  };

  const resetPage = (params: URLSearchParams) => {
    params.delete(productListQueryKeys.page);
  };

  const setSort = (sort: ProductSortOption) => {
    updateSearchParams((params) => {
      params.set(productListQueryKeys.sort, sort);
      resetPage(params);
    });
  };

  const setPriceRange = (min: number, max: number) => {
    updateSearchParams((params) => {
      params.set(productListQueryKeys.priceMin, String(min));
      params.set(productListQueryKeys.priceMax, String(max));
      resetPage(params);
    });
  };

  const toggleBrands = (brand: string) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.brands, brand);
      if (next.length === 0) {
        params.delete(productListQueryKeys.brands);
      } else {
        params.set(productListQueryKeys.brands, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleCategories = (category: ProductCategory) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.categories, category);
      if (next.length === 0) {
        params.delete(productListQueryKeys.categories);
      } else {
        params.set(productListQueryKeys.categories, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleKeycapProfiles = (profile: KeycapProfile) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.keycapProfiles, profile);
      if (next.length === 0) {
        params.delete(productListQueryKeys.keycapProfiles);
      } else {
        params.set(productListQueryKeys.keycapProfiles, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleLayouts = (layout: ProductLayout) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.layouts, layout);
      if (next.length === 0) {
        params.delete(productListQueryKeys.layouts);
      } else {
        params.set(productListQueryKeys.layouts, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleSwitchTypes = (switchType: ProductSwitchType) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.switchTypes, switchType);
      if (next.length === 0) {
        params.delete(productListQueryKeys.switchTypes);
      } else {
        params.set(productListQueryKeys.switchTypes, serializeList(next));
      }
      resetPage(params);
    });
  };

  const resetFilters = () => {
    updateSearchParams((params) => {
      params.delete(productListQueryKeys.categories);

      if (capabilities.showBrandFilter) {
        params.delete(productListQueryKeys.brands);
      }

      if (capabilities.showProfileFilter) {
        params.delete(productListQueryKeys.keycapProfiles);
      }

      if (capabilities.showLayoutFilter) {
        params.delete(productListQueryKeys.layouts);
      }

      if (capabilities.showSwitchTypeFilter) {
        params.delete(productListQueryKeys.switchTypes);
      }

      params.delete(productListQueryKeys.categorySlugs);
      params.delete(productListQueryKeys.priceMin);
      params.delete(productListQueryKeys.priceMax);
      params.delete(productListQueryKeys.sort);
      params.delete(productListQueryKeys.page);
    });
  };

  return {
    queryState,
    filterOptions: {
      capabilities,
      brandOptions: brandOptionsQuery.data ?? [],
      keycapProfileOptions: KEYCAP_PROFILE_OPTIONS,
      layoutOptions: PRODUCT_LAYOUT_OPTIONS,
      switchTypeOptions: PRODUCT_SWITCH_TYPE_OPTIONS,
    },
    sortOptions: PRODUCT_SORT_OPTIONS,
    setPage,
    setSort,
    setPriceRange,
    toggleCategories,
    toggleBrands,
    toggleKeycapProfiles,
    toggleLayouts,
    toggleSwitchTypes,
    resetFilters,
  };
};
