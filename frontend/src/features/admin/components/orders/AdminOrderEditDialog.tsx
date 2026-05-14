'use client';

import { useEffect, useState } from 'react';

import { useAdminOrderDetailQuery } from '@/features/admin/hooks';
import type {
  AdminOrderPaymentStatus,
  UpdateAdminOrderInput,
} from '@/features/admin/types/admin-orders.types';
import {
  adminOrderPaymentStatusLabelByValue,
  adminOrderStatusLabelByValue,
} from '@/features/admin/utils/admin-orders.utils';
import type { OrderStatus } from '@/features/profile/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Spinner } from '@/shared/components/ui/spinner';

type AdminOrderEditDialogProps = {
  orderId: string | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: UpdateAdminOrderInput) => void;
};

const orderStatusOptions: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

const paymentStatusOptions: AdminOrderPaymentStatus[] = [
  'pending',
  'paid',
  'failed',
];

export function AdminOrderEditDialog({
  orderId,
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminOrderEditDialogProps) {
  const detailQuery = useAdminOrderDetailQuery(orderId, open);
  const order = detailQuery.data;
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] =
    useState<AdminOrderPaymentStatus>('pending');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setTrackingCode(order.trackingCode ?? '');
  }, [open, order]);

  const handleSubmit = () => {
    if (!orderId) {
      return;
    }

    onSubmit({
      orderId,
      status,
      paymentStatus,
      trackingCode: trackingCode.trim() ? trackingCode.trim() : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            {order ? `Update operational fields for ${order.orderCode}.` : 'Load order details before editing.'}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner />
          </div>
        ) : order ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold">Order Code</p>
              <Input value={order.orderCode} readOnly className="h-10" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold">Status</p>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OrderStatus)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {adminOrderStatusLabelByValue[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold">Payment Status</p>
              <Select
                value={paymentStatus}
                onValueChange={(value) =>
                  setPaymentStatus(value as AdminOrderPaymentStatus)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {adminOrderPaymentStatusLabelByValue[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold">Tracking Code</p>
              <Input
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                placeholder="VNPOST-123456789"
                className="h-10"
                maxLength={120}
              />
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
                disabled={isSubmitting || detailQuery.isFetching}
                onClick={handleSubmit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Unable to load order detail.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
