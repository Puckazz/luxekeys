import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').trim(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters').trim(),
    email: z.email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .trim(),
    confirmpassword: z.string().min(1, 'Please confirm your password').trim(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ['confirmpassword'],
    message: 'Passwords do not match',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
