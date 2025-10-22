/**
 * Quick Check Routes
 * AI-powered adaptive mental health check-in
 */

import express from 'express';
import { startQuickCheck, processAnswer, getQuickCheckHistory } from '../controllers/quickCheckController.js';

const router = express.Router();

// Start Quick Check session
router.post('/start', startQuickCheck);

// Process answer and get next question or result
router.post('/answer', processAnswer);

// Get Quick Check history
router.get('/history', getQuickCheckHistory);

export default router;
