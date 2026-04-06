export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ProfileUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  joinedAt: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
  isDefault: boolean;
  createdAt: string;
};

export type OrderLineItem = {
  id: string;
  name: string;
  image: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
};

export type OrderSummary = {
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
};

export type OrderDetail = OrderSummary & {
  paymentMethodLabel: string;
  shippingAddress: SavedAddress;
  items: OrderLineItem[];
};

export type {
  AddressFormValues,
  AddressUpsertPayload,
} from './profile-addresses.types';
export type {
  OrdersFilterValue,
  OrdersQueryState,
} from './profile-orders.types';
export type {
  PersonalInfoFormValues,
  ProfileUpdatePayload,
} from './profile-personal-info.types';
export type { AccountNavItem } from './profile-navigation.types';
