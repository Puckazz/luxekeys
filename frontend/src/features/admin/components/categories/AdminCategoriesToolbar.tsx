'use client';

import { Plus } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import { ADMIN_CATEGORY_STATUSES } from '@/features/admin/types';
import type {
  AdminCategoryListQueryState,
  AdminCategoryStatusSummary,
} from '@/features/admin/types/admin-categories.types';
import {
  adminCategorySortLabelByValue,
  adminCategoryStatusLabelByValue,
} from '@/features/admin/utils/admin-categories.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminCategoriesToolbarProps = {
  queryState: AdminCategoryListQueryState;
  summary?: AdminCategoryStatusSummary;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: AdminCategoryListQueryState['status']) => void;
  onSortChange: (sort: AdminCategoryListQueryState['sort']) => void;
  onCreateClick: () => void;
};

const statusQuickFilters: AdminCategoryListQueryState['status'][] = [
  'all',
  ...ADMIN_CATEGORY_STATUSES,
];

const categoryStatusFilterLabelByValue: Record<
  AdminCategoryListQueryState['status'],
  string
> = {
  all: 'All',
  ...adminCategoryStatusLabelByValue,
};

export function AdminCategoriesToolbar({
  queryState,
  summary,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminCategoriesToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Categories"
        description="Organize catalog groups and control category visibility."
        actions={
          <Button type="button" size="sm" onClick={onCreateClick}>
            <Plus className="size-4" />
            Add Category
          </Button>
        }
      />

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={categoryStatusFilterLabelByValue}
        summary={summary}
        onValueChange={(status) => onStatusChange(status)}
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search category name or slug"
          />
        }
      >
        <Select
          value={queryState.sort}
          onValueChange={(value) =>
            onSortChange(value as AdminCategoryListQueryState['sort'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(adminCategorySortLabelByValue).map(
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
