import type {
  AdminReviewSortOption,
  AdminReviewStatus,
  AdminReviewStatusFilter,
} from '@/features/admin/types/admin-reviews.types';
import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/shared/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const adminReviewStatusLabelByValue: Record<AdminReviewStatus, string> =
  {
    pending: 'Pending',
    published: 'Published',
    hidden: 'Hidden',
    rejected: 'Rejected',
  };

export const adminReviewStatusFilterLabelByValue: Record<
  AdminReviewStatusFilter,
  string
> = {
  all: 'All',
  pending: 'Pending',
  published: 'Published',
  hidden: 'Hidden',
  rejected: 'Rejected',
};

export const adminReviewStatusBadgeByValue: Record<
  AdminReviewStatus,
  BadgeVariant
> = {
  pending: 'warning',
  published: 'success',
  hidden: 'secondary',
  rejected: 'destructive',
};

export const adminReviewSortLabelByValue: Record<
  AdminReviewSortOption,
  string
> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'rating-desc': 'Rating (high-low)',
  'rating-asc': 'Rating (low-high)',
  'helpful-desc': 'Most helpful',
};

export const formatReviewDateTime = (isoString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(isoString));
};
