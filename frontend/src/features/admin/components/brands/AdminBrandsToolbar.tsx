'use client';

import { Plus } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import { ADMIN_BRAND_STATUSES } from '@/features/admin/types';
import type {
  AdminBrandListQueryState,
  AdminBrandStatusSummary,
} from '@/features/admin/types/admin-brands.types';
import {
  adminBrandSortLabelByValue,
  adminBrandStatusLabelByValue,
} from '@/features/admin/utils/admin-brands.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminBrandsToolbarProps = {
  queryState: AdminBrandListQueryState;
  summary?: AdminBrandStatusSummary;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: AdminBrandListQueryState['status']) => void;
  onSortChange: (sort: AdminBrandListQueryState['sort']) => void;
  onCreateClick: () => void;
};

const statusQuickFilters: AdminBrandListQueryState['status'][] = [
  'all',
  ...ADMIN_BRAND_STATUSES,
];

const brandStatusFilterLabelByValue: Record<
  AdminBrandListQueryState['status'],
  string
> = {
  all: 'All',
  ...adminBrandStatusLabelByValue,
};

export function AdminBrandsToolbar({
  queryState,
  summary,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminBrandsToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Brands"
        description="Manage vendor visibility and catalog brand metadata."
        actions={
          <Button type="button" size="lg" onClick={onCreateClick}>
            <Plus className="size-4" />
            Add Brand
          </Button>
        }
      />

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={brandStatusFilterLabelByValue}
        summary={summary}
        onValueChange={(status) => onStatusChange(status)}
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search brand name or slug"
          />
        }
      >
        <Select
          value={queryState.sort}
          onValueChange={(value) =>
            onSortChange(value as AdminBrandListQueryState['sort'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(adminBrandSortLabelByValue).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbarFiltersPanel>
    </div>
  );
}
