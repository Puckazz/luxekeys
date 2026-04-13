import { z } from 'zod';

import { ADMIN_REVIEW_STATUSES } from '@/features/admin/types/admin-reviews.types';

export const adminReviewModerationSchema = z.object({
  status: z.enum(ADMIN_REVIEW_STATUSES),
  moderationNote: z
    .string()
    .trim()
    .max(240, 'Note must be 240 characters or fewer.')
    .optional(),
});

export type AdminReviewModerationSchemaValues = z.infer<
  typeof adminReviewModerationSchema
>;
