import type { OrderStatus, ReviewStatus } from '@/features/profile/types';

export const formatAccountDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const orderStatusBadgeVariantByStatus: Record<
  OrderStatus,
  'secondary' | 'warning' | 'success' | 'destructive' | 'default'
> = {
  pending: 'warning',
  confirmed: 'secondary',
  shipping: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending: 'Pending review',
  published: 'Published',
  hidden: 'Hidden',
  rejected: 'Rejected',
};

export const reviewStatusBadgeVariantByStatus: Record<
  ReviewStatus,
  'secondary' | 'warning' | 'success' | 'destructive' | 'default'
> = {
  pending: 'warning',
  published: 'success',
  hidden: 'secondary',
  rejected: 'destructive',
};
