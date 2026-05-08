import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Slider } from '@/shared/components/ui/slider';
import { KeycapProfile } from '@/features/shop/types';
import type {
  ProductFiltersProps,
  ProductPriceRange,
} from '@/features/shop/types/product-list.types';
import { useProductFiltersStore } from '@/stores/shop/productFilters.store';
import { formatCurrency } from '@/lib/formatters';

const toInputId = (prefix: string, value: string): string => {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const normalizePriceRange = (
  range: ProductPriceRange,
  bounds: ProductPriceRange
): ProductPriceRange => {
  const min = clamp(range.min, bounds.min, bounds.max);
  const max = clamp(range.max, bounds.min, bounds.max);

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
};

type PriceRangeFilterProps = {
  selectedPrice: ProductPriceRange;
  priceBounds: ProductPriceRange;
  onPriceChange: (next: ProductPriceRange) => void;
};

function PriceRangeFilter({
  selectedPrice,
  priceBounds,
  onPriceChange,
}: PriceRangeFilterProps) {
  const [draftPrice, setDraftPrice] = useState(() =>
    normalizePriceRange(selectedPrice, priceBounds)
  );
  const [minInput, setMinInput] = useState(String(selectedPrice.min));
  const [maxInput, setMaxInput] = useState(String(selectedPrice.max));
  const draftPriceRef = useRef(draftPrice);
  const selectedPriceRef = useRef(selectedPrice);

  useEffect(() => {
    const nextPrice = normalizePriceRange(selectedPrice, priceBounds);
    draftPriceRef.current = nextPrice;
    selectedPriceRef.current = nextPrice;
    setDraftPrice(nextPrice);
    setMinInput(String(nextPrice.min));
    setMaxInput(String(nextPrice.max));
  }, [selectedPrice, priceBounds]);

  const inputDraftPrice = useMemo(() => {
    const parsedMin = Number(minInput);
    const parsedMax = Number(maxInput);

    if (!Number.isFinite(parsedMin) || !Number.isFinite(parsedMax)) {
      return null;
    }

    return normalizePriceRange(
      {
        min: parsedMin,
        max: parsedMax,
      },
      priceBounds
    );
  }, [maxInput, minInput, priceBounds]);

  const hasInputChanges =
    inputDraftPrice !== null &&
    (inputDraftPrice.min !== selectedPrice.min ||
      inputDraftPrice.max !== selectedPrice.max);

  const commitPriceChange = (nextPrice: ProductPriceRange) => {
    const normalizedPrice = normalizePriceRange(nextPrice, priceBounds);
    const currentSelectedPrice = selectedPriceRef.current;
    draftPriceRef.current = normalizedPrice;
    setDraftPrice(normalizedPrice);
    setMinInput(String(normalizedPrice.min));
    setMaxInput(String(normalizedPrice.max));

    if (
      normalizedPrice.min !== currentSelectedPrice.min ||
      normalizedPrice.max !== currentSelectedPrice.max
    ) {
      onPriceChange(normalizedPrice);
    }
  };

  const handleSliderValueChange = (value: number[]) => {
    const [min, max] = value;
    if (typeof min !== 'number' || typeof max !== 'number') {
      return;
    }

    const nextPrice = normalizePriceRange({ min, max }, priceBounds);
    draftPriceRef.current = nextPrice;
    setDraftPrice(nextPrice);
    setMinInput(String(nextPrice.min));
    setMaxInput(String(nextPrice.max));
  };

  const handleSliderValueCommit = (value: number[]) => {
    const [min, max] = value;

    if (typeof min === 'number' && typeof max === 'number') {
      commitPriceChange({ min, max });
      return;
    }

    commitPriceChange(draftPriceRef.current);
  };

  const handleInputApply = () => {
    if (!inputDraftPrice) {
      return;
    }

    commitPriceChange(inputDraftPrice);
  };

  return (
    <section className="border-border/50 border-t pt-5">
      <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        Price Range
      </h3>

      <div className="space-y-3">
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={1}
          value={[draftPrice.min, draftPrice.max]}
          onValueChange={handleSliderValueChange}
          onValueCommit={handleSliderValueCommit}
          aria-label="Price range"
        />
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Min:{' '}
            {formatCurrency(draftPrice.min, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span>
            Max:{' '}
            {formatCurrency(draftPrice.max, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor="price-min-input"
            className="text-muted-foreground mb-1 block text-xs"
          >
            Min
          </label>
          <Input
            id="price-min-input"
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            value={minInput}
            onChange={(event) => setMinInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleInputApply();
              }
            }}
            className="h-10"
          />
        </div>
        <div>
          <label
            htmlFor="price-max-input"
            className="text-muted-foreground mb-1 block text-xs"
          >
            Max
          </label>
          <Input
            id="price-max-input"
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            value={maxInput}
            onChange={(event) => setMaxInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleInputApply();
              }
            }}
            className="h-10"
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full rounded-full"
        onClick={handleInputApply}
        disabled={!hasInputChanges}
      >
        Apply price
      </Button>
    </section>
  );
}

export default function ProductFilters({ className }: ProductFiltersProps) {
  const controller = useProductFiltersStore((state) => state.controller);

  if (!controller) {
    return null;
  }

  const {
    categoryOptions,
    selectedCategories,
    capabilities,
    brandOptions,
    keycapProfileOptions,
    layoutOptions,
    switchTypeOptions,
    selectedBrands,
    selectedKeycapProfiles,
    selectedLayouts,
    selectedSwitchTypes,
    selectedPrice,
    priceBounds,
    onToggleCategory,
    onToggleBrand,
    onToggleKeycapProfile,
    onToggleLayout,
    onToggleSwitchType,
    onPriceChange,
    onReset,
  } = controller;

  const isAllProductsPage = controller.showCategoryFilter;
  const hasSelectedCategory = selectedCategories.length > 0;
  const showBrandFilter = isAllProductsPage || capabilities.showBrandFilter;
  const showProfileFilter = isAllProductsPage || capabilities.showProfileFilter;
  const showLayoutFilter = isAllProductsPage || capabilities.showLayoutFilter;
  const showSwitchTypeFilter =
    isAllProductsPage || capabilities.showSwitchTypeFilter;
  const disableBrandFilter =
    isAllProductsPage && hasSelectedCategory && !capabilities.showBrandFilter;
  const disableProfileFilter =
    isAllProductsPage && hasSelectedCategory && !capabilities.showProfileFilter;
  const disableLayoutFilter =
    isAllProductsPage && hasSelectedCategory && !capabilities.showLayoutFilter;
  const disableSwitchTypeFilter =
    isAllProductsPage &&
    hasSelectedCategory &&
    !capabilities.showSwitchTypeFilter;

  return (
    <div
      className={cn(
        'border-border/70 bg-card/35 rounded-2xl border p-4 sm:p-5',
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal className="text-primary size-4" />
          Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset all
        </Button>
      </div>

      <div className="space-y-6">
        {controller.showCategoryFilter ? (
          <section>
            <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Category
            </h3>
            <div className="space-y-3">
              {categoryOptions.map((categoryOption) => {
                const id = toInputId('category', categoryOption.value);
                return (
                  <label
                    key={categoryOption.value}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      id={id}
                      checked={selectedCategories.includes(
                        categoryOption.value
                      )}
                      onCheckedChange={() =>
                        onToggleCategory(categoryOption.value)
                      }
                    />
                    <span className="text-muted-foreground text-sm">
                      {categoryOption.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        {showBrandFilter ? (
          <section className="border-border/50 border-t pt-5">
            <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Brand
            </h3>
            <div className="space-y-3">
              {brandOptions.length > 0 ? (
                brandOptions.map((brand) => {
                  const id = toInputId('brand', brand.slug);
                  return (
                    <label
                      key={brand.id}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Checkbox
                        id={id}
                        checked={selectedBrands.includes(brand.slug)}
                        onCheckedChange={() => onToggleBrand(brand.slug)}
                        disabled={disableBrandFilter}
                      />
                      <span className="text-muted-foreground text-sm">
                        {brand.name}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">
                  No brand filters available.
                </p>
              )}
            </div>
          </section>
        ) : null}

        {showProfileFilter ? (
          <section className="border-border/50 border-t pt-5">
            <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Profile
            </h3>
            <div className="space-y-3">
              {keycapProfileOptions.map((profile) => {
                const id = toInputId('profile', profile);
                return (
                  <label
                    key={profile}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      id={id}
                      checked={selectedKeycapProfiles.includes(profile)}
                      onCheckedChange={() => onToggleKeycapProfile(profile)}
                      disabled={disableProfileFilter}
                    />
                    <span className="text-muted-foreground text-sm">
                      {profile}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        {showLayoutFilter ? (
          <section className="border-border/50 border-t pt-5">
            <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Layout
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {layoutOptions.map((layout) => {
                const active = selectedLayouts.includes(layout);
                return (
                  <Button
                    key={layout}
                    variant={active ? 'default' : 'outline'}
                    size="lg"
                    className="justify-center rounded-full"
                    onClick={() => onToggleLayout(layout)}
                    disabled={disableLayoutFilter}
                  >
                    {layout}
                  </Button>
                );
              })}
            </div>
          </section>
        ) : null}

        {showSwitchTypeFilter ? (
          <section className="border-border/50 border-t pt-5">
            <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Switch Type
            </h3>
            <div className="space-y-3">
              {switchTypeOptions.map((switchType) => {
                const id = toInputId('switch', switchType);
                return (
                  <label
                    key={switchType}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      id={id}
                      checked={selectedSwitchTypes.includes(switchType)}
                      onCheckedChange={() => onToggleSwitchType(switchType)}
                      disabled={disableSwitchTypeFilter}
                    />
                    <span className="text-muted-foreground text-sm">
                      {switchType}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        <PriceRangeFilter
          selectedPrice={selectedPrice}
          priceBounds={priceBounds}
          onPriceChange={onPriceChange}
        />
      </div>
    </div>
  );
}
