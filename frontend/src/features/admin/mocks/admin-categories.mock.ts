import type { AdminCategory } from '@/features/admin/types';

export const createSeedCategories = (): AdminCategory[] => {
  const createdAt = new Date().toISOString();

  return [
    {
      id: 'cat_keyboards',
      name: 'Keyboards',
      slug: 'keyboards',
      description:
        'Mechanical keyboards with multiple layouts and mounting styles.',
      productCount: 42,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'cat_switches',
      name: 'Switches',
      slug: 'switches',
      description:
        'Linear, tactile, and clicky switches with various spring weights.',
      productCount: 58,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'cat_keycaps',
      name: 'Keycaps',
      slug: 'keycaps',
      description:
        'PBT and ABS keycap sets with multiple profiles and legends.',
      productCount: 35,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'cat_accessories',
      name: 'Accessories',
      slug: 'accessories',
      description:
        'Cases, coiled cables, wrist rests, and keyboard maintenance tools.',
      productCount: 19,
      status: 'draft',
      createdAt,
      updatedAt: createdAt,
    },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: `cat_custom_${index + 1}`,
      name: `Custom Category ${index + 1}`,
      slug: `custom-category-${index + 1}`,
      description:
        'Temporary mock category for admin pagination and filtering tests.',
      productCount: Math.max(0, 12 - index),
      status: index % 5 === 0 ? ('draft' as const) : ('active' as const),
      createdAt,
      updatedAt: createdAt,
    })),
  ];
};
