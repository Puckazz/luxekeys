import type { OrderStatus } from '@/features/profile/types';
import type { UserRole } from '@/lib/rbac';

export type ProfileUserDto = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
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
  productName: string;
  variantName: string;
  thumbnailUrl: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDetailDto = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  address: SavedAddressDto;
  items: OrderLineItemDto[];
};
