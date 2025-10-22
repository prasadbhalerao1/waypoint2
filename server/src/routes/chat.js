/**
 * Chat Routes
 * /api/v1/chat
 */

import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { sendMessage, getChatHistory, deleteChatHistory } from '../controllers/chatController.js';

const router = Router();

// All chat routes require authentication
router.use(requireAuth());

// POST /api/v1/chat - Send chat message
router.post('/', sendMessage);

// GET /api/v1/chat/history - Get chat history
router.get('/history', getChatHistory);

// DELETE /api/v1/chat/history - Delete chat history
router.delete('/history', deleteChatHistory);

export default router;
