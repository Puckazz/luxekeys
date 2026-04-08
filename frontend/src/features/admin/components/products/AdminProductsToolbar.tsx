'use client';

import { Filter, Plus } from 'lucide-react';

import { AdminDebouncedSearchInput } from '@/features/admin/components/common/AdminDebouncedSearchInput';
import { AdminToolbarFiltersPanel } from '@/features/admin/components/common/AdminToolbarFiltersPanel';
import { AdminToolbarHeader } from '@/features/admin/components/common/AdminToolbarHeader';
import { ADMIN_PRODUCT_CATEGORIES } from '@/features/admin/types';
import {
  ADMIN_PRODUCT_STATUS_FILTER_OPTIONS,
  type AdminProductListQueryState,
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
            {ADMIN_PRODUCT_STATUS_FILTER_OPTIONS.map((status) => (
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
      </AdminToolbarFiltersPanel>
    </div>
  );
}
