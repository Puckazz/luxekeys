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
import { AdminListPagination } from '@/features/admin/components/common/AdminListPagination';
import type { AdminProduct } from '@/features/admin/types';
import type { UpsertAdminProductInput } from '@/features/admin/types/admin-products.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Spinner } from '@/shared/components/ui/spinner';

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

      {productsQuery.isLoading ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="items-center justify-center py-16">
            <Spinner />
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="py-12 text-center">
            <PackageSearch className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground mt-3 font-semibold">
              No products found
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Update your filters or add a new product.
            </p>
            <div className="mt-4">
              <Button type="button" size="sm" onClick={handleCreateClick}>
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="p-0">
            <AdminProductsTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
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
