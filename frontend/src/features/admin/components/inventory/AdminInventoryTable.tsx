'use client';

import Image from 'next/image';
import { Edit2 } from 'lucide-react';

import type {
  AdminInventoryItem,
  AdminInventoryStockStatus,
} from '@/features/admin/types/admin-inventory.types';
import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminProduct } from '@/features/admin/types';
import {
  adminInventoryStockStatusBadgeByValue,
  adminInventoryStockStatusLabelByValue,
} from '@/features/admin/utils/admin-products.utils';
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

type AdminInventoryTableProps = {
  items: AdminInventoryItem[];
  selectedVariantIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleVariant: (variantId: string, checked: boolean) => void;
  onEditProduct: (product: AdminProduct) => void;
};

export function AdminInventoryTable({
  items,
  selectedVariantIds,
  onToggleAll,
  onToggleVariant,
  onEditProduct,
}: AdminInventoryTableProps) {
  const selectedCount = items.filter((item) =>
    selectedVariantIds.has(item.variantId)
  ).length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < items.length;

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
              aria-label="Select all variants"
            />
          </TableHead>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead className="text-right">Variant Stock</TableHead>
          <TableHead className="text-right">Total Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => {
          const isSelected = selectedVariantIds.has(item.variantId);

          return (
            <TableRow key={item.variantId}>
              <TableCell className="pl-5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggleVariant(item.variantId, checked === true)
                  }
                  aria-label={`Select variant ${item.variantSku}`}
                />
              </TableCell>

              <TableCell>
                <div className="flex min-w-68 items-center gap-3">
                  <div className="bg-card border-border/70 relative size-12 shrink-0 overflow-hidden rounded-[14px] border">
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {item.product.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs capitalize">
                      {item.product.category}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="font-medium">{item.variantSku}</TableCell>

              <TableCell className="text-muted-foreground">
                {item.variantColor} / {item.variantSwitchType}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {item.variantStock}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {item.totalStock}
              </TableCell>

              <TableCell>
                <StockStatusBadge status={item.stockStatus} />
              </TableCell>

              <TableCell className="pr-5 text-right">
                <AdminTableIconActionButton
                  icon={Edit2}
                  label="Edit product stock"
                  onClick={() => onEditProduct(item.product)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

type StockStatusBadgeProps = {
  status: AdminInventoryStockStatus;
};

function StockStatusBadge({ status }: StockStatusBadgeProps) {
  return (
    <Badge
      variant={adminInventoryStockStatusBadgeByValue[status]}
      className="text-[10px]"
    >
      {adminInventoryStockStatusLabelByValue[status]}
    </Badge>
  );
}
