/**
 * Admin Routes
 * /api/v1/admin
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getAnalytics,
  getCounsellors,
  verifyCounsellor,
  getFlaggedPosts,
  moderatePost,
  getAlerts
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication AND admin authorization
router.use(requireAuth());
router.use(requireAdmin);

// GET /api/v1/admin/analytics - Get analytics dashboard
router.get('/analytics', getAnalytics);

// GET /api/v1/admin/alerts - Get system alerts
router.get('/alerts', getAlerts);

// GET /api/v1/admin/counsellors - Get all counsellors
router.get('/counsellors', getCounsellors);

// PATCH /api/v1/admin/counsellors/:id/verify - Verify counsellor
router.patch('/counsellors/:id/verify', verifyCounsellor);

// GET /api/v1/admin/flagged-posts - Get flagged posts
router.get('/flagged-posts', getFlaggedPosts);

// PATCH /api/v1/admin/posts/:id/moderate - Moderate post
router.patch('/posts/:id/moderate', moderatePost);

export default router;
