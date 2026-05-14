'use client';

import { Eye, Pencil } from 'lucide-react';

import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminOrder } from '@/features/admin/types/admin-orders.types';
import {
  adminOrderStatusBadgeByValue,
  adminOrderStatusLabelByValue,
  formatOrderDateTime,
} from '@/features/admin/utils/admin-orders.utils';
import { formatCurrency } from '@/features/admin/utils/admin-products.utils';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminOrdersTableProps = {
  orders: AdminOrder[];
  selectedOrderIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleOrder: (orderId: string, checked: boolean) => void;
  onViewDetail: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
};

export function AdminOrdersTable({
  orders,
  selectedOrderIds,
  onToggleAll,
  onToggleOrder,
  onViewDetail,
  onEditOrder,
}: AdminOrdersTableProps) {
  const selectedCount = orders.filter((order) =>
    selectedOrderIds.has(order.id)
  ).length;
  const isAllSelected = orders.length > 0 && selectedCount === orders.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < orders.length;

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-11 pl-5">
            <Checkbox
              checked={
                isAllSelected ? true : isIndeterminate ? 'indeterminate' : false
              }
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              aria-label="Select all orders"
            />
          </TableHead>
          <TableHead>Order Code</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Items</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {orders.map((order) => {
          const isSelected = selectedOrderIds.has(order.id);

          return (
            <TableRow key={order.id}>
              <TableCell className="pl-5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggleOrder(order.id, checked === true)
                  }
                  aria-label={`Select order ${order.orderCode}`}
                />
              </TableCell>

              <TableCell className="font-medium">{order.orderCode}</TableCell>

              <TableCell>
                <div className="min-w-56">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {order.customer.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {order.customer.email}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {formatOrderDateTime(order.createdAt)}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {order.itemCount}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {formatCurrency(order.total)}
              </TableCell>

              <TableCell>
                <Badge
                  variant={adminOrderStatusBadgeByValue[order.status]}
                  className="text-[10px]"
                >
                  {adminOrderStatusLabelByValue[order.status]}
                </Badge>
              </TableCell>

              <TableCell className="pr-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <AdminTableIconActionButton
                    icon={Pencil}
                    label="Edit order"
                    onClick={() => onEditOrder(order.id)}
                  />
                  <AdminTableIconActionButton
                    icon={Eye}
                    label="View order detail"
                    onClick={() => onViewDetail(order.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
