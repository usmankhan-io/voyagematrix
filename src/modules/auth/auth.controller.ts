import { Request, Response } from 'express';
import { signupSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';

export async function signup(req: Request, res: Response): Promise<void> {
  const { body } = signupSchema.parse({ body: req.body });
  const result = await authService.signup(body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await authService.login(body);
  res.json({ success: true, data: result });
}
