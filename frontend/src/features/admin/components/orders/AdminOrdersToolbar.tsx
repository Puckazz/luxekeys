'use client';

import { Layers3 } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import type {
  AdminOrderListQueryState,
  AdminOrderStatusSummary,
} from '@/features/admin/types/admin-orders.types';
import {
  adminOrderFilterLabelByValue,
  adminOrderSortLabelByValue,
} from '@/features/admin/utils/admin-orders.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminOrdersToolbarProps = {
  queryState: AdminOrderListQueryState;
  summary?: AdminOrderStatusSummary;
  selectedCount: number;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: AdminOrderListQueryState['status']) => void;
  onSortChange: (sort: AdminOrderListQueryState['sort']) => void;
  onBulkUpdateClick: () => void;
};

const statusQuickFilters: AdminOrderListQueryState['status'][] = [
  'all',
  'pending',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
];

export function AdminOrdersToolbar({
  queryState,
  summary,
  selectedCount,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onBulkUpdateClick,
}: AdminOrdersToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Orders"
        description="Track, review, and update customer orders from one place."
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

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={adminOrderFilterLabelByValue}
        summary={summary}
        onValueChange={(value) =>
          onStatusChange(value as AdminOrderListQueryState['status'])
        }
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search order ID, customer, or payment"
          />
        }
      >
        <Select
          value={queryState.sort}
          onValueChange={(value) =>
            onSortChange(value as AdminOrderListQueryState['sort'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(adminOrderSortLabelByValue).map(
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
