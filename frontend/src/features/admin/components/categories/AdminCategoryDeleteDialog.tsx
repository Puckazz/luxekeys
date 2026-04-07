'use client';

import type { AdminCategory } from '@/features/admin/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Archive Category</DialogTitle>
          <DialogDescription>
            {category
              ? `This will move ${category.name} to archived status and remove it from the default list.`
              : 'This action will archive the selected category.'}
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
            Archive Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
