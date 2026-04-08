import type {
  AdminOrderSortOption,
  AdminOrderStatusFilter,
} from '@/features/admin/types/admin-orders.types';
import type { OrderStatus } from '@/features/profile/types';
import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/shared/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const adminOrderStatusLabelByValue: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const adminOrderStatusBadgeByValue: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'tag',
  delivered: 'success',
  cancelled: 'destructive',
};

export const adminOrderSortLabelByValue: Record<AdminOrderSortOption, string> =
  {
    newest: 'Newest',
    oldest: 'Oldest',
    'amount-desc': 'Amount (high-low)',
    'amount-asc': 'Amount (low-high)',
    'customer-asc': 'Customer (A-Z)',
    'status-asc': 'Status (A-Z)',
  };

export const adminOrderFilterLabelByValue: Record<
  AdminOrderStatusFilter,
  string
> = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const formatOrderDateTime = (isoString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(isoString));
};
