import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(72),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
