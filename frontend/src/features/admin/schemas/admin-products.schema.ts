import { z } from 'zod';

import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_PRODUCT_STATUSES,
  ADMIN_VARIANT_STATUSES,
} from '@/features/admin/types';

const productStatusSchema = z.enum(
  ADMIN_PRODUCT_STATUSES.filter((status) => status !== 'archived') as [
    'active' | 'draft',
    ...Array<'active' | 'draft'>,
  ]
);

const variantStatusSchema = z.enum(ADMIN_VARIANT_STATUSES);

export const adminProductVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().trim().min(1, 'Color is required.'),
  switchType: z.string().trim().min(1, 'Switch type is required.'),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters.'),
  price: z.number().min(0, 'Price must be 0 or greater.'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater.'),
  status: variantStatusSchema,
});

export const adminProductFormSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters.'),
  category: z.enum(ADMIN_PRODUCT_CATEGORIES),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.'),
  thumbnail: z
    .string()
    .trim()
    .min(1, 'Thumbnail URL is required.')
    .url('Thumbnail must be a valid URL.'),
  status: productStatusSchema,
  variants: z
    .array(adminProductVariantSchema)
    .min(1, 'At least one variant is required.'),
});

export type AdminProductFormSchemaValues = z.infer<
  typeof adminProductFormSchema
>;
