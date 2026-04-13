'use client';

import Image from 'next/image';
import { Eye, ShieldCheck } from 'lucide-react';

import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminReview } from '@/features/admin/types/admin-reviews.types';
import {
  adminReviewStatusBadgeByValue,
  adminReviewStatusLabelByValue,
  formatReviewDateTime,
} from '@/features/admin/utils/admin-reviews.utils';
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

type AdminReviewsTableProps = {
  reviews: AdminReview[];
  selectedReviewIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleReview: (reviewId: string, checked: boolean) => void;
  onViewDetail: (reviewId: string) => void;
  onModerate: (review: AdminReview) => void;
};

export function AdminReviewsTable({
  reviews,
  selectedReviewIds,
  onToggleAll,
  onToggleReview,
  onViewDetail,
  onModerate,
}: AdminReviewsTableProps) {
  const selectedCount = reviews.filter((review) =>
    selectedReviewIds.has(review.id)
  ).length;
  const isAllSelected = reviews.length > 0 && selectedCount === reviews.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < reviews.length;

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-11 pl-5">
            <Checkbox
              checked={
                isAllSelected ? true : isIndeterminate ? 'indeterminate' : false
              }
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              aria-label="Select all reviews"
            />
          </TableHead>
          <TableHead className="w-[20%]">Product</TableHead>
          <TableHead className="w-[18%]">Reviewer</TableHead>
          <TableHead className="w-[26%]">Review</TableHead>
          <TableHead className="w-[12%]">Date</TableHead>
          <TableHead className="w-[8%] text-right">Helpful</TableHead>
          <TableHead className="w-[10%]">Status</TableHead>
          <TableHead className="w-24 pr-5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {reviews.map((review) => {
          const isSelected = selectedReviewIds.has(review.id);

          return (
            <TableRow key={review.id}>
              <TableCell className="pl-5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggleReview(review.id, checked === true)
                  }
                  aria-label={`Select review ${review.id}`}
                />
              </TableCell>

              <TableCell>
                <div className="flex max-w-44 items-center gap-2">
                  <div className="bg-card border-border/70 relative size-10 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={review.productImage}
                      alt={review.productName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <p className="truncate text-sm font-semibold">
                    {review.productName}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="max-w-36">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {review.reviewerName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {review.reviewerEmail}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="max-w-56">
                  <p className="truncate text-sm font-semibold">
                    {review.title}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {review.content}
                  </p>
                  <p className="text-xs font-semibold text-amber-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {formatReviewDateTime(review.createdAt)}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {review.helpfulCount}
              </TableCell>

              <TableCell>
                <Badge
                  variant={adminReviewStatusBadgeByValue[review.status]}
                  className="text-[10px]"
                >
                  {adminReviewStatusLabelByValue[review.status]}
                </Badge>
              </TableCell>

              <TableCell className="pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  <AdminTableIconActionButton
                    icon={Eye}
                    label="View review detail"
                    onClick={() => onViewDetail(review.id)}
                  />
                  <AdminTableIconActionButton
                    icon={ShieldCheck}
                    label="Moderate review"
                    onClick={() => onModerate(review)}
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
