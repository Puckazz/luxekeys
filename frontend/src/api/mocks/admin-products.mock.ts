import type { AdminProduct } from '@/features/admin/types';

export const createSeedProducts = (): AdminProduct[] => {
  const createdAt = new Date().toISOString();
  const pulseProducts = Array.from({ length: 11 }, (_, index) => ({
    id: `prod_pulse_switch_${index + 1}`,
    name: `Pulse Switch Pack ${index + 1}`,
    category: 'switches' as const,
    description: 'Factory-lubed switch pack for smooth typing feel.',
    thumbnail:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
    status: 'active' as const,
    createdAt,
    updatedAt: createdAt,
    variants: [
      {
        id: `var_pulse_smoke_linear_${index + 1}`,
        color: 'Smoke Gray',
        switchType: 'Linear',
        sku: `PULSE-SMK-LIN-${index + 1}`,
        originalPrice: 39,
        price: 34,
        stock: 240,
        status: 'active' as const,
      },
    ],
  }));

  return [
    {
      id: 'prod_nova75',
      name: 'Nova75 Wireless Keyboard',
      category: 'keyboards',
      description:
        'Aluminum 75% keyboard with gasket mount, tri-mode wireless, and hot-swap PCB.',
      thumbnail:
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      variants: [
        {
          id: 'var_nova75_black_linear',
          color: 'Matte Black',
          switchType: 'Linear',
          sku: 'NOVA75-BLK-LIN',
          originalPrice: 229,
          price: 189,
          stock: 54,
          status: 'active',
        },
        {
          id: 'var_nova75_cream_tactile',
          color: 'Cream',
          switchType: 'Tactile',
          sku: 'NOVA75-CRM-TAC',
          originalPrice: 239,
          price: 199,
          stock: 22,
          status: 'active',
        },
      ],
    },
    {
      id: 'prod_aurora_caps',
      name: 'Aurora PBT Keycap Set',
      category: 'keycaps',
      description:
        'Double-shot PBT keycap set with clean legends and full compatibility kit.',
      thumbnail:
        'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80',
      status: 'draft',
      createdAt,
      updatedAt: createdAt,
      variants: [
        {
          id: 'var_aurora_ocean_linear',
          color: 'Ocean Blue',
          switchType: 'Linear',
          sku: 'AURORA-OCE-LIN',
          originalPrice: 99,
          price: 79,
          stock: 102,
          status: 'active',
        },
        {
          id: 'var_aurora_sand_tactile',
          color: 'Sand White',
          switchType: 'Tactile',
          sku: 'AURORA-SND-TAC',
          originalPrice: 99,
          price: 79,
          stock: 48,
          status: 'draft',
        },
      ],
    },
    ...pulseProducts,
  ];
};
