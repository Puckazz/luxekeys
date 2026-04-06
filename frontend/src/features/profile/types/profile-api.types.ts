import type { OrderStatus } from '@/features/profile/types';

export type ProfileUserDto = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  joined_at: string;
};

export type SavedAddressDto = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  district: string;
  is_default: boolean;
  created_at: string;
};

export type OrderLineItemDto = {
  id: string;
  name: string;
  image: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
};

export type OrderDetailDto = {
  order_id: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  item_count: number;
  payment_method_label: string;
  shipping_address: SavedAddressDto;
  items: OrderLineItemDto[];
};
