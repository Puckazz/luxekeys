'use client';

import { useState } from 'react';
import { Shapes } from 'lucide-react';

import {
  useAdminCategoriesQuery,
  useAdminCategoriesQueryState,
  useCreateAdminCategoryMutation,
  useRestoreAdminCategoryMutation,
  useSoftDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from '@/features/admin/hooks';
import {
  AdminCategoriesTable,
  AdminCategoriesTableSkeleton,
  AdminCategoriesToolbar,
  AdminCategoryDeleteDialog,
  AdminCategoryFormDialog,
} from '@/features/admin/components/categories';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import type { AdminCategory } from '@/features/admin/types';
import type { UpsertAdminCategoryInput } from '@/features/admin/types/admin-categories.types';

export function AdminCategoriesPage() {
  const { queryState, setSearch, setStatus, setSort, setPage } =
    useAdminCategoriesQueryState();

  const categoriesQuery = useAdminCategoriesQuery(queryState);

  const createMutation = useCreateAdminCategoryMutation();
  const updateMutation = useUpdateAdminCategoryMutation();
  const deleteMutation = useSoftDeleteAdminCategoryMutation();
  const restoreMutation = useRestoreAdminCategoryMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  );
  const [deletingCategory, setDeletingCategory] =
    useState<AdminCategory | null>(null);

  const categories = categoriesQuery.data?.items ?? [];
  const summary = categoriesQuery.data?.summary;
  const meta = categoriesQuery.data?.meta;

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending;

  const mode = editingCategory ? 'edit' : 'create';

  const handleCreateClick = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: AdminCategory) => {
    setDeletingCategory(category);
  };

  const handleRestore = (category: AdminCategory) => {
    restoreMutation.mutate(category.id);
  };

  const handleSubmitCategory = (input: UpsertAdminCategoryInput) => {
    if (mode === 'edit') {
      updateMutation.mutate(input, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingCategory(null);
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
    if (!deletingCategory) {
      return;
    }

    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        setDeletingCategory(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <AdminCategoriesToolbar
        queryState={queryState}
        summary={summary}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onCreateClick={handleCreateClick}
      />

      <AdminListStateCard
        isLoading={categoriesQuery.isLoading}
        loadingSkeleton={<AdminCategoriesTableSkeleton />}
        isEmpty={categories.length === 0}
        emptyIcon={Shapes}
        emptyTitle="No categories found"
        emptyDescription="Update your filters or add a new category."
        emptyActionLabel="Add Category"
        onEmptyActionClick={handleCreateClick}
      >
        <AdminCategoriesTable
          categories={categories}
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

      <AdminCategoryFormDialog
        mode={mode}
        open={isFormOpen}
        category={editingCategory}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        onSubmit={handleSubmitCategory}
      />

      <AdminCategoryDeleteDialog
        category={deletingCategory}
        open={Boolean(deletingCategory)}
        isSubmitting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategory(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
