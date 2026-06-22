import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  keepSignedIn: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
