import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import searchRoutes from './modules/search/search.routes';
import bookingRoutes from './modules/booking/booking.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'VoyageMatrix API', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.use(errorHandler);

export default app;
