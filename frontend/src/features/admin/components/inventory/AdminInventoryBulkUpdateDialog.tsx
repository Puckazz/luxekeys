'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  adminInventoryBulkUpdateSchema,
  type AdminInventoryBulkUpdateSchemaValues,
} from '@/features/admin/schemas/admin-inventory.schema';
import { LOW_STOCK_THRESHOLD } from '@/features/admin/utils/admin-products.constants';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';

type AdminInventoryBulkUpdateDialogProps = {
  open: boolean;
  selectedCount: number;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (stock: number) => void;
};

export function AdminInventoryBulkUpdateDialog({
  open,
  selectedCount,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminInventoryBulkUpdateDialogProps) {
  const form = useForm<AdminInventoryBulkUpdateSchemaValues>({
    resolver: zodResolver(adminInventoryBulkUpdateSchema),
    defaultValues: {
      stock: 0,
    },
  });

  const { register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset({ stock: 0 });
    }
  }, [open, reset]);

  const submitHandler = (values: AdminInventoryBulkUpdateSchemaValues) => {
    onSubmit(values.stock);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Bulk Update Stock</DialogTitle>
          <DialogDescription>
            Set a new stock quantity for {selectedCount} selected variants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Stock quantity</label>
            <Input
              {...register('stock', { valueAsNumber: true })}
              type="number"
              min={0}
              step={1}
              className="h-10"
            />
            <p className="text-muted-foreground text-xs">
              Low-stock warning triggers when quantity is 1-
              {LOW_STOCK_THRESHOLD}.
            </p>
            <p className="text-destructive text-xs">
              {formState.errors.stock?.message}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || selectedCount <= 0}
            >
              Apply Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
