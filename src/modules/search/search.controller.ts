import { Request, Response } from 'express';
import { z } from 'zod';
import * as searchService from './search.service';

const flightQuerySchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  passengers: z.string().default('1').transform(Number),
});

const hotelQuerySchema = z.object({
  location: z.string().min(2),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  guests: z.string().default('1').transform(Number),
});

export async function searchFlights(req: Request, res: Response): Promise<void> {
  const params = flightQuerySchema.parse(req.query);
  const results = await searchService.searchFlights(params);
  res.json({ success: true, data: results });
}

export async function searchHotels(req: Request, res: Response): Promise<void> {
  const params = hotelQuerySchema.parse(req.query);
  const results = await searchService.searchHotels(params);
  res.json({ success: true, data: results });
}
