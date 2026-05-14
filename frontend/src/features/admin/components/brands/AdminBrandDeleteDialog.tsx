'use client';

import type { AdminBrand } from '@/features/admin/types';
import { AdminArchiveConfirmDialog } from '@/features/admin/components/common';

type AdminBrandDeleteDialogProps = {
  brand: AdminBrand | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminBrandDeleteDialog({
  brand,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: AdminBrandDeleteDialogProps) {
  return (
    <AdminArchiveConfirmDialog
      open={open}
      title="Archive Brand"
      description={
        brand
          ? `This will move ${brand.name} to archived status and hide it from the default brand list.`
          : 'This action will archive the selected brand.'
      }
      confirmLabel="Archive Brand"
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
