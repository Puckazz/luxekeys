import { SwitchesCatalogItem } from '@/features/shop/types/product-catalog.types';
import { createSwitchCatalogItem } from '@/features/shop/mocks/product-catalog.seed';

export const switchesProductsCatalogRaw: SwitchesCatalogItem[] = [
  createSwitchCatalogItem({
    id: 'gateron-oil-king-v2',
    slug: 'gateron-oil-king-v2',
    name: 'Oil King V2 Switch Set (90)',
    brand: 'Gateron',
    description:
      'Factory-lubed linear switch pack tuned for deep sound and smooth travel.',
    price: 54,
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    badge: 'new',
    tags: ['Linear', 'Factory Lubed'],
    rating: 4.8,
    popularity: 89,
    createdAt: '2026-02-27',
  }),
  createSwitchCatalogItem({
    id: 'kailh-box-jade',
    slug: 'kailh-box-jade',
    name: 'Box Jade Switch Set (90)',
    brand: 'Kailh',
    description:
      'Clicky switch pack with crisp tactility and signature click-bar response.',
    price: 38,
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    tags: ['Clicky', 'Box Switch'],
    rating: 4.4,
    popularity: 72,
    createdAt: '2025-12-29',
  }),
];
