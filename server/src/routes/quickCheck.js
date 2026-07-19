/**
 * Quick Check Routes
 * AI-powered adaptive mental health check-in
 */

import express from 'express';
import { requireAuth } from '@clerk/express';
import { startQuickCheck, processAnswer, getQuickCheckHistory } from '../controllers/quickCheckController.js';

const router = express.Router();

// Require Clerk Auth for all Quick Check endpoints
router.use(requireAuth());

// Start Quick Check session
router.post('/start', startQuickCheck);

// Process answer and get next question or result
router.post('/answer', processAnswer);

// Get Quick Check history
router.get('/history', getQuickCheckHistory);

export default router;
