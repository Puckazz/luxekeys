'use client';

import type { AdminProduct } from '@/features/admin/types';
import { AdminArchiveConfirmDialog } from '@/features/admin/components/common';

type AdminProductDeleteDialogProps = {
  product: AdminProduct | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminProductDeleteDialog({
  product,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: AdminProductDeleteDialogProps) {
  return (
    <AdminArchiveConfirmDialog
      open={open}
      title="Archive Product"
      description={
        product
          ? `This will move ${product.name} to archived status and remove it from the default list.`
          : 'This action will archive the selected product.'
      }
      confirmLabel="Archive Product"
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
