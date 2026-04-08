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
  AdminCategoriesToolbar,
  AdminCategoryDeleteDialog,
  AdminCategoryFormDialog,
} from '@/features/admin/components/categories';
import type { AdminCategory } from '@/features/admin/types';
import type { UpsertAdminCategoryInput } from '@/features/admin/types/admin-categories.types';
import { AdminListPagination } from '@/features/admin/components/common/AdminListPagination';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Spinner } from '@/shared/components/ui/spinner';

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
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onCreateClick={handleCreateClick}
      />

      {categoriesQuery.isLoading ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="items-center justify-center py-16">
            <Spinner />
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="py-12 text-center">
            <Shapes className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground mt-3 font-semibold">
              No categories found
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Update your filters or add a new category.
            </p>
            <div className="mt-4">
              <Button type="button" size="sm" onClick={handleCreateClick}>
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="p-0">
            <AdminCategoriesTable
              categories={categories}
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
