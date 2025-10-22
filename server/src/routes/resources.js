/**
 * Resource Routes
 * /api/v1/resources
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  completeResource
} from '../controllers/resourceController.js';

const router = Router();

// Public routes (no auth required)
router.get('/', getResources);
router.get('/:id', getResourceById);

// Protected routes (require auth)
router.post('/:id/complete', requireAuth(), completeResource);

// Admin routes (require auth + admin check in controller)
router.post('/', requireAuth(), createResource);
router.patch('/:id', requireAuth(), updateResource);
router.delete('/:id', requireAuth(), deleteResource);

export default router;
