/**
 * Screening Routes
 * /api/v1/screening
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { submitScreening, getScreeningHistory, getQuestions } from '../controllers/screeningController.js';

const router = Router();

// GET /api/v1/screening/questions - Get screening questions (public)
router.get('/questions', getQuestions);

// All other routes require authentication
router.use(requireAuth());

// POST /api/v1/screening - Submit screening
router.post('/', submitScreening);

// GET /api/v1/screening/history - Get screening history
router.get('/history', getScreeningHistory);

export default router;
