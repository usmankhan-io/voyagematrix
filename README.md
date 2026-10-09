# VoyageMatrix API

A production-grade REST API for a travel aggregation and booking platform. Built with Node.js, TypeScript, and Express, it handles user authentication, real-time travel search with caching, transactional bookings, and event-driven confirmation messaging.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL via Prisma ORM
- **Cache:** Redis (search result caching)
- **Messaging:** RabbitMQ via amqplib
- **Validation:** Zod
- **Auth:** JWT with bcrypt password hashing

## Project Structure

```
src/
├── config/          # Database, Redis, RabbitMQ, and env configuration
├── middleware/       # Auth guard, async wrapper, centralized error handler
├── modules/
│   ├── auth/        # Signup, login, JWT issuance
│   ├── search/      # Flight and hotel search with Redis caching
│   └── booking/     # Transactional booking creation and retrieval
├── workers/         # RabbitMQ consumer for booking confirmation events
└── types/           # Shared TypeScript interfaces
prisma/
├── schema.prisma    # Data models: User, Flight, Hotel, Booking
└── seed.ts          # Sample flight and hotel data
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose

## Getting Started

**1. Clone the repository and install dependencies**

```bash
git clone <repo-url>
cd VoyageMatrix-API
npm install
```

**2. Start infrastructure services**

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432, Redis on 6379, and RabbitMQ on 5672 (management UI at http://localhost:15672, credentials: guest/guest).

**3. Configure environment**

```bash
cp .env.example .env
```

Update `JWT_SECRET` with a strong secret before deploying to any environment beyond local development.

**4. Run database migrations and generate Prisma client**

```bash
npm run prisma:generate
npm run prisma:migrate
```

**5. Seed sample data**

```bash
npx ts-node prisma/seed.ts
```

**6. Start the API server**

```bash
npm run dev
```

The server starts on `http://localhost:3001` by default.

**7. Start the booking consumer worker** (separate terminal)

```bash
npm run worker
```

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/signup` | — | Register a new user |
| POST | `/api/v1/auth/login` | — | Login and receive a JWT |

**Signup request body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

### Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/search/flights` | Bearer | Search available flights |
| GET | `/api/v1/search/hotels` | Bearer | Search available hotels |

**Flight search query parameters:**
```
origin=New+York&destination=Los+Angeles&departureDate=2026-11-01&passengers=1
```

**Hotel search query parameters:**
```
location=Paris&checkIn=2026-11-01&checkOut=2026-11-05&guests=2
```

Search results are cached in Redis for 5 minutes. Subsequent identical queries return the cached response immediately.

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/bookings` | Bearer | Create a new booking |
| GET | `/api/v1/bookings` | Bearer | List all bookings for the authenticated user |
| GET | `/api/v1/bookings/:id` | Bearer | Get a single booking by ID |

**Flight booking request body:**
```json
{
  "type": "FLIGHT",
  "flightId": "<id from search results>",
  "passengers": 1
}
```

**Hotel booking request body:**
```json
{
  "type": "HOTEL",
  "hotelId": "<id from search results>",
  "checkIn": "2026-11-01",
  "checkOut": "2026-11-05",
  "guests": 2
}
```

### Health Check

```
GET /health
```

## How It Works

**Booking flow:**
1. Client calls `POST /api/v1/bookings` with a valid JWT.
2. A Prisma database transaction locks the flight or hotel record, checks seat/room availability, decrements inventory, and creates the booking — all atomically.
3. On commit, a `booking.confirmed` event is published to the `booking_exchange` on RabbitMQ.
4. The consumer worker receives the event and processes the confirmation (simulated email notification in development).

**Caching:**
- Search queries are keyed by their parameters (origin, destination, date, passenger count).
- On a cache miss the database is queried and the result is stored with a 5-minute TTL.
- A cache hit skips the database entirely and returns the stored result with the original `cachedAt` timestamp.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://guest:guest@localhost:5672` |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the API server with hot reload |
| `npm run worker` | Start the RabbitMQ consumer worker |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run pending database migrations |
| `npm run prisma:studio` | Open Prisma Studio database browser |

## License

MIT
