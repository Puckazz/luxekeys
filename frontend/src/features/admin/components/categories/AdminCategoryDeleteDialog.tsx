'use client';

import type { AdminCategory } from '@/features/admin/types';
import { AdminArchiveConfirmDialog } from '@/features/admin/components/common';

type AdminCategoryDeleteDialogProps = {
  category: AdminCategory | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminCategoryDeleteDialog({
  category,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: AdminCategoryDeleteDialogProps) {
  return (
    <AdminArchiveConfirmDialog
      open={open}
      title="Archive Category"
      description={
        category
          ? `This will move ${category.name} to archived status and remove it from the default list.`
          : 'This action will archive the selected category.'
      }
      confirmLabel="Archive Category"
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
