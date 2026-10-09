import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.flight.createMany({
    data: [
      {
        airline: 'SkyWings',
        origin: 'New York',
        destination: 'Los Angeles',
        departureTime: new Date('2026-11-01T08:00:00Z'),
        arrivalTime: new Date('2026-11-01T11:30:00Z'),
        price: 299.99,
        totalSeats: 180,
        availableSeats: 120,
      },
      {
        airline: 'AeroJet',
        origin: 'New York',
        destination: 'Los Angeles',
        departureTime: new Date('2026-11-01T14:00:00Z'),
        arrivalTime: new Date('2026-11-01T17:30:00Z'),
        price: 249.99,
        totalSeats: 200,
        availableSeats: 85,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.hotel.createMany({
    data: [
      {
        name: 'Grand Paris Hotel',
        location: 'Paris',
        pricePerNight: 189.0,
        totalRooms: 80,
        availableRooms: 30,
        rating: 4.5,
      },
      {
        name: 'Eiffel Boutique',
        location: 'Paris',
        pricePerNight: 120.0,
        totalRooms: 40,
        availableRooms: 12,
        rating: 4.1,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
