import type { UserRole } from '@/lib/rbac';

export type OrderStatusDto =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type ReviewStatusDto = 'PENDING' | 'PUBLISHED' | 'HIDDEN' | 'REJECTED';

export type ProfileUserDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  role: UserRole;
};

export type SavedAddressDto = {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  country?: string;
  province: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
};

export type OrderLineItemDto = {
  id: string;
  productId: string;
  switchOptionName: string | null;
  productName: string;
  variantName: string | null;
  thumbnailUrl: string | null;
  quantity: number;
  unitPrice: number;
  isReviewed: boolean;
  review: {
    id: string;
    rating: number;
    status: ReviewStatusDto;
    title: string | null;
    content: string | null;
  } | null;
};

export type OrderDetailDto = {
  id: string;
  orderCode: string;
  placedAt: string;
  status: OrderStatusDto;
  totalAmount: number;
  paymentMethod: string;
  address: SavedAddressDto | null;
  items: OrderLineItemDto[];
};
