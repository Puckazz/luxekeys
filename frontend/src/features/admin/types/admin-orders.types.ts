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
  orderCode: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  paymentMethodLabel: string;
  customer: AdminOrderCustomer;
  shippingAddress: AdminOrderShippingAddressSummary;
}

export interface AdminOrderDetail extends AdminOrder {
  paymentStatus: AdminOrderPaymentStatus;
  trackingCode: string | null;
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

export type AdminOrderPaymentStatus = 'pending' | 'paid' | 'failed';

export interface UpdateAdminOrderInput {
  orderId: string;
  status?: OrderStatus;
  paymentStatus?: AdminOrderPaymentStatus;
  trackingCode?: string | null;
}

export interface BulkUpdateAdminOrderStatusInput {
  orderIds: string[];
  status: OrderStatus;
}

export interface BulkUpdateAdminOrderStatusResponse {
  updatedCount: number;
}

export type AdminOrderApiStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type AdminOrderApiPaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type AdminOrderApiSortField =
  | 'createdAt'
  | 'totalAmount'
  | 'customerName'
  | 'status';

export type AdminOrderApiSummary = Record<'all' | AdminOrderApiStatus, number>;

export interface AdminOrderApiCustomer {
  name: string;
  email: string;
}

export interface AdminOrderApiShippingAddressSummary {
  line1: string;
  district: string;
  city: string;
}

export interface AdminOrderApiListItem {
  id: string;
  orderCode: string;
  createdAt: string;
  status: AdminOrderApiStatus;
  total: number;
  itemCount: number;
  paymentMethodLabel: string;
  customer: AdminOrderApiCustomer;
  shippingAddress: AdminOrderApiShippingAddressSummary;
}

export interface AdminOrderApiDetailItem {
  id: string;
  name: string;
  image: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrderApiDetail extends AdminOrderApiListItem {
  paymentStatus: AdminOrderApiPaymentStatus;
  trackingCode: string | null;
  items: AdminOrderApiDetailItem[];
}

export interface AdminOrderListApiData {
  items: AdminOrderApiListItem[];
  summary: AdminOrderApiSummary;
}

export type AdminPaginationApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
