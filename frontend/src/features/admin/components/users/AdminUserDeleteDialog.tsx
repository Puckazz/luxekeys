'use client';

import type { AdminUser } from '@/features/admin/types/admin-users.types';
import { AdminArchiveConfirmDialog } from '@/features/admin/components/common';

type AdminUserDeleteDialogProps = {
  user: AdminUser | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminUserDeleteDialog({
  user,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: AdminUserDeleteDialogProps) {
  return (
    <AdminArchiveConfirmDialog
      open={open}
      title="Archive User"
      description={
        user
          ? `This will archive ${user.name} and hide the account from default user lists.`
          : 'This action will archive the selected user.'
      }
      confirmLabel="Archive User"
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
