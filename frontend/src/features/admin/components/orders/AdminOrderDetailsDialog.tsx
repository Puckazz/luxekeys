'use client';

import Image from 'next/image';

import { useAdminOrderDetailQuery } from '@/features/admin/hooks';
import {
  adminOrderStatusBadgeByValue,
  adminOrderStatusLabelByValue,
  formatOrderDateTime,
} from '@/features/admin/utils/admin-orders.utils';
import { formatCurrency } from '@/features/admin/utils/admin-products.utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';

type AdminOrderDetailsDialogProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminOrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: AdminOrderDetailsDialogProps) {
  const detailQuery = useAdminOrderDetailQuery(orderId, open);
  const order = detailQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Detail</DialogTitle>
          <DialogDescription>
            Review items, shipping, payment, and order status.
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner />
          </div>
        ) : order ? (
          <div className="space-y-4">
            <section className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
              <InfoRow label="Order ID" value={order.id} />
              <InfoRow
                label="Date"
                value={formatOrderDateTime(order.createdAt)}
              />
              <InfoRow label="Customer" value={order.customer.name} />
              <InfoRow label="Email" value={order.customer.email} />
              <InfoRow label="Payment" value={order.paymentMethodLabel} />
              <InfoRow
                label="Amount"
                value={`${formatCurrency(order.total)} (${order.itemCount} items)`}
              />
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Status
                </p>
                <div className="mt-1">
                  <Badge
                    variant={adminOrderStatusBadgeByValue[order.status]}
                    className="text-[10px]"
                  >
                    {adminOrderStatusLabelByValue[order.status]}
                  </Badge>
                </div>
              </div>
              <InfoRow
                label="Shipping"
                value={`${order.shippingAddress.line1}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card/40 border-border/70 flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="bg-card border-border/70 relative size-14 shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.variantLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">x{item.quantity}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
