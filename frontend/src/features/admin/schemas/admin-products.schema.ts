import { z } from 'zod';

import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_PRODUCT_STATUSES,
  ADMIN_VARIANT_STATUSES,
} from '@/features/admin/types';
import { PRODUCT_LAYOUT_OPTIONS } from '@/features/shop/utils/product-list-options.utils';

const productStatusSchema = z.enum(
  ADMIN_PRODUCT_STATUSES.filter((status) => status !== 'archived') as [
    'active' | 'draft',
    ...Array<'active' | 'draft'>,
  ]
);

const variantStatusSchema = z.enum(ADMIN_VARIANT_STATUSES);
const productLayoutSchema = z.enum(PRODUCT_LAYOUT_OPTIONS);
const adminProductSpecSchema = z.object({
  id: z.string().optional(),
  groupName: z.string().trim(),
  specKey: z.string().trim().min(1, 'Spec name is required.'),
  specValue: z.string().trim().min(1, 'Spec value is required.'),
});

const adminProductSwitchOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Switch option name is required.'),
  switchType: z.string().trim().min(1, 'Switch type is required.'),
  originalPrice: z.union([
    z.literal(''),
    z.number().min(0, 'Original price must be 0 or greater.'),
  ]),
  price: z.number().min(0, 'Switch price must be 0 or greater.'),
  stock: z.number().int().min(0, 'Switch stock must be 0 or greater.'),
  isDefault: z.boolean(),
  status: variantStatusSchema,
}).refine((option) => {
  if (option.originalPrice === '') {
    return true;
  }

  return option.originalPrice >= option.price;
}, {
  message: 'Original price must be greater than or equal to price.',
  path: ['originalPrice'],
});

export const adminProductVariantSchema = z
  .object({
    id: z.string().optional(),
    color: z.string().trim().min(1, 'Color is required.'),
    layout: z.union([z.literal(''), productLayoutSchema]),
    switchType: z.string(),
    sku: z.string().trim().min(3, 'SKU must be at least 3 characters.'),
    originalPrice: z.union([
      z.literal(''),
      z.number().min(0, 'Original price must be 0 or greater.'),
    ]),
    price: z.number().min(0, 'Price must be 0 or greater.'),
    stock: z.number().int().min(0, 'Stock must be 0 or greater.'),
    isDefault: z.boolean(),
    status: variantStatusSchema,
    switchOptions: z.array(adminProductSwitchOptionSchema),
  })
  .refine((variant) => {
    if (variant.originalPrice === '') {
      return true;
    }

    return variant.originalPrice >= variant.price;
  }, {
    message: 'Original price must be greater than or equal to price.',
    path: ['originalPrice'],
  });

export const adminProductFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters.'),
    shortDescription: z
      .string()
      .trim()
      .max(300, 'Short description must be 300 characters or fewer.'),
    productType: z.enum(ADMIN_PRODUCT_CATEGORIES),
    brandId: z.string(),
    catalogCategoryId: z.string(),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters.'),
    thumbnail: z
      .string()
      .trim()
      .min(1, 'Thumbnail URL is required.')
      .url('Thumbnail must be a valid URL.'),
    tags: z.string(),
    isFeatured: z.boolean(),
    status: productStatusSchema,
    specs: z.array(adminProductSpecSchema),
    variants: z
      .array(adminProductVariantSchema)
      .min(1, 'At least one variant is required.'),
  })
  .superRefine((product, context) => {
    if (!product.variants.some((variant) => variant.isDefault)) {
      context.addIssue({
        code: 'custom',
        message: 'Choose one default variant.',
        path: ['variants'],
      });
    }

    product.variants.forEach((variant, index) => {
      if (product.productType === 'keyboards') {
        if (!variant.layout) {
          context.addIssue({
            code: 'custom',
            message: 'Layout is required.',
            path: ['variants', index, 'layout'],
          });
        }

        if (variant.switchOptions.length === 0) {
          context.addIssue({
            code: 'custom',
            message: 'At least one switch option is required.',
            path: ['variants', index, 'switchOptions'],
          });
        }

        if (
          variant.switchOptions.length > 0 &&
          !variant.switchOptions.some((option) => option.isDefault)
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Choose one default switch option.',
            path: ['variants', index, 'switchOptions'],
          });
        }

        return;
      }

      if (!variant.switchType.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Variant label is required.',
          path: ['variants', index, 'switchType'],
        });
      }
    });
  });

export type AdminProductFormSchemaValues = z.infer<
  typeof adminProductFormSchema
>;
