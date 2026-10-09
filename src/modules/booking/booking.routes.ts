import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as bookingController from './booking.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(bookingController.createBooking as any));
router.get('/', asyncHandler(bookingController.getMyBookings as any));
router.get('/:id', asyncHandler(bookingController.getBooking as any));

export default router;
