'use client';

import { useState } from 'react';
import { Tags } from 'lucide-react';

import {
  useAdminBrandsQuery,
  useAdminBrandsQueryState,
  useCreateAdminBrandMutation,
  useRestoreAdminBrandMutation,
  useSoftDeleteAdminBrandMutation,
  useUpdateAdminBrandMutation,
} from '@/features/admin/hooks';
import {
  AdminBrandDeleteDialog,
  AdminBrandFormDialog,
  AdminBrandsTable,
  AdminBrandsTableSkeleton,
  AdminBrandsToolbar,
} from '@/features/admin/components/brands';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import type { AdminBrand } from '@/features/admin/types';
import type { UpsertAdminBrandInput } from '@/features/admin/types/admin-brands.types';

export function AdminBrandsPage() {
  const { queryState, setSearch, setStatus, setSort, setPage } =
    useAdminBrandsQueryState();

  const brandsQuery = useAdminBrandsQuery(queryState);

  const createMutation = useCreateAdminBrandMutation();
  const updateMutation = useUpdateAdminBrandMutation();
  const deleteMutation = useSoftDeleteAdminBrandMutation();
  const restoreMutation = useRestoreAdminBrandMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<AdminBrand | null>(null);

  const brands = brandsQuery.data?.items ?? [];
  const summary = brandsQuery.data?.summary;
  const meta = brandsQuery.data?.meta;

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending;

  const mode = editingBrand ? 'edit' : 'create';

  const handleCreateClick = () => {
    setEditingBrand(null);
    setIsFormOpen(true);
  };

  const handleEdit = (brand: AdminBrand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDelete = (brand: AdminBrand) => {
    setDeletingBrand(brand);
  };

  const handleRestore = (brand: AdminBrand) => {
    restoreMutation.mutate(brand.id);
  };

  const handleSubmitBrand = (input: UpsertAdminBrandInput) => {
    if (mode === 'edit') {
      updateMutation.mutate(input, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingBrand(null);
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
    if (!deletingBrand) {
      return;
    }

    deleteMutation.mutate(deletingBrand.id, {
      onSuccess: () => {
        setDeletingBrand(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <AdminBrandsToolbar
        queryState={queryState}
        summary={summary}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onCreateClick={handleCreateClick}
      />

      <AdminListStateCard
        isLoading={brandsQuery.isLoading}
        loadingSkeleton={<AdminBrandsTableSkeleton />}
        isEmpty={brands.length === 0}
        emptyIcon={Tags}
        emptyTitle="No brands found"
        emptyDescription="Update your filters or add a new brand."
        emptyActionLabel="Add Brand"
        onEmptyActionClick={handleCreateClick}
      >
        <AdminBrandsTable
          brands={brands}
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

      <AdminBrandFormDialog
        mode={mode}
        open={isFormOpen}
        brand={editingBrand}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingBrand(null);
          }
        }}
        onSubmit={handleSubmitBrand}
      />

      <AdminBrandDeleteDialog
        brand={deletingBrand}
        open={Boolean(deletingBrand)}
        isSubmitting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingBrand(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
