import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/index.js';

export interface OrderItemResponse {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotalAmount: number;
}

export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  ward: string | null;
  district: string | null;
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

export type OrderWithItems = Order & {
  items: OrderItem[];
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    ward: string | null;
    district: string | null;
    city: string;
    country: string;
  } | null;
};
