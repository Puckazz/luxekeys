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

export const ORDER_WITH_ITEMS_INCLUDE = {
  items: {
    include: {
      review: true,
      switchOption: true,
    },
  },
  address: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ORDER_WITH_ITEMS_INCLUDE;
}>;
