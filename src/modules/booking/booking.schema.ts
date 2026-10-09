import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('FLIGHT'),
      flightId: z.string().cuid(),
      passengers: z.number().int().min(1).max(9),
    }),
    z.object({
      type: z.literal('HOTEL'),
      hotelId: z.string().cuid(),
      checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      guests: z.number().int().min(1).max(10),
    }),
  ]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
