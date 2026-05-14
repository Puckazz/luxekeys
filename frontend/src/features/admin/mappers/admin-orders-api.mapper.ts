import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderListApiResponse,
} from '@/features/admin/types';
import type {
  AdminOrderApiDetail,
  AdminOrderApiListItem,
  AdminOrderApiPaymentStatus,
  AdminOrderApiSortField,
  AdminOrderApiStatus,
  AdminOrderApiSummary,
  AdminOrderListQueryState,
} from '@/features/admin/types/admin-orders.types';

const ADMIN_ORDER_ITEM_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=400&q=80';

const apiStatusToOrderStatus: Record<
  AdminOrderApiStatus,
  AdminOrder['status']
> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const apiPaymentStatusToPaymentStatus: Record<
  AdminOrderApiPaymentStatus,
  AdminOrderDetail['paymentStatus']
> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

export const paymentStatusToApiPaymentStatus = (
  status: AdminOrderDetail['paymentStatus']
): AdminOrderApiPaymentStatus => {
  if (status === 'paid') {
    return 'PAID';
  }

  if (status === 'failed') {
    return 'FAILED';
  }

  return 'PENDING';
};

export const orderSortToApiParams = (
  sort: AdminOrderListQueryState['sort']
): { sortBy: AdminOrderApiSortField; sortOrder: 'asc' | 'desc' } => {
  if (sort === 'oldest') {
    return { sortBy: 'createdAt', sortOrder: 'asc' };
  }

  if (sort === 'amount-desc') {
    return { sortBy: 'totalAmount', sortOrder: 'desc' };
  }

  if (sort === 'amount-asc') {
    return { sortBy: 'totalAmount', sortOrder: 'asc' };
  }

  if (sort === 'customer-asc') {
    return { sortBy: 'customerName', sortOrder: 'asc' };
  }

  if (sort === 'status-asc') {
    return { sortBy: 'status', sortOrder: 'asc' };
  }

  return { sortBy: 'createdAt', sortOrder: 'desc' };
};

export const orderStatusFilterToApiStatus = (
  status: AdminOrderListQueryState['status']
): AdminOrderApiStatus | undefined => {
  if (status === 'all') {
    return undefined;
  }

  if (status === 'shipping') {
    return 'SHIPPING';
  }

  return status.toUpperCase() as Exclude<AdminOrderApiStatus, 'SHIPPING'>;
};

export const mapApiSummaryToAdminSummary = (
  summary: AdminOrderApiSummary
): AdminOrderListApiResponse['summary'] => {
  return {
    all: summary.all,
    pending: summary.PENDING,
    confirmed: summary.CONFIRMED,
    shipping: summary.SHIPPING,
    delivered: summary.DELIVERED,
    cancelled: summary.CANCELLED,
  };
};

export const mapApiOrderToAdminOrder = (
  order: AdminOrderApiListItem
): AdminOrder => {
  return {
    id: order.id,
    orderCode: order.orderCode,
    createdAt: order.createdAt,
    status: apiStatusToOrderStatus[order.status],
    total: Number(order.total),
    itemCount: order.itemCount,
    paymentMethodLabel: order.paymentMethodLabel,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
  };
};

export const mapApiOrderToAdminOrderDetail = (
  order: AdminOrderApiDetail
): AdminOrderDetail => {
  return {
    ...mapApiOrderToAdminOrder(order),
    paymentStatus: apiPaymentStatusToPaymentStatus[order.paymentStatus],
    trackingCode: order.trackingCode,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image || ADMIN_ORDER_ITEM_FALLBACK_IMAGE,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
};
