'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Filter, Plus, Search } from 'lucide-react';

import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_PRODUCT_STATUSES,
} from '@/features/admin/types';
import type { AdminProductListQueryState } from '@/features/admin/types/admin-products.types';
import {
  adminProductSortLabelByValue,
  adminProductStatusLabelByValue,
} from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const categoryLabelByValue: Record<
  (typeof ADMIN_PRODUCT_CATEGORIES)[number],
  string
> = {
  keyboards: 'Keyboards',
  switches: 'Switches',
  keycaps: 'Keycaps',
  accessories: 'Accessories',
};

type AdminProductsToolbarProps = {
  queryState: AdminProductListQueryState;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: AdminProductListQueryState['category']) => void;
  onStatusChange: (status: AdminProductListQueryState['status']) => void;
  onSortChange: (sort: AdminProductListQueryState['sort']) => void;
  onCreateClick: () => void;
};

export function AdminProductsToolbar({
  queryState,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminProductsToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(queryState.search);

  useEffect(() => {
    setSearchDraft(queryState.search);
  }, [queryState.search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchChange(searchDraft);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage catalog products and their variant combinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Import
          </Button>
          <Button type="button" size="sm" onClick={onCreateClick}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-card/35 border-border/70 rounded-2xl border p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <form className="w-full lg:max-w-sm" onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search product or SKU"
                className="h-11 pl-9"
              />
            </div>
          </form>

          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <Select
              value={queryState.category}
              onValueChange={(value) =>
                onCategoryChange(
                  value as AdminProductListQueryState['category']
                )
              }
            >
              <SelectTrigger size="sm" className="h-11 min-w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {ADMIN_PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabelByValue[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryState.status}
              onValueChange={(value) =>
                onStatusChange(value as AdminProductListQueryState['status'])
              }
            >
              <SelectTrigger size="sm" className="h-11 min-w-36">
                <Filter className="size-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ADMIN_PRODUCT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {adminProductStatusLabelByValue[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryState.sort}
              onValueChange={(value) =>
                onSortChange(value as AdminProductListQueryState['sort'])
              }
            >
              <SelectTrigger size="sm" className="h-11 min-w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(adminProductSortLabelByValue).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              type="submit"
              size="sm"
              onClick={() => onSearchChange(searchDraft)}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
