/**
 * Chat Controller
 * Handles AI-powered chat with RAG, PII redaction, and crisis detection
 */

import ChatLog from '../models/ChatLog.js';
import User from '../models/User.js';
import { redactPII, sanitizeInput } from '../utils/redaction.js';
import { detectCrisis, getCannedResponse, buildPrompt, retrieveRelevantDocs } from '../chat/context.js';
import { getChatCompletion, isAIConfigured, getAIProviderInfo } from '../services/aiService.js';
import { getAuth } from '@clerk/express';

/**
 * POST /api/v1/chat
 * Send a chat message and get AI response
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message, mood, theme } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Sanitize and redact PII from user message
    const sanitized = sanitizeInput(message);
    const redacted = redactPII(sanitized);

    // Check for crisis indicators
    const isCrisis = detectCrisis(message);

    let reply, sources, usedAI, escalationActions;

    // Check if AI is configured
    if (isAIConfigured()) {
      try {
        // Get AI provider info for logging
        const providerInfo = getAIProviderInfo();
        console.log(`🤖 Using AI provider: ${providerInfo.provider} (${providerInfo.model})`);

        // TODO: Generate embedding for RAG retrieval
        // const embedding = await generateEmbedding(redacted);
        // const retrieved = await retrieveRelevantDocs(embedding, 3);
        
        // For now, use static snippets
        const retrieved = await retrieveRelevantDocs(null, 3);

        // Build prompt with context
        const messages = buildPrompt({
          message: redacted,
          userContext: { mood, theme },
          retrieved
        });

        // Call unified AI service (automatically routes to OpenAI or Gemini)
        reply = await getChatCompletion(messages, {
          temperature: 0.8,
          max_tokens: 800,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        });

        sources = retrieved.map(r => r.id || r.source);
        usedAI = true;
        console.log(`✅ ${providerInfo.provider} response generated successfully`);

      } catch (aiError) {
        console.error('❌ AI API error:', aiError.message);
        // Fallback to canned response
        const canned = getCannedResponse(message, mood, theme);
        reply = canned.reply;
        sources = canned.sources;
        escalationActions = canned.escalationActions;
        usedAI = false;
      }
    } else {
      // No AI key configured, use canned responses
      console.log('ℹ️ AI not configured, using canned responses');
      const canned = getCannedResponse(message, mood, theme);
      reply = canned.reply;
      sources = canned.sources;
      escalationActions = canned.escalationActions;
      usedAI = false;
    }

    // Save chat log (with redacted message)
    const chatLog = new ChatLog({
      userId,
      message: redacted,
      reply,
      sentiment: 0, // TODO: Implement sentiment analysis
      escalate: isCrisis,
      escalationActions: isCrisis ? escalationActions || ['call_helpline', 'book_counsellor'] : [],
      sources: sources || ['local_template'],
      mood,
      theme,
      usedAI,
      sessionId: req.headers['x-session-id'] || null
    });

    await chatLog.save();

    // Update user's last activity for streak tracking
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      await user.updateStreak();
    }

    // Return response (format matches frontend ChatResponse interface)
    res.json({
      reply,
      actions: isCrisis 
        ? (escalationActions || ['get_counselor', 'crisis_support'])
        : ['exercises', 'resources', 'quick_check'],
      sources,
      escalate: isCrisis,
      chatId: chatLog._id
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/history
 * Get user's chat history
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 50, skip = 0 } = req.query;

    const chats = await ChatLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await ChatLog.countDocuments({ userId });

    res.json({
      chats,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/chat/history
 * Delete user's chat history
 */
export const deleteChatHistory = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await ChatLog.deleteMany({ userId });

    res.json({
      message: 'Chat history deleted',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    next(error);
  }
};

export default {
  sendMessage,
  getChatHistory,
  deleteChatHistory
};
