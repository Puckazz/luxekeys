import { z } from 'zod';

export const adminInventoryBulkUpdateSchema = z.object({
  stock: z.number().int().min(0, 'Stock must be 0 or greater.'),
});

export type AdminInventoryBulkUpdateSchemaValues = z.infer<
  typeof adminInventoryBulkUpdateSchema
>;
