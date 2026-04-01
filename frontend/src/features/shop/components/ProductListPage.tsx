'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
  productsCatalog,
} from '@/features/shop/mocks/products.data';
import { ProductListViewMode } from '@/features/shop/types';
import type { ProductPriceRange } from '@/features/shop/types/product-list.types';
import ProductCard from '@/features/shop/components/ProductCard';
import ProductFilters from '@/features/shop/components/ProductFilters';
import ProductPagination from '@/features/shop/components/ProductPagination';
import ProductToolbar from '@/features/shop/components/ProductToolbar';
import MobileProductFiltersDrawer from '@/features/shop/components/MobileProductFiltersDrawer';
import { useProductListQueryState } from '@/features/shop/hooks/useProductListQueryState';
import { useProductsQuery } from '@/features/shop/hooks/useProductsQuery';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

const PRODUCT_PRICE_BOUNDS_FALLBACK = {
  min: Math.min(...productsCatalog.map((product) => product.price)),
  max: Math.max(...productsCatalog.map((product) => product.price)),
};

export default function ProductListPage() {
  const [viewMode, setViewMode] = useState<ProductListViewMode>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    queryState,
    setPage,
    setSort,
    setCaseMaterial,
    setPriceRange,
    toggleLayouts,
    toggleSwitchTypes,
    toggleFeatures,
    resetFilters,
  } = useProductListQueryState({
    priceBounds: PRODUCT_PRICE_BOUNDS_FALLBACK,
  });

  const productsQuery = useProductsQuery(queryState);

  const products = productsQuery.data?.items ?? [];
  const totalItems = productsQuery.data?.meta.totalItems ?? 0;
  const totalPages = productsQuery.data?.meta.totalPages ?? 1;
  const currentPage = productsQuery.data?.meta.page ?? queryState.page;
  const priceBounds =
    productsQuery.data?.priceBounds ?? PRODUCT_PRICE_BOUNDS_FALLBACK;

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
    layoutOptions: PRODUCT_LAYOUT_OPTIONS,
    switchTypeOptions: PRODUCT_SWITCH_TYPE_OPTIONS,
    featureOptions: PRODUCT_FEATURE_OPTIONS,
    caseMaterialOptions: PRODUCT_CASE_MATERIAL_OPTIONS,
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
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-4 flex items-center gap-1 text-sm"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground">Mechanical Keyboards</span>
          </nav>

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
              sortOptions={PRODUCT_SORT_OPTIONS}
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
