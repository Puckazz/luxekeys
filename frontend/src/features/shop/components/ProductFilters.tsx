import { SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import {
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductSwitchType,
} from '@/features/shop/types';

type PriceRange = {
  min: number;
  max: number;
};

type ProductFiltersProps = {
  layoutOptions: ProductLayout[];
  switchTypeOptions: ProductSwitchType[];
  featureOptions: ProductFeature[];
  caseMaterialOptions: ProductCaseMaterial[];
  selectedLayouts: ProductLayout[];
  selectedSwitchTypes: ProductSwitchType[];
  selectedFeatures: ProductFeature[];
  selectedCaseMaterial: ProductCaseMaterial | 'All';
  selectedPrice: PriceRange;
  priceBounds: PriceRange;
  onToggleLayout: (layout: ProductLayout) => void;
  onToggleSwitchType: (switchType: ProductSwitchType) => void;
  onToggleFeature: (feature: ProductFeature) => void;
  onCaseMaterialChange: (material: ProductCaseMaterial | 'All') => void;
  onPriceChange: (next: PriceRange) => void;
  onReset: () => void;
  className?: string;
};

const formatCurrency = (value: number): string => {
  return `$${value}`;
};

const toInputId = (prefix: string, value: string): string => {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
};

export default function ProductFilters({
  layoutOptions,
  switchTypeOptions,
  featureOptions,
  caseMaterialOptions,
  selectedLayouts,
  selectedSwitchTypes,
  selectedFeatures,
  selectedCaseMaterial,
  selectedPrice,
  priceBounds,
  onToggleLayout,
  onToggleSwitchType,
  onToggleFeature,
  onCaseMaterialChange,
  onPriceChange,
  onReset,
  className,
}: ProductFiltersProps) {
  const isCaseMaterialValue = (
    value: string
  ): value is ProductCaseMaterial | 'All' => {
    return (
      value === 'All' ||
      caseMaterialOptions.some((material) => material === value)
    );
  };

  const handlePriceMinInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    onPriceChange({
      min: Math.max(priceBounds.min, Math.min(parsed, selectedPrice.max)),
      max: selectedPrice.max,
    });
  };

  const handlePriceMaxInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    onPriceChange({
      min: selectedPrice.min,
      max: Math.min(priceBounds.max, Math.max(parsed, selectedPrice.min)),
    });
  };

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
        <section>
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
                  size="sm"
                  className="justify-center rounded-full"
                  onClick={() => onToggleLayout(layout)}
                >
                  {layout}
                </Button>
              );
            })}
          </div>
        </section>

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
                  />
                  <span className="text-muted-foreground text-sm">
                    {switchType}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="border-border/50 border-t pt-5">
          <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Features
          </h3>
          <div className="space-y-3">
            {featureOptions.map((feature) => {
              const id = toInputId('feature', feature);
              return (
                <label
                  key={feature}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    id={id}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={() => onToggleFeature(feature)}
                  />
                  <span className="text-muted-foreground text-sm">
                    {feature}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="border-border/50 border-t pt-5">
          <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Case Material
          </h3>
          <Select
            value={selectedCaseMaterial}
            onValueChange={(value) => {
              if (isCaseMaterialValue(value)) {
                onCaseMaterialChange(value);
              }
            }}
          >
            <SelectTrigger
              id="case-material"
              className="w-full min-w-full rounded-full"
            >
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Materials</SelectItem>
              {caseMaterialOptions.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="border-border/50 border-t pt-5">
          <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Price Range
          </h3>

          <div className="space-y-3">
            <Slider
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              minStepsBetweenThumbs={5}
              value={[selectedPrice.min, selectedPrice.max]}
              onValueChange={(value) => {
                const [min, max] = value;
                if (typeof min !== 'number' || typeof max !== 'number') {
                  return;
                }

                onPriceChange({ min, max });
              }}
              aria-label="Price range"
            />
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Min: {formatCurrency(selectedPrice.min)}</span>
              <span>Max: {formatCurrency(selectedPrice.max)}</span>
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
                max={selectedPrice.max}
                value={selectedPrice.min}
                onChange={(event) => handlePriceMinInput(event.target.value)}
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
                min={selectedPrice.min}
                max={priceBounds.max}
                value={selectedPrice.max}
                onChange={(event) => handlePriceMaxInput(event.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
