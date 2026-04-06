import type { OrderStatus } from '@/features/profile/types';

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
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const orderStatusBadgeVariantByStatus: Record<
  OrderStatus,
  'secondary' | 'warning' | 'success' | 'destructive' | 'default'
> = {
  pending: 'warning',
  confirmed: 'secondary',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};
