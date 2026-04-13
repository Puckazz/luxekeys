import type { AdminOrderDetail } from '@/features/admin/types/admin-orders.types';
import type { OrderStatus } from '@/features/profile/types';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

const CUSTOMER_NAMES = [
  'Marvin McKinney',
  'Courtney Henry',
  'Floyd Miles',
  'Devon Lane',
  'Arlene McCoy',
  'Dianne Russell',
  'Albert Flores',
  'Ralph Edwards',
  'Savannah Nguyen',
  'Esther Howard',
  'Brooklyn Simmons',
  'Leslie Alexander',
];

const PAYMENT_METHODS = ['Credit Card', 'Master Card', 'Visa', 'VNPay QR'];

const ORDER_ITEM_CATALOG = [
  {
    name: 'Aether 75 Aluminum Keyboard',
    image: '/images/products/keyboards/keyboard-1.jpg',
    variantLabel: 'Navy, Gateron Oil King',
    unitPrice: 259,
  },
  {
    name: 'PBT Cherry Keycap Set - Glacier',
    image: '/images/products/keycaps/keycap-1.jpg',
    variantLabel: 'Cherry Profile, 129 Keys',
    unitPrice: 56,
  },
  {
    name: 'Linear Switch Pack',
    image: '/images/products/switches/switch-1.jpg',
    variantLabel: '70 pcs, Lubed',
    unitPrice: 38,
  },
  {
    name: 'Switch Puller Pro',
    image: '/images/products/accessories/accessory-1.jpg',
    variantLabel: 'Stainless Steel',
    unitPrice: 48,
  },
  {
    name: 'Artisan Keycap - Monolith',
    image: '/images/products/keycaps/keycap-2.jpg',
    variantLabel: 'SA Profile, Resin',
    unitPrice: 35,
  },
];

export const createSeedOrders = (): AdminOrderDetail[] => {
  const now = new Date();

  return Array.from({ length: 26 }, (_, index) => {
    const orderNumber = 2048 + index;
    const orderId = `LK-${orderNumber}`;
    const customerName = CUSTOMER_NAMES[index % CUSTOMER_NAMES.length];
    const paymentMethodLabel = PAYMENT_METHODS[index % PAYMENT_METHODS.length];
    const status = ORDER_STATUSES[index % ORDER_STATUSES.length];
    const quantityA = (index % 3) + 1;
    const quantityB = (index % 2) + 1;

    const firstItem = ORDER_ITEM_CATALOG[index % ORDER_ITEM_CATALOG.length];
    const secondItem =
      ORDER_ITEM_CATALOG[(index + 2) % ORDER_ITEM_CATALOG.length];

    const items = [
      {
        id: `${orderId}-line-1`,
        name: firstItem.name,
        image: firstItem.image,
        variantLabel: firstItem.variantLabel,
        quantity: quantityA,
        unitPrice: firstItem.unitPrice,
      },
      {
        id: `${orderId}-line-2`,
        name: secondItem.name,
        image: secondItem.image,
        variantLabel: secondItem.variantLabel,
        quantity: quantityB,
        unitPrice: secondItem.unitPrice,
      },
    ];

    const total = items.reduce((accumulator, item) => {
      return accumulator + item.quantity * item.unitPrice;
    }, 0);

    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - index * 2);

    return {
      id: orderId,
      createdAt: createdAt.toISOString(),
      status,
      total,
      itemCount: items.reduce((accumulator, item) => {
        return accumulator + item.quantity;
      }, 0),
      paymentMethodLabel,
      customer: {
        name: customerName,
        email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@luxekeys.dev`,
      },
      shippingAddress: {
        line1: `${10 + index} Nguyen Hue Street`,
        district: `District ${(index % 7) + 1}`,
        city: 'Ho Chi Minh City',
      },
      items,
    };
  });
};
