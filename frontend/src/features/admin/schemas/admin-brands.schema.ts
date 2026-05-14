import { z } from 'zod';

import { ADMIN_BRAND_STATUSES } from '@/features/admin/types';

const brandStatusSchema = z.enum(
  ADMIN_BRAND_STATUSES.filter((status) => status !== 'archived') as [
    'active' | 'draft',
    ...Array<'active' | 'draft'>,
  ]
);

export const adminBrandFormSchema = z.object({
  name: z.string().trim().min(2, 'Brand name must be at least 2 characters.'),
  logoUrl: z
    .string()
    .trim()
    .url('Logo URL must be a valid URL.')
    .or(z.literal('')),
  status: brandStatusSchema,
});

export type AdminBrandFormSchemaValues = z.infer<typeof adminBrandFormSchema>;
