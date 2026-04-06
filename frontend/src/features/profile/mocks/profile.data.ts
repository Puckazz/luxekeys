import type {
  OrderDetailDto,
  ProfileUserDto,
  SavedAddressDto,
} from '@/features/profile/types/profile-api.types';

export const profileUserMock: ProfileUserDto = {
  id: 'user_001',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '0912 345 678',
  joined_at: '2024-03-20T08:00:00.000Z',
};

export const addressesMock: SavedAddressDto[] = [
  {
    id: 'addr_001',
    label: 'Home',
    full_name: 'John Doe',
    phone: '0912 345 678',
    street_address: '123 Nguyen Hue Street',
    city: 'Ho Chi Minh City',
    district: 'District 1',
    is_default: true,
    created_at: '2025-01-03T09:30:00.000Z',
  },
  {
    id: 'addr_002',
    label: 'Office',
    full_name: 'John Doe',
    phone: '0912 345 678',
    street_address: '77 Nguyen Thi Minh Khai',
    city: 'Ho Chi Minh City',
    district: 'District 3',
    is_default: false,
    created_at: '2025-06-15T10:30:00.000Z',
  },
];

export const orderDetailsMock: OrderDetailDto[] = [
  {
    order_id: 'LK-2048',
    created_at: '2026-03-10T10:15:00.000Z',
    status: 'delivered',
    total: 315,
    item_count: 2,
    payment_method_label: 'VNPay QR',
    shipping_address: addressesMock[0],
    items: [
      {
        id: 'line_001',
        name: 'Aether 75 Aluminum Keyboard',
        image: '/images/products/keyboards/keyboard-1.jpg',
        variant_label: 'Navy, Gateron Oil King',
        quantity: 1,
        unit_price: 259,
      },
      {
        id: 'line_002',
        name: 'PBT Cherry Keycap Set - Glacier',
        image: '/images/products/keycaps/keycap-1.jpg',
        variant_label: 'Cherry Profile, 129 Keys',
        quantity: 1,
        unit_price: 56,
      },
    ],
  },
  {
    order_id: 'LK-2049',
    created_at: '2026-04-03T08:30:00.000Z',
    status: 'confirmed',
    total: 124,
    item_count: 3,
    payment_method_label: 'Cash on Delivery',
    shipping_address: addressesMock[1],
    items: [
      {
        id: 'line_003',
        name: 'Linear Switch Pack',
        image: '/images/products/switches/switch-1.jpg',
        variant_label: '70 pcs, Lubed',
        quantity: 2,
        unit_price: 38,
      },
      {
        id: 'line_004',
        name: 'Switch Puller Pro',
        image: '/images/products/accessories/accessory-1.jpg',
        variant_label: 'Stainless Steel',
        quantity: 1,
        unit_price: 48,
      },
    ],
  },
];
