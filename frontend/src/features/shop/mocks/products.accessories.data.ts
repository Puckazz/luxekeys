import { AccessoriesCatalogItem } from '@/features/shop/types/product-catalog.types';
import { createAccessoryCatalogItem } from '@/features/shop/mocks/product-catalog.seed';

export const accessoriesProductsCatalogRaw: AccessoriesCatalogItem[] = [
  createAccessoryCatalogItem({
    id: 'cablemod-pro-coil-usb-c',
    slug: 'cablemod-pro-coil-usb-c',
    name: 'Pro Coiled USB-C Cable',
    brand: 'CableMod',
    description:
      'Double-sleeved custom coiled cable with aviator connector for clean desk aesthetics.',
    price: 49,
    image:
      'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1200&q=80',
    badge: 'in-stock',
    tags: ['Coiled', 'USB-C', 'Aviator'],
    rating: 4.6,
    popularity: 83,
    createdAt: '2026-03-15',
  }),
  createAccessoryCatalogItem({
    id: 'kbdfans-resin-wrist-rest',
    slug: 'kbdfans-resin-wrist-rest',
    name: 'Resin Wrist Rest 75%',
    brand: 'KBDfans',
    description:
      'Hand-polished resin wrist rest designed for long typing sessions with 75% boards.',
    price: 65,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    tags: ['Wrist Rest', 'Resin'],
    rating: 4.5,
    popularity: 68,
    createdAt: '2026-01-31',
  }),
];
