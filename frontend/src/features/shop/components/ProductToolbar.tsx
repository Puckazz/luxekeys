import { Grid2X2, List, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { ProductToolbarProps } from '@/features/shop/types/product-list.types';

export default function ProductToolbar({
  totalItems,
  viewMode,
  sort,
  sortOptions,
  onViewModeChange,
  onSortChange,
  onOpenFilters,
}: ProductToolbarProps) {
  const isSortOption = (
    value: string
  ): value is ProductToolbarProps['sort'] => {
    return sortOptions.some((option) => option.value === value);
  };

  return (
    <div className="border-border/60 bg-card/35 flex flex-wrap items-center gap-3 rounded-2xl border p-4">
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={onOpenFilters}
      >
        <SlidersHorizontal className="size-4" />
        Filters
      </Button>

      <p className="text-muted-foreground text-sm sm:mr-auto">
        Showing{' '}
        <span className="text-foreground font-semibold">{totalItems}</span>{' '}
        products
      </p>

      <div className="bg-input/30 border-border/70 inline-flex items-center rounded-full border p-1 gap-1">
        <Button
          size="sm"
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => onViewModeChange('grid')}
          aria-label="Grid view"
        >
          <Grid2X2 className="size-4" />
          <span className="hidden sm:inline">Grid</span>
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
        >
          <List className="size-4" />
          <span className="hidden sm:inline">List</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="product-sort" className="text-muted-foreground text-sm">
          Sort by:
        </label>
        <Select
          value={sort}
          onValueChange={(value) => {
            if (isSortOption(value)) {
              onSortChange(value);
            }
          }}
        >
          <SelectTrigger id="product-sort" className="h-10 min-w-44">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
