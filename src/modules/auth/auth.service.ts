import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { SignupInput, LoginInput } from './auth.schema';
import { JwtPayload } from '../../types';

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}
