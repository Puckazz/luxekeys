'use client';

import type { AdminProduct } from '@/features/admin/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Archive Product</DialogTitle>
          <DialogDescription>
            {product
              ? `This will move ${product.name} to archived status and remove it from the default list.`
              : 'This action will archive the selected product.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            Archive Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
