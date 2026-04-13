'use client';

import { Layers3 } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import type {
  AdminReviewListQueryState,
  AdminReviewStatusSummary,
} from '@/features/admin/types/admin-reviews.types';
import {
  adminReviewSortLabelByValue,
  adminReviewStatusFilterLabelByValue,
} from '@/features/admin/utils/admin-reviews.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminReviewsToolbarProps = {
  queryState: AdminReviewListQueryState;
  summary?: AdminReviewStatusSummary;
  selectedCount: number;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: AdminReviewListQueryState['status']) => void;
  onSortChange: (sort: AdminReviewListQueryState['sort']) => void;
  onBulkModerateClick: () => void;
};

const statusQuickFilters: AdminReviewListQueryState['status'][] = [
  'all',
  'published',
  'pending',
  'hidden',
  'rejected',
];

export function AdminReviewsToolbar({
  queryState,
  summary,
  selectedCount,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onBulkModerateClick,
}: AdminReviewsToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Manage Reviews"
        description="Review customer feedback, publish high-quality reviews, and moderate risky content."
        actions={
          <Button
            type="button"
            size="lg"
            onClick={onBulkModerateClick}
            disabled={selectedCount <= 0}
          >
            <Layers3 className="size-4" />
            Bulk Moderate
          </Button>
        }
      />

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={adminReviewStatusFilterLabelByValue}
        summary={summary}
        onValueChange={(value) =>
          onStatusChange(value as AdminReviewListQueryState['status'])
        }
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search review, product, or reviewer"
          />
        }
      >
        <Select
          value={queryState.sort}
          onValueChange={(value) =>
            onSortChange(value as AdminReviewListQueryState['sort'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(adminReviewSortLabelByValue).map(
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
