import type { AdminProductPaginationMeta } from '@/features/admin/types';
import type { OrderStatus } from '@/features/profile/types';

export const ADMIN_ORDER_SORT_OPTIONS = [
  'newest',
  'oldest',
  'amount-desc',
  'amount-asc',
  'customer-asc',
  'status-asc',
] as const;

export type AdminOrderSortOption = (typeof ADMIN_ORDER_SORT_OPTIONS)[number];

export const ADMIN_ORDER_STATUS_FILTER_OPTIONS = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type AdminOrderStatusFilter =
  | (typeof ADMIN_ORDER_STATUS_FILTER_OPTIONS)[number]
  | 'all';

export interface AdminOrderListQueryState {
  search: string;
  status: AdminOrderStatusFilter;
  sort: AdminOrderSortOption;
  page: number;
  pageSize: number;
}

export interface AdminOrderCustomer {
  name: string;
  email: string;
}

export interface AdminOrderShippingAddressSummary {
  line1: string;
  district: string;
  city: string;
}

export interface AdminOrderLineItem {
  id: string;
  name: string;
  image: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  paymentMethodLabel: string;
  customer: AdminOrderCustomer;
  shippingAddress: AdminOrderShippingAddressSummary;
}

export interface AdminOrderDetail extends AdminOrder {
  items: AdminOrderLineItem[];
}

export type AdminOrderPaginationMeta = AdminProductPaginationMeta;

export type AdminOrderStatusSummary = Record<OrderStatus | 'all', number>;

export interface AdminOrderListApiResponse {
  items: AdminOrder[];
  meta: AdminOrderPaginationMeta;
  summary: AdminOrderStatusSummary;
}

export interface UpdateAdminOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface BulkUpdateAdminOrderStatusInput {
  orderIds: string[];
  status: OrderStatus;
}

export interface BulkUpdateAdminOrderStatusResponse {
  updatedCount: number;
}
