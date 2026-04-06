import { KeycapsCatalogItem } from '@/features/shop/types/product-catalog.types';
import { createKeycapCatalogItem } from '@/features/shop/mocks/product-catalog.seed';

export const keycapsProductsCatalogRaw: KeycapsCatalogItem[] = [
  createKeycapCatalogItem({
    id: 'gmk-olivia-r3',
    slug: 'gmk-olivia-r3',
    name: 'GMK Olivia R3 Base Kit',
    brand: 'GMK',
    description:
      'Premium doubleshot ABS keycap set with iconic Olivia light colorway.',
    price: 159,
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    badge: 'limited',
    tags: ['ABS', 'Doubleshot'],
    keycapProfile: 'Cherry',
    rating: 4.9,
    popularity: 91,
    createdAt: '2026-03-08',
  }),
  createKeycapCatalogItem({
    id: 'akko-macaw-sa',
    slug: 'akko-macaw-sa',
    name: 'Macaw SA Keycap Set',
    brand: 'Akko',
    description:
      'Tall sculpted SA profile set with bright tropical accents and dye-sub legends.',
    price: 79,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80',
    tags: ['Dye-sub', 'SA'],
    keycapProfile: 'SA',
    rating: 4.5,
    popularity: 66,
    createdAt: '2025-11-14',
  }),
  createKeycapCatalogItem({
    id: 'epbt-bow-r2',
    slug: 'epbt-bow-r2',
    name: 'ePBT BoW R2',
    brand: 'ePBT',
    description:
      'Classic black-on-white PBT set with long-lasting dye-sub legends.',
    price: 99,
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['PBT', 'Dye-sub'],
    keycapProfile: 'OEM',
    rating: 4.7,
    popularity: 75,
    createdAt: '2026-01-18',
  }),
];
