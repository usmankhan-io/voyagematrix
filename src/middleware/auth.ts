import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { AuthRequest, JwtPayload } from '../types';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...roles: Role[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
