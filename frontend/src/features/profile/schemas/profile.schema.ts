import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.'),
  email: z.email('Please enter a valid email.'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]{8,18}$/, 'Please enter a valid phone number.'),
});

export const addressSchema = z.object({
  label: z.string().trim().min(2, 'Label is required.'),
  fullName: z.string().trim().min(2, 'Full name is required.'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]{8,18}$/, 'Please enter a valid phone number.'),
  streetAddress: z
    .string()
    .trim()
    .min(6, 'Street address must be at least 6 characters.'),
  city: z.string().trim().min(2, 'City is required.'),
  district: z.string().trim().min(2, 'District is required.'),
  isDefault: z.boolean(),
});
