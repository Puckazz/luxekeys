'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import {
  useAdminOrdersQuery,
  useAdminOrdersQueryState,
  useBulkUpdateAdminOrderStatusMutation,
} from '@/features/admin/hooks';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import {
  AdminOrderDetailsDialog,
  AdminOrdersBulkStatusDialog,
  AdminOrdersTable,
  AdminOrdersToolbar,
} from '@/features/admin/components/orders';
import type { AdminOrder } from '@/features/admin/types/admin-orders.types';
import type { OrderStatus } from '@/features/profile/types';

export function AdminOrdersPage() {
  const { queryState, setSearch, setStatus, setSort, setPage } =
    useAdminOrdersQueryState();

  const ordersQuery = useAdminOrdersQuery(queryState);
  const bulkUpdateMutation = useBulkUpdateAdminOrderStatusMutation();

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    new Set()
  );
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const orders = useMemo<AdminOrder[]>(() => {
    return ordersQuery.data?.items ?? [];
  }, [ordersQuery.data?.items]);

  const summary = ordersQuery.data?.summary;
  const meta = ordersQuery.data?.meta;

  const selectedOrders = useMemo<AdminOrder[]>(() => {
    return orders.filter((order) => selectedOrderIds.has(order.id));
  }, [orders, selectedOrderIds]);

  useEffect(() => {
    setSelectedOrderIds((previous) => {
      const allowedIds = new Set(orders.map((order) => order.id));
      const next = new Set<string>();

      previous.forEach((orderId) => {
        if (allowedIds.has(orderId)) {
          next.add(orderId);
        }
      });

      return next;
    });
  }, [orders]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(new Set(orders.map((order) => order.id)));
      return;
    }

    setSelectedOrderIds(new Set());
  };

  const handleToggleOrder = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }

      return next;
    });
  };

  const handleOpenBulkDialog = () => {
    if (selectedOrders.length <= 0) {
      return;
    }

    setIsBulkDialogOpen(true);
  };

  const handleBulkSubmit = (status: OrderStatus) => {
    if (selectedOrders.length <= 0) {
      return;
    }

    bulkUpdateMutation.mutate(
      {
        orderIds: selectedOrders.map((order) => order.id),
        status,
      },
      {
        onSuccess: () => {
          setSelectedOrderIds(new Set());
          setIsBulkDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <AdminOrdersToolbar
        queryState={queryState}
        summary={summary}
        selectedCount={selectedOrders.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onBulkUpdateClick={handleOpenBulkDialog}
      />

      <AdminListStateCard
        isLoading={ordersQuery.isLoading}
        isEmpty={orders.length === 0}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders found"
        emptyDescription="Try a different search term or status filter."
        emptyActionLabel="Reset Search"
        onEmptyActionClick={() => setSearch('')}
      >
        <AdminOrdersTable
          orders={orders}
          selectedOrderIds={selectedOrderIds}
          onToggleAll={handleToggleAll}
          onToggleOrder={handleToggleOrder}
          onViewDetail={setViewingOrderId}
        />
      </AdminListStateCard>

      {meta ? (
        <AdminListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      <AdminOrdersBulkStatusDialog
        open={isBulkDialogOpen}
        selectedCount={selectedOrders.length}
        isSubmitting={bulkUpdateMutation.isPending}
        onOpenChange={setIsBulkDialogOpen}
        onSubmit={handleBulkSubmit}
      />

      <AdminOrderDetailsDialog
        orderId={viewingOrderId}
        open={Boolean(viewingOrderId)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingOrderId(null);
          }
        }}
      />
    </div>
  );
}
