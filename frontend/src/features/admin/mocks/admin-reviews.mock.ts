import type { AdminReviewDetail } from '@/features/admin/types/admin-reviews.types';

const REVIEWER_NAMES = [
  'Amanda Harvey',
  'Anne Richard',
  'David Harrison',
  'Bob Dean',
  'Casey Romero',
  'Leslie Powell',
  'Jordan Bell',
  'Taylor Reed',
  'Morgan Boyd',
];

const PRODUCT_CATALOG = [
  {
    id: 'prod-aether-75',
    name: 'Aether 75 Aluminum Keyboard',
    image: '/images/products/keyboards/keyboard-1.jpg',
  },
  {
    id: 'prod-celeste-keycaps',
    name: 'Celeste PBT Keycap Set',
    image: '/images/products/keycaps/keycap-1.jpg',
  },
  {
    id: 'prod-orbit-linear-switch',
    name: 'Orbit Linear Switch Pack',
    image: '/images/products/switches/switch-1.jpg',
  },
  {
    id: 'prod-vela-artisan',
    name: 'Vela Artisan Keycap',
    image: '/images/products/keycaps/keycap-2.jpg',
  },
  {
    id: 'prod-keebmat-pro',
    name: 'Keebmat Pro Deskmat',
    image: '/images/products/accessories/accessory-1.jpg',
  },
  {
    id: 'prod-astra-65',
    name: 'Astra 65 Barebone Kit',
    image: '/images/products/keyboards/keyboard-2.jpg',
  },
];

const REVIEW_TITLES = [
  'Excellent typing feel',
  'Really nice for daily use',
  'Build quality surprised me',
  'Good but can be better',
  'Worth the price point',
  'Would buy again',
];

const REVIEW_CONTENTS = [
  'Switches are smooth and the stabilizers come pre-tuned. The board sounds clean out of the box.',
  'Keycaps feel premium and legends are sharp. Profile is comfortable for long coding sessions.',
  'Packaging is neat and every accessory was included. Setup took less than ten minutes.',
  'The finish is great. I wish the stock cable was a little softer, but overall still solid.',
  'Sound profile is deeper than expected. Very stable on desk and no ping after basic modding.',
  'Fast shipping and quality control looks consistent. Recommended for first custom keyboard.',
];

const STATUS_ROTATION: AdminReviewDetail['status'][] = [
  'published',
  'pending',
  'published',
  'hidden',
  'rejected',
  'published',
  'pending',
];

export const createSeedReviews = (): AdminReviewDetail[] => {
  const now = new Date();

  return Array.from({ length: 32 }, (_, index) => {
    const product = PRODUCT_CATALOG[index % PRODUCT_CATALOG.length];
    const reviewerName = REVIEWER_NAMES[index % REVIEWER_NAMES.length];
    const rating = 5 - (index % 4);

    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - index);

    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + ((index % 5) + 1) * 2);

    return {
      id: `review-${1200 + index}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      reviewerName,
      reviewerEmail: `${reviewerName.toLowerCase().replace(/\s+/g, '.')}@mail.dev`,
      title: REVIEW_TITLES[index % REVIEW_TITLES.length],
      content: REVIEW_CONTENTS[index % REVIEW_CONTENTS.length],
      rating,
      helpfulCount: 3 + (index % 17),
      status: STATUS_ROTATION[index % STATUS_ROTATION.length],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
};
