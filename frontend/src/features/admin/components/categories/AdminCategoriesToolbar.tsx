'use client';

import { Filter, Plus } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import { ADMIN_CATEGORY_STATUSES } from '@/features/admin/types';
import type { AdminCategoryListQueryState } from '@/features/admin/types/admin-categories.types';
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
  onSearchChange: (search: string) => void;
  onStatusChange: (status: AdminCategoryListQueryState['status']) => void;
  onSortChange: (sort: AdminCategoryListQueryState['sort']) => void;
  onCreateClick: () => void;
};

export function AdminCategoriesToolbar({
  queryState,
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
          value={queryState.status}
          onValueChange={(value) =>
            onStatusChange(value as AdminCategoryListQueryState['status'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-36">
            <Filter className="size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ADMIN_CATEGORY_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {adminCategoryStatusLabelByValue[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
