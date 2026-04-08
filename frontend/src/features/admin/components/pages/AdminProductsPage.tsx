'use client';

import { useState } from 'react';
import { PackageSearch } from 'lucide-react';

import {
  useAdminProductsQuery,
  useAdminProductsQueryState,
  useCreateAdminProductMutation,
  useRestoreAdminProductMutation,
  useSoftDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
} from '@/features/admin/hooks';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import type { AdminProduct } from '@/features/admin/types';
import type { UpsertAdminProductInput } from '@/features/admin/types/admin-products.types';

import { AdminProductDeleteDialog } from '@/features/admin/components/products/AdminProductDeleteDialog';
import { AdminProductFormDialog } from '@/features/admin/components/products/AdminProductFormDialog';
import { AdminProductsTable } from '@/features/admin/components/products/AdminProductsTable';
import { AdminProductsToolbar } from '@/features/admin/components/products/AdminProductsToolbar';

export function AdminProductsPage() {
  const { queryState, setSearch, setCategory, setStatus, setSort, setPage } =
    useAdminProductsQueryState();

  const productsQuery = useAdminProductsQuery(queryState);

  const createMutation = useCreateAdminProductMutation();
  const updateMutation = useUpdateAdminProductMutation();
  const deleteMutation = useSoftDeleteAdminProductMutation();
  const restoreMutation = useRestoreAdminProductMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(
    null
  );

  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending;

  const mode = editingProduct ? 'edit' : 'create';

  const handleCreateClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: AdminProduct) => {
    setDeletingProduct(product);
  };

  const handleSubmitProduct = (input: UpsertAdminProductInput) => {
    if (mode === 'edit') {
      updateMutation.mutate(input, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingProduct(null);
        },
      });
      return;
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) {
      return;
    }

    deleteMutation.mutate(deletingProduct.id, {
      onSuccess: () => {
        setDeletingProduct(null);
      },
    });
  };

  const handleRestore = (product: AdminProduct) => {
    restoreMutation.mutate(product.id);
  };

  return (
    <div className="space-y-4">
      <AdminProductsToolbar
        queryState={queryState}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onCreateClick={handleCreateClick}
      />

      <AdminListStateCard
        isLoading={productsQuery.isLoading}
        isEmpty={products.length === 0}
        emptyIcon={PackageSearch}
        emptyTitle="No products found"
        emptyDescription="Update your filters or add a new product."
        emptyActionLabel="Add Product"
        onEmptyActionClick={handleCreateClick}
      >
        <AdminProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </AdminListStateCard>

      {meta ? (
        <AdminListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      <AdminProductFormDialog
        mode={mode}
        open={isFormOpen}
        product={editingProduct}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
        onSubmit={handleSubmitProduct}
      />

      <AdminProductDeleteDialog
        product={deletingProduct}
        open={Boolean(deletingProduct)}
        isSubmitting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProduct(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
