import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().min(1, 'Enter your email or phone number'),
  password: z.string().min(1, 'Enter your password'),
  remember_me: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter the full name').max(255),
    email: z.string().email('Enter a valid email address'),
    phone: z
      .string()
      .min(6, 'Enter a Bangladeshi mobile number')
      .max(20),
    password: z.string().min(8, 'Use at least 8 characters'),
    password_confirmation: z.string(),
    date_of_birth: z.string().min(1, 'Enter the date of birth'),
    gender: z.enum(['male', 'female']),
    profile_created_by: z.enum(['self', 'parent', 'sibling', 'relative', 'guardian']),
    terms_accepted: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, 'Use at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    password: z.string().min(8, 'Use at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
