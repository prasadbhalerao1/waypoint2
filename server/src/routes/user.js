/**
 * User Routes
 * /api/v1/user
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  getCurrentUser,
  updateProfile,
  updateTheme,
  updateMood,
  updateConsent,
  completeOnboarding,
  getUserStats,
  deleteAccount,
  checkUsername,
  getUsernameSuggestions
} from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth());

// GET /api/v1/user/me - Get current user
router.get('/me', getCurrentUser);

// PATCH /api/v1/user/me - Update profile
router.patch('/me', updateProfile);

// PATCH /api/v1/user/me/theme - Update theme
router.patch('/me/theme', updateTheme);

// PATCH /api/v1/user/me/mood - Update mood
router.patch('/me/mood', updateMood);

// POST /api/v1/user/me/consent - Update consents
router.post('/me/consent', updateConsent);

// POST /api/v1/user/me/complete-onboarding - Complete onboarding
router.post('/me/complete-onboarding', completeOnboarding);

// GET /api/v1/user/me/stats - Get gamification stats
router.get('/me/stats', getUserStats);

// DELETE /api/v1/user/me - Delete account
router.delete('/me', deleteAccount);

// GET /api/v1/user/username/check/:username - Check username availability
router.get('/username/check/:username', checkUsername);

// GET /api/v1/user/username/suggestions - Get username suggestions
router.get('/username/suggestions', getUsernameSuggestions);

export default router;
