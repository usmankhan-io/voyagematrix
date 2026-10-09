import { prisma } from '../../config/database';
import { getCached, setCache } from '../../config/redis';
import { FlightSearchParams, HotelSearchParams, SearchResults } from '../../types';

const CACHE_TTL = 300; // 5 minutes

export async function searchFlights(params: FlightSearchParams): Promise<SearchResults> {
  const cacheKey = `flights:${params.origin}:${params.destination}:${params.departureDate}:${params.passengers}`;

  const cached = await getCached<SearchResults>(cacheKey);
  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return { ...cached, cachedAt: cached.cachedAt };
  }

  console.log(`Cache MISS: ${cacheKey}`);

  const departureStart = new Date(params.departureDate);
  const departureEnd = new Date(params.departureDate);
  departureEnd.setDate(departureEnd.getDate() + 1);

  const flights = await prisma.flight.findMany({
    where: {
      origin: { contains: params.origin, mode: 'insensitive' },
      destination: { contains: params.destination, mode: 'insensitive' },
      departureTime: { gte: departureStart, lt: departureEnd },
      availableSeats: { gte: params.passengers },
    },
    orderBy: { price: 'asc' },
    take: 20,
  });

  const result: SearchResults = {
    flights: flights.map((f) => ({
      id: f.id,
      airline: f.airline,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime.toISOString(),
      arrivalTime: f.arrivalTime.toISOString(),
      price: Number(f.price),
      availableSeats: f.availableSeats,
    })),
    cachedAt: new Date().toISOString(),
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

export async function searchHotels(params: HotelSearchParams): Promise<SearchResults> {
  const cacheKey = `hotels:${params.location}:${params.checkIn}:${params.checkOut}:${params.guests}`;

  const cached = await getCached<SearchResults>(cacheKey);
  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS: ${cacheKey}`);

  const hotels = await prisma.hotel.findMany({
    where: {
      location: { contains: params.location, mode: 'insensitive' },
      availableRooms: { gte: 1 },
    },
    orderBy: { pricePerNight: 'asc' },
    take: 20,
  });

  const result: SearchResults = {
    hotels: hotels.map((h) => ({
      id: h.id,
      name: h.name,
      location: h.location,
      pricePerNight: Number(h.pricePerNight),
      availableRooms: h.availableRooms,
      rating: h.rating,
    })),
    cachedAt: new Date().toISOString(),
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}
