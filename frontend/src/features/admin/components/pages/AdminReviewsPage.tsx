'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';

import {
  useAdminReviewsQuery,
  useAdminReviewsQueryState,
  useBulkUpdateAdminReviewStatusMutation,
  useUpdateAdminReviewStatusMutation,
} from '@/features/admin/hooks';
import {
  AdminListPagination,
  AdminListStateCard,
} from '@/features/admin/components/common';
import {
  AdminReviewDetailDialog,
  AdminReviewModerationDialog,
  AdminReviewsTable,
  AdminReviewsTableSkeleton,
  AdminReviewsToolbar,
} from '@/features/admin/components/reviews';
import type {
  AdminReview,
  AdminReviewStatus,
} from '@/features/admin/types/admin-reviews.types';

export function AdminReviewsPage() {
  const { queryState, setSearch, setStatus, setSort, setPage } =
    useAdminReviewsQueryState();

  const reviewsQuery = useAdminReviewsQuery(queryState);
  const updateMutation = useUpdateAdminReviewStatusMutation();
  const bulkUpdateMutation = useBulkUpdateAdminReviewStatusMutation();

  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(
    new Set()
  );
  const [viewingReviewId, setViewingReviewId] = useState<string | null>(null);
  const [moderatingReview, setModeratingReview] = useState<AdminReview | null>(
    null
  );
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const reviews = useMemo<AdminReview[]>(() => {
    return reviewsQuery.data?.items ?? [];
  }, [reviewsQuery.data?.items]);

  const summary = reviewsQuery.data?.summary;
  const meta = reviewsQuery.data?.meta;

  const selectedReviews = useMemo<AdminReview[]>(() => {
    return reviews.filter((review) => selectedReviewIds.has(review.id));
  }, [reviews, selectedReviewIds]);

  useEffect(() => {
    setSelectedReviewIds((previous) => {
      const allowedIds = new Set(reviews.map((review) => review.id));
      const next = new Set<string>();

      previous.forEach((reviewId) => {
        if (allowedIds.has(reviewId)) {
          next.add(reviewId);
        }
      });

      return next;
    });
  }, [reviews]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviewIds(new Set(reviews.map((review) => review.id)));
      return;
    }

    setSelectedReviewIds(new Set());
  };

  const handleToggleReview = (reviewId: string, checked: boolean) => {
    setSelectedReviewIds((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(reviewId);
      } else {
        next.delete(reviewId);
      }

      return next;
    });
  };

  const handleSubmitSingleModeration = (input: {
    status: AdminReviewStatus;
    moderationNote?: string;
  }) => {
    if (!moderatingReview) {
      return;
    }

    updateMutation.mutate(
      {
        reviewId: moderatingReview.id,
        status: input.status,
        moderationNote: input.moderationNote,
      },
      {
        onSuccess: () => {
          setModeratingReview(null);
        },
      }
    );
  };

  const handleSubmitBulkModeration = (input: {
    status: AdminReviewStatus;
    moderationNote?: string;
  }) => {
    if (selectedReviews.length <= 0) {
      return;
    }

    bulkUpdateMutation.mutate(
      {
        reviewIds: selectedReviews.map((review) => review.id),
        status: input.status,
        moderationNote: input.moderationNote,
      },
      {
        onSuccess: () => {
          setSelectedReviewIds(new Set());
          setIsBulkDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <AdminReviewsToolbar
        queryState={queryState}
        summary={summary}
        selectedCount={selectedReviews.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onBulkModerateClick={() => {
          if (selectedReviews.length <= 0) {
            return;
          }

          setIsBulkDialogOpen(true);
        }}
      />

      <AdminListStateCard
        isLoading={reviewsQuery.isLoading}
        loadingSkeleton={<AdminReviewsTableSkeleton />}
        isEmpty={reviews.length === 0}
        emptyIcon={MessageSquare}
        emptyTitle="No reviews found"
        emptyDescription="Try another search term or adjust your status filter."
        emptyActionLabel="Reset Search"
        onEmptyActionClick={() => setSearch('')}
      >
        <AdminReviewsTable
          reviews={reviews}
          selectedReviewIds={selectedReviewIds}
          onToggleAll={handleToggleAll}
          onToggleReview={handleToggleReview}
          onViewDetail={setViewingReviewId}
          onModerate={setModeratingReview}
        />
      </AdminListStateCard>

      {meta ? (
        <AdminListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      <AdminReviewModerationDialog
        open={Boolean(moderatingReview)}
        selectedCount={moderatingReview ? 1 : 0}
        defaultStatus={moderatingReview?.status ?? 'published'}
        title="Moderate Review"
        description="Change this review status to publish, keep pending, hide, or reject."
        isSubmitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setModeratingReview(null);
          }
        }}
        onSubmit={handleSubmitSingleModeration}
      />

      <AdminReviewModerationDialog
        open={isBulkDialogOpen}
        selectedCount={selectedReviews.length}
        isSubmitting={bulkUpdateMutation.isPending}
        title="Bulk Moderate Reviews"
        description={`Apply one status to ${selectedReviews.length} selected reviews.`}
        onOpenChange={setIsBulkDialogOpen}
        onSubmit={handleSubmitBulkModeration}
      />

      <AdminReviewDetailDialog
        reviewId={viewingReviewId}
        open={Boolean(viewingReviewId)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingReviewId(null);
          }
        }}
      />
    </div>
  );
}
