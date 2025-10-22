/**
 * Forum Routes
 * /api/v1/forum
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  getPosts,
  getPostById,
  createPost,
  addComment,
  togglePostLike,
  toggleCommentLike,
  flagPost,
  deletePost
} from '../controllers/forumController.js';

const router = Router();

// Public routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);

// Protected routes (require auth)
router.post('/posts', requireAuth(), createPost);
router.post('/posts/:id/comments', requireAuth(), addComment);
router.post('/posts/:id/like', requireAuth(), togglePostLike);
router.post('/comments/:id/like', requireAuth(), toggleCommentLike);
router.post('/posts/:id/flag', requireAuth(), flagPost);
router.delete('/posts/:id', requireAuth(), deletePost);

export default router;
