'use client';

import { Filter, Layers3 } from 'lucide-react';

import { AdminDebouncedSearchInput } from '@/features/admin/components/common/AdminDebouncedSearchInput';
import { AdminToolbarFiltersPanel } from '@/features/admin/components/common/AdminToolbarFiltersPanel';
import { AdminToolbarHeader } from '@/features/admin/components/common/AdminToolbarHeader';
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
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Inventory"
        description="Monitor stock by variant and update quantities in bulk."
        actions={
          <Button
            type="button"
            size="lg"
            onClick={onBulkUpdateClick}
            disabled={selectedCount <= 0}
          >
            <Layers3 className="size-4" />
            Bulk Update
          </Button>
        }
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search product, SKU or variant"
          />
        }
      >
        <Select
          value={queryState.category}
          onValueChange={(value) =>
            onCategoryChange(value as AdminInventoryListQueryState['category'])
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
      </AdminToolbarFiltersPanel>
    </div>
  );
}
