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
  AdminInventoryTable,
  AdminInventoryToolbar,
} from '@/features/admin/components/inventory';
import { AdminProductFormDialog } from '@/features/admin/components/products';
import { AdminListPagination } from '@/features/admin/components/common/AdminListPagination';
import type { AdminProduct } from '@/features/admin/types';
import type { UpsertAdminProductInput } from '@/features/admin/types/admin-products.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Spinner } from '@/shared/components/ui/spinner';

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
        selectedCount={selectedCount}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onBulkUpdateClick={handleOpenBulkDialog}
      />

      {summary ? <AdminInventoryStats summary={summary} /> : null}

      {inventoryQuery.isLoading ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="items-center justify-center py-16">
            <Spinner />
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="py-12 text-center">
            <ArchiveX className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground mt-3 font-semibold">
              No inventory rows found
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Adjust filters or update product variants to see stock entries.
            </p>
            <div className="mt-4">
              <Button type="button" size="sm" onClick={() => setSearch('')}>
                Reset Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="p-0">
            <AdminInventoryTable
              items={items}
              selectedVariantIds={selectedVariantIds}
              onToggleAll={handleToggleAll}
              onToggleVariant={handleToggleVariant}
              onEditProduct={handleEditProduct}
            />
          </CardContent>
        </Card>
      )}

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
