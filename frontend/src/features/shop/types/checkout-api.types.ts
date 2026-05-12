export type OrderPaymentMethod = 'COD' | 'PAYPAL';
export type OrderPaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItemDto = {
  id: string;
  productId: string;
  variantId: string | null;
  switchOptionId?: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotalAmount: number;
};

export type OrderAddressSnapshotDto = {
  fullName: string;
  phone: string;
  streetAddress: string;
  province: string;
  city: string;
  country: string;
};

export type OrderResponseDto = {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  note: string | null;
  trackingCode: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  address: OrderAddressSnapshotDto | null;
  items: OrderItemDto[];
};
