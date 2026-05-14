import type { CustomerReviewApiItem } from '@/features/shop/types/product-api.types';

export const mapApiReviewToReviewItem = (review: CustomerReviewApiItem) => ({
  id: review.id,
  author: review.user?.fullName ?? 'LuxeKeys Customer',
  rating: review.rating,
  comment: review.content ?? review.title ?? 'No written review.',
  createdAtLabel: new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  helpfulCount: review.helpfulCount ?? 0,
});
