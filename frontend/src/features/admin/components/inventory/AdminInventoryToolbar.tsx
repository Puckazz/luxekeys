'use client';

import { useEffect, useState } from 'react';
import { Filter, Layers3, Search } from 'lucide-react';

import { ADMIN_PRODUCT_CATEGORIES } from '@/features/admin/types';
import {
  ADMIN_INVENTORY_STATUS_FILTER_OPTIONS,
  type AdminInventoryListQueryState,
} from '@/features/admin/types/admin-inventory.types';
import { ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE } from '@/features/admin/utils/admin-products.constants';
import {
  adminInventorySortLabelByValue,
  adminInventoryStockStatusLabelByValue,
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

type AdminInventoryToolbarProps = {
  queryState: AdminInventoryListQueryState;
  selectedCount: number;
  onSearchChange: (search: string) => void;
  onCategoryChange: (
    category: AdminInventoryListQueryState['category']
  ) => void;
  onStatusChange: (status: AdminInventoryListQueryState['status']) => void;
  onSortChange: (sort: AdminInventoryListQueryState['sort']) => void;
  onBulkUpdateClick: () => void;
};

export function AdminInventoryToolbar({
  queryState,
  selectedCount,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onBulkUpdateClick,
}: AdminInventoryToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(queryState.search);

  useEffect(() => {
    setSearchDraft(queryState.search);
  }, [queryState.search]);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      if (searchDraft !== queryState.search) {
        onSearchChange(searchDraft);
      }
    }, 350);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [onSearchChange, queryState.search, searchDraft]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Inventory
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor stock by variant and update quantities in bulk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="lg"
            onClick={onBulkUpdateClick}
            disabled={selectedCount <= 0}
          >
            <Layers3 className="size-4" />
            Bulk Update
          </Button>
        </div>
      </div>

      <div className="bg-card/35 border-border/70 rounded-2xl border p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="w-full lg:max-w-sm">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search product, SKU or variant"
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <Select
              value={queryState.category}
              onValueChange={(value) =>
                onCategoryChange(
                  value as AdminInventoryListQueryState['category']
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
                    {ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryState.status}
              onValueChange={(value) =>
                onStatusChange(value as AdminInventoryListQueryState['status'])
              }
            >
              <SelectTrigger size="sm" className="h-11 min-w-40">
                <Filter className="size-4" />
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ADMIN_INVENTORY_STATUS_FILTER_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {adminInventoryStockStatusLabelByValue[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryState.sort}
              onValueChange={(value) =>
                onSortChange(value as AdminInventoryListQueryState['sort'])
              }
            >
              <SelectTrigger size="sm" className="h-11 min-w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(adminInventorySortLabelByValue).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
