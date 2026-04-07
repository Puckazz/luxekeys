import { z } from 'zod';

import { ADMIN_CATEGORY_STATUSES } from '@/features/admin/types';

const categoryStatusSchema = z.enum(
  ADMIN_CATEGORY_STATUSES.filter((status) => status !== 'archived') as [
    'active' | 'draft',
    ...Array<'active' | 'draft'>,
  ]
);

export const adminCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.'),
  status: categoryStatusSchema,
});

export type AdminCategoryFormSchemaValues = z.infer<
  typeof adminCategoryFormSchema
>;
