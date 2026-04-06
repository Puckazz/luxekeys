'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductListViewMode } from '@/features/shop/types';
import { useRouter } from 'next/navigation';
import type {
  ProductFiltersController,
  ProductListPageProps,
  ProductPriceRange,
} from '@/features/shop/types/product-list.types';
import {
  MobileProductFiltersDrawer,
  ProductCard,
  ProductFilters,
  ProductPagination,
  ProductToolbar,
} from '@/features/shop/components/product-list';
import { useProductFiltersStore } from '@/stores/shop/productFilters.store';
import { useProductListQueryState } from '@/features/shop/hooks/useProductListQueryState';
import { useProductsQuery } from '@/features/shop/hooks/useProductsQuery';
import {
  PRODUCT_CATEGORY_PAGE_META,
  PRODUCT_CATEGORY_SLUGS,
} from '@/features/shop/utils/product-list-options.utils';
import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

const getQueryStateKey = (query: ProductListPageProps['initialQueryState']) => {
  return [
    query.category,
    query.brands.join(','),
    query.keycapProfiles.join(','),
    query.layouts.join(','),
    query.switchTypes.join(','),
    query.features.join(','),
    query.caseMaterial,
    query.price.min,
    query.price.max,
    query.sort,
    query.page,
  ].join('|');
};
export default function ProductListPage({
  category,
  initialData,
  initialQueryState,
  initialPriceBounds,
}: ProductListPageProps) {
  const [viewMode, setViewMode] = useState<ProductListViewMode>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const setFilterController = useProductFiltersStore(
    (state) => state.setController
  );
  const clearFilterController = useProductFiltersStore(
    (state) => state.clearController
  );

  const {
    queryState,
    filterOptions,
    sortOptions,
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
  } = useProductListQueryState({
    category,
    priceBounds: initialPriceBounds,
  });

  const categoryMeta = PRODUCT_CATEGORY_PAGE_META[category];
  const categoryOptions = PRODUCT_CATEGORY_SLUGS.map((categorySlug) => {
    return {
      value: categorySlug,
      label: PRODUCT_CATEGORY_PAGE_META[categorySlug].label,
    };
  });

  const isInitialQuery = useMemo(() => {
    return getQueryStateKey(queryState) === getQueryStateKey(initialQueryState);
  }, [queryState, initialQueryState]);

  const productsQuery = useProductsQuery(queryState, {
    initialData: isInitialQuery ? initialData : undefined,
  });

  const products = productsQuery.data?.items ?? [];
  const totalItems = productsQuery.data?.meta.totalItems ?? 0;
  const totalPages = productsQuery.data?.meta.totalPages ?? 1;
  const currentPage = productsQuery.data?.meta.page ?? queryState.page;
  const priceBounds = productsQuery.data?.priceBounds ?? initialPriceBounds;

  useEffect(() => {
    if (!productsQuery.data) {
      return;
    }

    if (productsQuery.data.meta.page === queryState.page) {
      return;
    }

    setPage(productsQuery.data.meta.page);
  }, [productsQuery.data, queryState.page, setPage]);

  const listClassName = cn(
    'grid gap-5',
    viewMode === 'grid' ? 'sm:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'
  );

  const filterController: ProductFiltersController = useMemo(
    () => ({
      capabilities: filterOptions.capabilities,
      brandOptions: filterOptions.brandOptions,
      keycapProfileOptions: filterOptions.keycapProfileOptions,
      layoutOptions: filterOptions.layoutOptions,
      switchTypeOptions: filterOptions.switchTypeOptions,
      featureOptions: filterOptions.featureOptions,
      caseMaterialOptions: filterOptions.caseMaterialOptions,
      selectedBrands: queryState.brands,
      selectedKeycapProfiles: queryState.keycapProfiles,
      selectedLayouts: queryState.layouts,
      selectedSwitchTypes: queryState.switchTypes,
      selectedFeatures: queryState.features,
      selectedCaseMaterial: queryState.caseMaterial,
      selectedPrice: queryState.price,
      priceBounds,
      categoryOptions,
      selectedCategory: category,
      onToggleBrand: toggleBrands,
      onToggleKeycapProfile: toggleKeycapProfiles,
      onToggleLayout: toggleLayouts,
      onToggleSwitchType: toggleSwitchTypes,
      onToggleFeature: toggleFeatures,
      onCaseMaterialChange: setCaseMaterial,
      onPriceChange: (nextPrice: ProductPriceRange) => {
        setPriceRange(nextPrice.min, nextPrice.max);
      },
      onReset: resetFilters,
      onCategoryChange: (nextCategory: ProductListPageProps['category']) => {
        if (nextCategory === category) {
          return;
        }

        router.push(`/products/${nextCategory}`);
      },
    }),
    [
      filterOptions.capabilities,
      filterOptions.brandOptions,
      filterOptions.keycapProfileOptions,
      filterOptions.layoutOptions,
      filterOptions.switchTypeOptions,
      filterOptions.featureOptions,
      filterOptions.caseMaterialOptions,
      queryState.brands,
      queryState.keycapProfiles,
      queryState.layouts,
      queryState.switchTypes,
      queryState.features,
      queryState.caseMaterial,
      queryState.price,
      priceBounds,
      categoryOptions,
      category,
      toggleBrands,
      toggleKeycapProfiles,
      toggleLayouts,
      toggleSwitchTypes,
      toggleFeatures,
      setCaseMaterial,
      setPriceRange,
      resetFilters,
      router,
    ]
  );

  useEffect(() => {
    setFilterController(filterController);

    return () => {
      clearFilterController();
    };
  }, [filterController, setFilterController, clearFilterController]);

  return (
    <div className="bg-background pb-10">
      <section className="from-background via-accent/20 to-background bg-linear-to-r">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <PageBreadcrumb
            className="mb-4 text-sm"
            items={[
              { label: 'Home', href: '/' },
              { label: categoryMeta.label },
            ]}
          />

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            {categoryMeta.heading}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            {categoryMeta.description}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters />
            </div>
          </aside>

          <div>
            <ProductToolbar
              totalItems={totalItems}
              viewMode={viewMode}
              sort={queryState.sort}
              sortOptions={sortOptions}
              onViewModeChange={setViewMode}
              onSortChange={setSort}
              onOpenFilters={() => setIsMobileFiltersOpen(true)}
            />

            {productsQuery.isError ? (
              <div className="border-border/60 bg-card/30 mt-5 rounded-2xl border p-10 text-center">
                <h3 className="text-foreground text-lg font-semibold">
                  Unable to load products
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Please try again. If the issue persists, check your backend
                  products API.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => productsQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : productsQuery.isPending ? (
              <div className="border-border/60 bg-card/30 mt-5 rounded-2xl border p-10 text-center">
                <h3 className="text-foreground text-lg font-semibold">
                  Loading products...
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Applying filters and preparing results.
                </p>
              </div>
            ) : products.length > 0 ? (
              <div className="mt-5">
                <div className={listClassName}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            ) : (
              <div className="border-border/60 bg-card/30 mt-5 rounded-2xl border p-10 text-center">
                <h3 className="text-foreground text-lg font-semibold">
                  No products found
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Try adjusting your selected filters or price range.
                </p>
                <Button className="mt-5" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <MobileProductFiltersDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <ProductFilters className="border-border/70 bg-card/20 p-0" />
      </MobileProductFiltersDrawer>
    </div>
  );
}
