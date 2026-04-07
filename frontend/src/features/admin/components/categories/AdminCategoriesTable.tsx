'use client';

import { Edit2, RotateCcw, Trash2 } from 'lucide-react';

import type { AdminCategory } from '@/features/admin/types';
import {
  adminCategoryStatusBadgeByValue,
  adminCategoryStatusLabelByValue,
  formatRelativeDate,
} from '@/features/admin/utils/admin-categories.utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminCategoriesTableProps = {
  categories: AdminCategory[];
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onRestore: (category: AdminCategory) => void;
};

export function AdminCategoriesTable({
  categories,
  onEdit,
  onDelete,
  onRestore,
}: AdminCategoriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="pl-5">
              <p className="text-sm font-semibold">{category.name}</p>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {category.slug}
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[280px] truncate text-sm">
              {category.description}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {category.productCount}
            </TableCell>
            <TableCell>
              <Badge
                variant={adminCategoryStatusBadgeByValue[category.status]}
                className="text-[10px]"
              >
                {adminCategoryStatusLabelByValue[category.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatRelativeDate(category.updatedAt)}
            </TableCell>
            <TableCell className="pr-5 text-right">
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onEdit(category)}
                >
                  <Edit2 className="size-3.5" />
                  <span className="sr-only">Edit category</span>
                </Button>

                {category.status === 'archived' ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => onRestore(category)}
                  >
                    <RotateCcw className="size-3.5" />
                    <span className="sr-only">Restore category</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Archive category</span>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
