'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductListViewMode } from '@/features/shop/types';
import type {
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
import { useProductListQueryState } from '@/features/shop/hooks/useProductListQueryState';
import { useProductsQuery } from '@/features/shop/hooks/useProductsQuery';
import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

const getQueryStateKey = (query: ProductListPageProps['initialQueryState']) => {
  return [
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
  initialData,
  initialQueryState,
  initialPriceBounds,
}: ProductListPageProps) {
  const [viewMode, setViewMode] = useState<ProductListViewMode>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    queryState,
    filterOptions,
    sortOptions,
    setPage,
    setSort,
    setCaseMaterial,
    setPriceRange,
    toggleLayouts,
    toggleSwitchTypes,
    toggleFeatures,
    resetFilters,
  } = useProductListQueryState({
    priceBounds: initialPriceBounds,
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

  const sharedFilterProps = {
    layoutOptions: filterOptions.layoutOptions,
    switchTypeOptions: filterOptions.switchTypeOptions,
    featureOptions: filterOptions.featureOptions,
    caseMaterialOptions: filterOptions.caseMaterialOptions,
    selectedLayouts: queryState.layouts,
    selectedSwitchTypes: queryState.switchTypes,
    selectedFeatures: queryState.features,
    selectedCaseMaterial: queryState.caseMaterial,
    selectedPrice: queryState.price,
    priceBounds,
    onToggleLayout: toggleLayouts,
    onToggleSwitchType: toggleSwitchTypes,
    onToggleFeature: toggleFeatures,
    onCaseMaterialChange: setCaseMaterial,
    onPriceChange: (nextPrice: ProductPriceRange) => {
      setPriceRange(nextPrice.min, nextPrice.max);
    },
    onReset: resetFilters,
  };

  return (
    <div className="bg-background pb-10">
      <section className="from-background via-accent/20 to-background bg-linear-to-r">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <PageBreadcrumb
            className="mb-4 text-sm"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Mechanical Keyboards' },
            ]}
          />

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Mechanical Keyboards
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            Find your perfect typing experience from our curated collection of
            enthusiast-grade boards.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters {...sharedFilterProps} />
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
        <ProductFilters
          {...sharedFilterProps}
          className="border-border/70 bg-card/20 p-0"
        />
      </MobileProductFiltersDrawer>
    </div>
  );
}
