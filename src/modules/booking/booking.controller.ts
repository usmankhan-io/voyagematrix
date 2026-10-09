import { Response } from 'express';
import { AuthRequest } from '../../types';
import { createBookingSchema } from './booking.schema';
import * as bookingService from './booking.service';
import { AppError } from '../../middleware/errorHandler';

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { body } = createBookingSchema.parse({ body: req.body });
  const booking = await bookingService.createBooking(req.user.userId, req.user.email, body);
  res.status(201).json({ success: true, data: booking });
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const bookings = await bookingService.getUserBookings(req.user.userId);
  res.json({ success: true, data: bookings });
}

export async function getBooking(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
  res.json({ success: true, data: booking });
}
