import {
  Prisma,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/index.js';

export interface OrderItemResponse {
  id: string;
  productId: string;
  variantId: string | null;
  switchOptionId: string | null;
  switchOptionName: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotalAmount: number;
  isReviewed: boolean;
  review: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
  } | null;
}

export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  streetAddress: string;
  province: string;
  city: string;
  country: string;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  note: string | null;
  trackingCode: string | null;
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  address: OrderAddressSnapshot | null;
  items: OrderItemResponse[];
}

export interface AdminOrderCustomerResponse {
  name: string;
  email: string;
}

export interface AdminOrderShippingAddressSummaryResponse {
  line1: string;
  district: string;
  city: string;
}

export interface AdminOrderListItemResponse {
  id: string;
  orderCode: string;
  createdAt: Date;
  status: OrderStatus;
  total: number;
  itemCount: number;
  paymentMethodLabel: string;
  customer: AdminOrderCustomerResponse;
  shippingAddress: AdminOrderShippingAddressSummaryResponse;
}

export interface AdminOrderDetailItemResponse {
  id: string;
  name: string;
  image: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrderDetailResponse extends AdminOrderListItemResponse {
  paymentStatus: PaymentStatus;
  trackingCode: string | null;
  items: AdminOrderDetailItemResponse[];
}

export interface AdminOrderSummaryResponse {
  all: number;
  PENDING: number;
  CONFIRMED: number;
  SHIPPING: number;
  DELIVERED: number;
  CANCELLED: number;
}

export interface BulkUpdateOrderStatusResponse {
  updatedCount: number;
}

export const ORDER_WITH_ITEMS_INCLUDE = {
  items: {
    include: {
      review: true,
      switchOption: true,
    },
  },
  address: true,
  user: {
    select: {
      fullName: true,
      email: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ORDER_WITH_ITEMS_INCLUDE;
}>;
