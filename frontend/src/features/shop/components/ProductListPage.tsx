'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_LIST_PAGE_SIZE,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
  productsCatalog,
} from '@/features/shop/mocks/products.data';
import {
  ProductCaseMaterial,
  ProductFeature,
  ProductFilterState,
  ProductLayout,
  ProductSwitchType,
} from '@/features/shop/types';
import {
  applyProductFilters,
  paginateProducts,
} from '@/features/shop/utils/product-list.utils';
import ProductCard from '@/features/shop/components/ProductCard';
import ProductFilters from '@/features/shop/components/ProductFilters';
import ProductPagination from '@/features/shop/components/ProductPagination';
import ProductToolbar from '@/features/shop/components/ProductToolbar';
import MobileProductFiltersDrawer from '@/features/shop/components/MobileProductFiltersDrawer';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

const PRODUCT_PRICE_BOUNDS = {
  min: Math.min(...productsCatalog.map((product) => product.price)),
  max: Math.max(...productsCatalog.map((product) => product.price)),
};

const initialFilterState: ProductFilterState = {
  layouts: [],
  switchTypes: [],
  features: [],
  caseMaterial: 'All',
  price: PRODUCT_PRICE_BOUNDS,
  sort: 'popularity',
  page: 1,
  viewMode: 'grid',
};

const toggleSelection = <T,>(items: T[], value: T): T[] => {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
};

export default function ProductListPage() {
  const [filterState, setFilterState] =
    useState<ProductFilterState>(initialFilterState);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return applyProductFilters(productsCatalog, filterState);
  }, [filterState]);

  const paginated = useMemo(() => {
    return paginateProducts(
      filteredProducts,
      filterState.page,
      PRODUCT_LIST_PAGE_SIZE
    );
  }, [filteredProducts, filterState.page]);

  useEffect(() => {
    if (filterState.page <= paginated.meta.totalPages) {
      return;
    }

    setFilterState((previous) => ({
      ...previous,
      page: paginated.meta.totalPages,
    }));
  }, [filterState.page, paginated.meta.totalPages]);

  const handlePriceChange = (nextPrice: { min: number; max: number }) => {
    const clampedMin = Math.max(
      PRODUCT_PRICE_BOUNDS.min,
      Math.min(nextPrice.min, PRODUCT_PRICE_BOUNDS.max)
    );
    const clampedMax = Math.min(
      PRODUCT_PRICE_BOUNDS.max,
      Math.max(nextPrice.max, PRODUCT_PRICE_BOUNDS.min)
    );

    setFilterState((previous) => ({
      ...previous,
      price: {
        min: Math.min(clampedMin, clampedMax),
        max: Math.max(clampedMin, clampedMax),
      },
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilterState((previous) => ({
      ...initialFilterState,
      viewMode: previous.viewMode,
    }));
  };

  const listClassName = cn(
    'grid gap-5',
    filterState.viewMode === 'grid'
      ? 'sm:grid-cols-2 2xl:grid-cols-3'
      : 'grid-cols-1'
  );

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
              <ProductFilters
                layoutOptions={PRODUCT_LAYOUT_OPTIONS}
                switchTypeOptions={PRODUCT_SWITCH_TYPE_OPTIONS}
                featureOptions={PRODUCT_FEATURE_OPTIONS}
                caseMaterialOptions={PRODUCT_CASE_MATERIAL_OPTIONS}
                selectedLayouts={filterState.layouts}
                selectedSwitchTypes={filterState.switchTypes}
                selectedFeatures={filterState.features}
                selectedCaseMaterial={filterState.caseMaterial}
                selectedPrice={filterState.price}
                priceBounds={PRODUCT_PRICE_BOUNDS}
                onToggleLayout={(layout: ProductLayout) => {
                  setFilterState((previous) => ({
                    ...previous,
                    layouts: toggleSelection(previous.layouts, layout),
                    page: 1,
                  }));
                }}
                onToggleSwitchType={(switchType: ProductSwitchType) => {
                  setFilterState((previous) => ({
                    ...previous,
                    switchTypes: toggleSelection(
                      previous.switchTypes,
                      switchType
                    ),
                    page: 1,
                  }));
                }}
                onToggleFeature={(feature: ProductFeature) => {
                  setFilterState((previous) => ({
                    ...previous,
                    features: toggleSelection(previous.features, feature),
                    page: 1,
                  }));
                }}
                onCaseMaterialChange={(
                  material: ProductCaseMaterial | 'All'
                ) => {
                  setFilterState((previous) => ({
                    ...previous,
                    caseMaterial: material,
                    page: 1,
                  }));
                }}
                onPriceChange={handlePriceChange}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div>
            <ProductToolbar
              totalItems={filteredProducts.length}
              viewMode={filterState.viewMode}
              sort={filterState.sort}
              sortOptions={PRODUCT_SORT_OPTIONS}
              onViewModeChange={(mode) => {
                setFilterState((previous) => ({
                  ...previous,
                  viewMode: mode,
                }));
              }}
              onSortChange={(sort) => {
                setFilterState((previous) => ({
                  ...previous,
                  sort,
                  page: 1,
                }));
              }}
              onOpenFilters={() => setIsMobileFiltersOpen(true)}
            />

            {paginated.items.length > 0 ? (
              <div className="mt-5">
                <div className={listClassName}>
                  {paginated.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={filterState.viewMode}
                    />
                  ))}
                </div>

                <ProductPagination
                  currentPage={paginated.meta.page}
                  totalPages={paginated.meta.totalPages}
                  onPageChange={(nextPage) => {
                    setFilterState((previous) => ({
                      ...previous,
                      page: nextPage,
                    }));
                  }}
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
          layoutOptions={PRODUCT_LAYOUT_OPTIONS}
          switchTypeOptions={PRODUCT_SWITCH_TYPE_OPTIONS}
          featureOptions={PRODUCT_FEATURE_OPTIONS}
          caseMaterialOptions={PRODUCT_CASE_MATERIAL_OPTIONS}
          selectedLayouts={filterState.layouts}
          selectedSwitchTypes={filterState.switchTypes}
          selectedFeatures={filterState.features}
          selectedCaseMaterial={filterState.caseMaterial}
          selectedPrice={filterState.price}
          priceBounds={PRODUCT_PRICE_BOUNDS}
          onToggleLayout={(layout: ProductLayout) => {
            setFilterState((previous) => ({
              ...previous,
              layouts: toggleSelection(previous.layouts, layout),
              page: 1,
            }));
          }}
          onToggleSwitchType={(switchType: ProductSwitchType) => {
            setFilterState((previous) => ({
              ...previous,
              switchTypes: toggleSelection(previous.switchTypes, switchType),
              page: 1,
            }));
          }}
          onToggleFeature={(feature: ProductFeature) => {
            setFilterState((previous) => ({
              ...previous,
              features: toggleSelection(previous.features, feature),
              page: 1,
            }));
          }}
          onCaseMaterialChange={(material: ProductCaseMaterial | 'All') => {
            setFilterState((previous) => ({
              ...previous,
              caseMaterial: material,
              page: 1,
            }));
          }}
          onPriceChange={handlePriceChange}
          onReset={resetFilters}
          className="border-border/70 bg-card/20 p-0"
        />
      </MobileProductFiltersDrawer>
    </div>
  );
}
