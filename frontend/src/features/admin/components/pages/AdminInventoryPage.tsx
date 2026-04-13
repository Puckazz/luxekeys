'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArchiveX } from 'lucide-react';

import {
  useAdminInventoryQuery,
  useAdminInventoryQueryState,
  useBulkUpdateInventoryStockMutation,
  useUpdateAdminProductMutation,
} from '@/features/admin/hooks';
import {
  AdminInventoryBulkUpdateDialog,
  AdminInventoryStats,
  AdminInventoryStatsSkeleton,
  AdminInventoryTable,
  AdminInventoryTableSkeleton,
  AdminInventoryToolbar,
} from '@/features/admin/components/inventory';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import { AdminProductFormDialog } from '@/features/admin/components/products';
import type { AdminProduct } from '@/features/admin/types';
import type { UpsertAdminProductInput } from '@/features/admin/types/admin-products.types';

export function AdminInventoryPage() {
  const { queryState, setSearch, setCategory, setStatus, setSort, setPage } =
    useAdminInventoryQueryState();

  const inventoryQuery = useAdminInventoryQuery(queryState);
  const bulkUpdateMutation = useBulkUpdateInventoryStockMutation();
  const updateProductMutation = useUpdateAdminProductMutation();

  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(
    new Set()
  );
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );

  const items = useMemo(() => {
    return inventoryQuery.data?.items ?? [];
  }, [inventoryQuery.data?.items]);
  const summary = inventoryQuery.data?.summary;
  const statusSummary = inventoryQuery.data?.statusSummary;
  const meta = inventoryQuery.data?.meta;

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedVariantIds.has(item.variantId));
  }, [items, selectedVariantIds]);

  const selectedCount = selectedItems.length;

  useEffect(() => {
    setSelectedVariantIds((previous) => {
      const allowedIds = new Set(items.map((item) => item.variantId));
      const next = new Set<string>();

      previous.forEach((variantId) => {
        if (allowedIds.has(variantId)) {
          next.add(variantId);
        }
      });

      return next;
    });
  }, [items]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedVariantIds(new Set(items.map((item) => item.variantId)));
      return;
    }

    setSelectedVariantIds(new Set());
  };

  const handleToggleVariant = (variantId: string, checked: boolean) => {
    setSelectedVariantIds((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(variantId);
      } else {
        next.delete(variantId);
      }

      return next;
    });
  };

  const handleOpenBulkDialog = () => {
    if (selectedCount <= 0) {
      return;
    }

    setIsBulkDialogOpen(true);
  };

  const handleBulkSubmit = (stock: number) => {
    if (selectedItems.length <= 0) {
      return;
    }

    bulkUpdateMutation.mutate(
      {
        updates: selectedItems.map((item) => ({
          productId: item.product.id,
          variantId: item.variantId,
          stock,
        })),
      },
      {
        onSuccess: () => {
          setSelectedVariantIds(new Set());
          setIsBulkDialogOpen(false);
        },
      }
    );
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
  };

  const handleSubmitProduct = (input: UpsertAdminProductInput) => {
    updateProductMutation.mutate(input, {
      onSuccess: () => {
        setEditingProduct(null);
      },
    });
  };

  const isMutating =
    bulkUpdateMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="space-y-4">
      <AdminInventoryToolbar
        queryState={queryState}
        statusSummary={statusSummary}
        selectedCount={selectedCount}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onBulkUpdateClick={handleOpenBulkDialog}
      />

      {inventoryQuery.isLoading ? <AdminInventoryStatsSkeleton /> : null}
      {summary ? <AdminInventoryStats summary={summary} /> : null}

      <AdminListStateCard
        isLoading={inventoryQuery.isLoading}
        loadingSkeleton={<AdminInventoryTableSkeleton />}
        isEmpty={items.length === 0}
        emptyIcon={ArchiveX}
        emptyTitle="No inventory rows found"
        emptyDescription="Adjust filters or update product variants to see stock entries."
        emptyActionLabel="Reset Search"
        onEmptyActionClick={() => setSearch('')}
      >
        <AdminInventoryTable
          items={items}
          selectedVariantIds={selectedVariantIds}
          onToggleAll={handleToggleAll}
          onToggleVariant={handleToggleVariant}
          onEditProduct={handleEditProduct}
        />
      </AdminListStateCard>

      {meta ? (
        <AdminListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      <AdminInventoryBulkUpdateDialog
        open={isBulkDialogOpen}
        selectedCount={selectedCount}
        isSubmitting={bulkUpdateMutation.isPending}
        onOpenChange={setIsBulkDialogOpen}
        onSubmit={handleBulkSubmit}
      />

      <AdminProductFormDialog
        mode="edit"
        open={Boolean(editingProduct)}
        product={editingProduct}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
        onSubmit={handleSubmitProduct}
      />
    </div>
  );
}
