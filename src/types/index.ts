import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface SearchResults {
  flights?: FlightResult[];
  hotels?: HotelResult[];
  cachedAt?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

export interface HotelResult {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  rating: number;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  userId: string;
  userEmail: string;
  type: string;
  totalPrice: number;
  timestamp: string;
}
