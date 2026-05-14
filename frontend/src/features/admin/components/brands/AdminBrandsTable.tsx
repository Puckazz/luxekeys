'use client';

import { Edit2, RotateCcw, Trash2 } from 'lucide-react';

import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminBrand } from '@/features/admin/types';
import {
  adminBrandStatusBadgeByValue,
  adminBrandStatusLabelByValue,
  formatBrandRelativeDate,
} from '@/features/admin/utils/admin-brands.utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminBrandsTableProps = {
  brands: AdminBrand[];
  onEdit: (brand: AdminBrand) => void;
  onDelete: (brand: AdminBrand) => void;
  onRestore: (brand: AdminBrand) => void;
};

export function AdminBrandsTable({
  brands,
  onEdit,
  onDelete,
  onRestore,
}: AdminBrandsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Brand</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {brands.map((brand) => (
          <TableRow key={brand.id}>
            <TableCell className="pl-5">
              <div className="flex items-center gap-3">
                {brand.logoUrl ? (
                  <div
                    aria-label={brand.name}
                    role="img"
                    className="border-border/70 size-10 rounded-md border bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${brand.logoUrl}")` }}
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md text-xs font-semibold">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="text-sm font-semibold">{brand.name}</p>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {brand.slug}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {brand.productCount}
            </TableCell>
            <TableCell>
              <Badge
                variant={adminBrandStatusBadgeByValue[brand.status]}
                className="text-[10px]"
              >
                {adminBrandStatusLabelByValue[brand.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatBrandRelativeDate(brand.updatedAt)}
            </TableCell>
            <TableCell className="pr-5 text-right">
              <div className="flex justify-end gap-1">
                <AdminTableIconActionButton
                  icon={Edit2}
                  label="Edit brand"
                  onClick={() => onEdit(brand)}
                />

                {brand.status === 'archived' ? (
                  <AdminTableIconActionButton
                    icon={RotateCcw}
                    label="Restore brand"
                    onClick={() => onRestore(brand)}
                  />
                ) : (
                  <AdminTableIconActionButton
                    icon={Trash2}
                    label="Archive brand"
                    onClick={() => onDelete(brand)}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
