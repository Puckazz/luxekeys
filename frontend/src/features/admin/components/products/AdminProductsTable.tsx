'use client';

import Image from 'next/image';
import { Edit2, RotateCcw, Trash2 } from 'lucide-react';

import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminProduct } from '@/features/admin/types';
import {
  adminProductStatusBadgeByValue,
  adminProductStatusLabelByValue,
  getComputedProductStatus,
  getProductPriceRangeLabel,
  getProductTotalStock,
} from '@/features/admin/utils/admin-products.utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminProductsTableProps = {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  onRestore: (product: AdminProduct) => void;
};

export function AdminProductsTable({
  products,
  onEdit,
  onDelete,
  onRestore,
}: AdminProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Variants</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product, index) => {
          const displayStatus = getComputedProductStatus(product);

          return (
            <TableRow key={`${product.id}-${index}`}>
              <TableCell className="pl-5">
                <div className="flex min-w-68 items-center gap-3">
                  <div className="bg-card border-border/70 relative size-12 shrink-0 overflow-hidden rounded-[14px] border">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {product.description}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground capitalize">
                {product.category}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {product.variants.length}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {getProductTotalStock(product.variants)}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {getProductPriceRangeLabel(product)}
              </TableCell>

              <TableCell>
                <Badge
                  variant={adminProductStatusBadgeByValue[displayStatus]}
                  className="text-[10px]"
                >
                  {adminProductStatusLabelByValue[displayStatus]}
                </Badge>
              </TableCell>

              <TableCell className="pr-5 text-right">
                <div className="flex justify-end gap-1">
                  <AdminTableIconActionButton
                    icon={Edit2}
                    label="Edit product"
                    onClick={() => onEdit(product)}
                  />

                  {product.status === 'archived' ? (
                    <AdminTableIconActionButton
                      icon={RotateCcw}
                      label="Restore product"
                      onClick={() => onRestore(product)}
                    />
                  ) : (
                    <AdminTableIconActionButton
                      icon={Trash2}
                      label="Archive product"
                      onClick={() => onDelete(product)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
