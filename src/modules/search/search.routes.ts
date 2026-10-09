import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as searchController from './search.controller';

const router = Router();

router.use(authenticate);

router.get('/flights', asyncHandler(searchController.searchFlights));
router.get('/hotels', asyncHandler(searchController.searchHotels));

export default router;
