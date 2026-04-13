'use client';

import Image from 'next/image';

import { useAdminReviewDetailQuery } from '@/features/admin/hooks';
import {
  adminReviewStatusBadgeByValue,
  adminReviewStatusLabelByValue,
  formatReviewDateTime,
} from '@/features/admin/utils/admin-reviews.utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';

type AdminReviewDetailDialogProps = {
  reviewId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminReviewDetailDialog({
  reviewId,
  open,
  onOpenChange,
}: AdminReviewDetailDialogProps) {
  const detailQuery = useAdminReviewDetailQuery(reviewId, open);
  const review = detailQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Detail</DialogTitle>
          <DialogDescription>
            Inspect reviewer information, content, and moderation status.
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner />
          </div>
        ) : review ? (
          <div className="space-y-4">
            <section className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
              <InfoRow label="Reviewer" value={review.reviewerName} />
              <InfoRow label="Email" value={review.reviewerEmail} />
              <InfoRow
                label="Date"
                value={formatReviewDateTime(review.createdAt)}
              />
              <InfoRow label="Helpful votes" value={`${review.helpfulCount}`} />
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Status
                </p>
                <div className="mt-1">
                  <Badge
                    variant={adminReviewStatusBadgeByValue[review.status]}
                    className="text-[10px]"
                  >
                    {adminReviewStatusLabelByValue[review.status]}
                  </Badge>
                </div>
              </div>
              <InfoRow
                label="Rating"
                value={`${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Product</h3>
              <div className="bg-card/40 border-border/70 flex items-center gap-3 rounded-md border p-3">
                <div className="bg-card border-border/70 relative size-14 shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={review.productImage}
                    alt={review.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {review.productName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ID: {review.productId}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Review Content</h3>
              <div className="bg-card/40 border-border/70 space-y-2 rounded-md border p-3">
                <p className="text-sm font-semibold">{review.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {review.content}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Unable to load review detail.
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
