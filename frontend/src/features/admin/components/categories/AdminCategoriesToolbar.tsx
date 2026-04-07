'use client';

import { useEffect, useState } from 'react';
import { Filter, Plus, Search } from 'lucide-react';

import { ADMIN_CATEGORY_STATUSES } from '@/features/admin/types';
import type { AdminCategoryListQueryState } from '@/features/admin/types/admin-categories.types';
import {
  adminCategorySortLabelByValue,
  adminCategoryStatusLabelByValue,
} from '@/features/admin/utils/admin-categories.utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
            Categories
          </h1>
          <p className="text-muted-foreground text-sm">
            Organize catalog groups and control category visibility.
          </p>
        </div>

        <Button type="button" size="sm" onClick={onCreateClick}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-card/35 border-border/70 rounded-2xl border p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="w-full lg:max-w-sm">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search category name or slug"
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
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
          </div>
        </div>
      </div>
    </div>
  );
}
