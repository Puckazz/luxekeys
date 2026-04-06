'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  KeycapProfile,
  ProductCategory,
  ProductCaseMaterial,
  ProductFeature,
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
  PRODUCT_BRAND_OPTIONS_BY_CATEGORY,
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_CATEGORY_FILTER_CAPABILITIES,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';

type PriceRange = {
  min: number;
  max: number;
};

type UseProductListQueryStateOptions = {
  category: ProductCategory;
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
  category,
  priceBounds,
}: UseProductListQueryStateOptions) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState = useMemo(() => {
    return parseProductListQueryState(category, searchParams, priceBounds);
  }, [category, searchParams, priceBounds]);

  const capabilities = PRODUCT_CATEGORY_FILTER_CAPABILITIES[category];

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);

    const query = next.toString();
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

  const setCaseMaterial = (caseMaterial: ProductCaseMaterial | 'All') => {
    updateSearchParams((params) => {
      if (caseMaterial === 'All') {
        params.delete(productListQueryKeys.caseMaterial);
      } else {
        params.set(productListQueryKeys.caseMaterial, caseMaterial);
      }
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

  const toggleFeatures = (feature: ProductFeature) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.features, feature);
      if (next.length === 0) {
        params.delete(productListQueryKeys.features);
      } else {
        params.set(productListQueryKeys.features, serializeList(next));
      }
      resetPage(params);
    });
  };

  const resetFilters = () => {
    updateSearchParams((params) => {
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

      if (capabilities.showFeaturesFilter) {
        params.delete(productListQueryKeys.features);
      }

      if (capabilities.showCaseMaterialFilter) {
        params.delete(productListQueryKeys.caseMaterial);
      }

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
      brandOptions: PRODUCT_BRAND_OPTIONS_BY_CATEGORY[category],
      keycapProfileOptions: KEYCAP_PROFILE_OPTIONS,
      layoutOptions: PRODUCT_LAYOUT_OPTIONS,
      switchTypeOptions: PRODUCT_SWITCH_TYPE_OPTIONS,
      featureOptions: PRODUCT_FEATURE_OPTIONS,
      caseMaterialOptions: PRODUCT_CASE_MATERIAL_OPTIONS,
    },
    sortOptions: PRODUCT_SORT_OPTIONS,
    setPage,
    setSort,
    setCaseMaterial,
    setPriceRange,
    toggleBrands,
    toggleKeycapProfiles,
    toggleLayouts,
    toggleSwitchTypes,
    toggleFeatures,
    resetFilters,
  };
};
