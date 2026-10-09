import { prisma } from '../../config/database';
import { publishMessage } from '../../config/rabbitmq';
import { AppError } from '../../middleware/errorHandler';
import { BOOKING_ROUTING_KEY } from '../../config/rabbitmq';
import { CreateBookingInput } from './booking.schema';
import { BookingConfirmedEvent } from '../../types';

export async function createBooking(userId: string, userEmail: string, input: CreateBookingInput) {
  if (input.type === 'FLIGHT') {
    return createFlightBooking(userId, userEmail, input);
  }
  return createHotelBooking(userId, userEmail, input);
}

async function createFlightBooking(
  userId: string,
  userEmail: string,
  input: Extract<CreateBookingInput, { type: 'FLIGHT' }>,
) {
  return prisma.$transaction(async (tx) => {
    const flight = await tx.flight.findUnique({ where: { id: input.flightId } });
    if (!flight) throw new AppError('Flight not found', 404);
    if (flight.availableSeats < input.passengers) {
      throw new AppError(`Only ${flight.availableSeats} seats available`, 409);
    }

    await tx.flight.update({
      where: { id: input.flightId },
      data: { availableSeats: { decrement: input.passengers } },
    });

    const totalPrice = Number(flight.price) * input.passengers;

    const booking = await tx.booking.create({
      data: {
        userId,
        type: 'FLIGHT',
        status: 'CONFIRMED',
        totalPrice,
        flightId: input.flightId,
        guests: input.passengers,
      },
      include: { flight: true },
    });

    await publishBookingEvent(booking.id, userId, userEmail, 'FLIGHT', totalPrice);
    return booking;
  });
}

async function createHotelBooking(
  userId: string,
  userEmail: string,
  input: Extract<CreateBookingInput, { type: 'HOTEL' }>,
) {
  return prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.findUnique({ where: { id: input.hotelId } });
    if (!hotel) throw new AppError('Hotel not found', 404);
    if (hotel.availableRooms < 1) throw new AppError('No rooms available', 409);

    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    if (checkOut <= checkIn) throw new AppError('Check-out must be after check-in', 400);

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    await tx.hotel.update({
      where: { id: input.hotelId },
      data: { availableRooms: { decrement: 1 } },
    });

    const totalPrice = Number(hotel.pricePerNight) * nights;

    const booking = await tx.booking.create({
      data: {
        userId,
        type: 'HOTEL',
        status: 'CONFIRMED',
        totalPrice,
        hotelId: input.hotelId,
        checkIn,
        checkOut,
        guests: input.guests,
      },
      include: { hotel: true },
    });

    await publishBookingEvent(booking.id, userId, userEmail, 'HOTEL', totalPrice);
    return booking;
  });
}

async function publishBookingEvent(
  bookingId: string,
  userId: string,
  userEmail: string,
  type: string,
  totalPrice: number,
): Promise<void> {
  const event: BookingConfirmedEvent = {
    bookingId,
    userId,
    userEmail,
    type,
    totalPrice,
    timestamp: new Date().toISOString(),
  };
  await publishMessage(BOOKING_ROUTING_KEY, event);
}

export async function getUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { flight: true, hotel: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookingById(bookingId: string, userId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { flight: true, hotel: true },
  });
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
}
