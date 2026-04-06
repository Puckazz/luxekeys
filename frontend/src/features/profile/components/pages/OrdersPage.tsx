'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PackageSearch } from 'lucide-react';

import { useOrderDetailQuery, useOrdersQuery } from '@/features/profile/hooks';
import type { OrdersFilterValue } from '@/features/profile/types';
import {
  formatAccountDate,
  orderStatusBadgeVariantByStatus,
  orderStatusLabels,
} from '@/features/profile/utils/profile.utils';
import { formatCurrency } from '@/features/shop/utils/checkout.utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Dialog,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const orderStatusFilterOptions: Array<{
  label: string;
  value: OrdersFilterValue;
}> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrdersFilterValue>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const ordersQuery = useOrdersQuery(statusFilter);
  const orderDetailQuery = useOrderDetailQuery(selectedOrderId);

  const orders = ordersQuery.data ?? [];
  const selectedOrder = orderDetailQuery.data;

  return (
    <div className="space-y-5">
      <Card className="border-border/70 bg-card/35">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Order History</CardTitle>
            <CardDescription>
              Browse previous purchases and open full order details.
            </CardDescription>
          </div>

          <div className="w-full sm:w-52">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrdersFilterValue)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {orders.length === 0 ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="py-10 text-center">
            <PackageSearch className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground mt-3 font-semibold">
              No orders found
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Try another status filter or place your first order.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="text-foreground pl-5 font-semibold">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAccountDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={orderStatusBadgeVariantByStatus[order.status]}
                        className="text-[10px]"
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      {order.itemCount}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.orderId)}
                      >
                        View details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(selectedOrderId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] w-[95%] max-w-xl overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle>
              {selectedOrder
                ? `Order ${selectedOrder.orderId}`
                : 'Order Detail'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? `Placed on ${formatAccountDate(selectedOrder.createdAt)} via ${selectedOrder.paymentMethodLabel}.`
                : 'Loading order detail...'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            {selectedOrder ? (
              <>
                <div className="border-border/70 bg-background/20 rounded-lg border p-4 text-sm">
                  <p className="text-foreground font-semibold">
                    Shipping Address
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shippingAddress.streetAddress},{' '}
                    {selectedOrder.shippingAddress.district},{' '}
                    {selectedOrder.shippingAddress.city}
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-border/70 bg-card/35 flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="border-border/70 bg-card/70 relative size-14 shrink-0 overflow-hidden rounded-sm border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-foreground line-clamp-1 text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.variantLabel}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-foreground text-sm font-semibold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-border/70 border-t pt-3 text-right">
                  <p className="text-muted-foreground text-sm">Order Total</p>
                  <p className="text-foreground text-xl font-black">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Loading...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
