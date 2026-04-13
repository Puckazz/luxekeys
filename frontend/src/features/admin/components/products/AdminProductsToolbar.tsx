'use client';

import { Plus } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import { ADMIN_PRODUCT_CATEGORIES } from '@/features/admin/types';
import {
  ADMIN_PRODUCT_STATUS_FILTER_OPTIONS,
  type AdminProductListQueryState,
  type AdminProductStatusSummary,
} from '@/features/admin/types/admin-products.types';
import { ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE } from '@/features/admin/utils/admin-products.constants';
import {
  adminProductSortLabelByValue,
  adminProductStatusLabelByValue,
} from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminProductsToolbarProps = {
  queryState: AdminProductListQueryState;
  summary?: AdminProductStatusSummary;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: AdminProductListQueryState['category']) => void;
  onStatusChange: (status: AdminProductListQueryState['status']) => void;
  onSortChange: (sort: AdminProductListQueryState['sort']) => void;
  onCreateClick: () => void;
};

const statusQuickFilters: AdminProductListQueryState['status'][] = [
  'all',
  ...ADMIN_PRODUCT_STATUS_FILTER_OPTIONS,
];

const productStatusFilterLabelByValue: Record<
  AdminProductListQueryState['status'],
  string
> = {
  all: 'All',
  ...adminProductStatusLabelByValue,
};

export function AdminProductsToolbar({
  queryState,
  summary,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminProductsToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Products"
        description="Manage catalog products and their variant combinations."
        actions={
          <>
            <Button type="button" variant="outline" size="lg">
              Import
            </Button>
            <Button type="button" size="lg" onClick={onCreateClick}>
              <Plus className="size-4" />
              Add Product
            </Button>
          </>
        }
      />

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={productStatusFilterLabelByValue}
        summary={summary}
        onValueChange={(status) => onStatusChange(status)}
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search product or SKU"
          />
        }
      >
        <Select
          value={queryState.category}
          onValueChange={(value) =>
            onCategoryChange(value as AdminProductListQueryState['category'])
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
      </AdminToolbarFiltersPanel>
    </div>
  );
}
