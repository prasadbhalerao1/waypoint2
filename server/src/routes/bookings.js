/**
 * Booking Routes
 * /api/v1/bookings
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  getAvailableCounsellors
} from '../controllers/bookingController.js';

const router = Router();

// All booking routes require authentication
router.use(requireAuth());

// GET /api/v1/bookings/counsellors/available - Get available counsellors
router.get('/counsellors/available', getAvailableCounsellors);

// POST /api/v1/bookings - Create booking
router.post('/', createBooking);

// GET /api/v1/bookings - Get user's bookings
router.get('/', getBookings);

// GET /api/v1/bookings/:id - Get booking by ID
router.get('/:id', getBookingById);

// PATCH /api/v1/bookings/:id - Update booking
router.patch('/:id', updateBooking);

export default router;
