'use client';

import { useEffect, useState } from 'react';

import type { OrderStatus } from '@/features/profile/types';
import { adminOrderStatusLabelByValue } from '@/features/admin/utils/admin-orders.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminOrdersBulkStatusDialogProps = {
  open: boolean;
  selectedCount: number;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: OrderStatus) => void;
};

const statusOptions: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

export function AdminOrdersBulkStatusDialog({
  open,
  selectedCount,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminOrdersBulkStatusDialogProps) {
  const [status, setStatus] = useState<OrderStatus>('confirmed');

  useEffect(() => {
    if (open) {
      setStatus('confirmed');
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit(status);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Bulk Update Order Status</DialogTitle>
          <DialogDescription>
            Apply one status to {selectedCount} selected orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold">New status</p>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as OrderStatus)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {adminOrderStatusLabelByValue[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || selectedCount <= 0}
              onClick={handleSubmit}
            >
              Apply Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
