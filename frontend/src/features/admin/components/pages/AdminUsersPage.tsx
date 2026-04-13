'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';

import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import {
  AdminUserDeleteDialog,
  AdminUserFormDialog,
  AdminUsersTable,
  AdminUsersTableSkeleton,
  AdminUsersToolbar,
} from '@/features/admin/components/users';
import {
  useCreateAdminUserMutation,
  useAdminUsersQuery,
  useAdminUsersQueryState,
  useRestoreAdminUserMutation,
  useSoftDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminUserRoleMutation,
} from '@/features/admin/hooks';
import type { AdminUser } from '@/features/admin/types/admin-users.types';
import type { UpsertAdminUserInput } from '@/features/admin/types/admin-users.types';
import { getAuthSession } from '@/lib/auth-session';
import { canManageUsersCrud, type UserRole } from '@/lib/rbac';

export function AdminUsersPage() {
  const { queryState, setSearch, setRole, setStatus, setSort, setPage } =
    useAdminUsersQueryState();

  const usersQuery = useAdminUsersQuery(queryState);

  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useSoftDeleteAdminUserMutation();
  const restoreMutation = useRestoreAdminUserMutation();
  const updateRoleMutation = useUpdateAdminUserRoleMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const users = usersQuery.data?.items ?? [];
  const summary = usersQuery.data?.summary;
  const meta = usersQuery.data?.meta;

  const actorRole = getAuthSession()?.role ?? 'customer';
  const canManageCrud = canManageUsersCrud(actorRole);
  const mode = editingUser ? 'edit' : 'create';

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    updateRoleMutation.isPending;

  const handleCreateClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    if (!canManageCrud) {
      return;
    }

    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    if (!canManageCrud) {
      return;
    }

    setDeletingUser(user);
  };

  const handleRestore = (user: AdminUser) => {
    if (!canManageCrud) {
      return;
    }

    restoreMutation.mutate({
      actorRole,
      userId: user.id,
    });
  };

  const handleRoleChange = (userId: string, nextRole: UserRole) => {
    updateRoleMutation.mutate({
      actorRole,
      nextRole,
      userId,
    });
  };

  const handleSubmitUser = (input: Omit<UpsertAdminUserInput, 'actorRole'>) => {
    if (mode === 'edit') {
      updateMutation.mutate(
        {
          ...input,
          actorRole,
        },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingUser(null);
          },
        }
      );
      return;
    }

    createMutation.mutate(
      {
        ...input,
        actorRole,
      },
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) {
      return;
    }

    deleteMutation.mutate(
      {
        actorRole,
        userId: deletingUser.id,
      },
      {
        onSuccess: () => {
          setDeletingUser(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <AdminUsersToolbar
        actorRole={actorRole}
        queryState={queryState}
        summary={summary}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onCreateClick={handleCreateClick}
      />

      <AdminListStateCard
        isLoading={usersQuery.isLoading}
        loadingSkeleton={<AdminUsersTableSkeleton />}
        isEmpty={users.length === 0}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="Try another filter or search phrase."
        emptyActionLabel={canManageCrud ? 'Add User' : undefined}
        onEmptyActionClick={canManageCrud ? handleCreateClick : undefined}
      >
        <AdminUsersTable
          users={users}
          actorRole={actorRole}
          isUpdatingRole={updateRoleMutation.isPending}
          onRoleChange={handleRoleChange}
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

      <AdminUserFormDialog
        mode={mode}
        open={isFormOpen}
        user={editingUser}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingUser(null);
          }
        }}
        onSubmit={handleSubmitUser}
      />

      <AdminUserDeleteDialog
        user={deletingUser}
        open={Boolean(deletingUser)}
        isSubmitting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUser(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
