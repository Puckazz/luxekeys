import { z } from 'zod';

import { USER_ROLES } from '@/lib/rbac';

const userRoleSchema = z.enum(USER_ROLES);

const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export const adminUserFormSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().email('Please provide a valid email address.'),
  phone: z.string().trim().max(30, 'Phone must be 30 characters or fewer.'),
  password: z
    .string()
    .trim()
    .refine(
      (password) => password.length === 0 || password.length >= 8,
      'Temporary password must be at least 8 characters.'
    ),
  role: userRoleSchema,
  status: userStatusSchema,
});

export type AdminUserFormSchemaValues = z.infer<typeof adminUserFormSchema>;
