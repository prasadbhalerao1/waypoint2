/**
 * Quick Check Controller
 * AI-powered adaptive mental health check-in with structured output
 */

import { getAuth } from '@clerk/express';
import { getStructuredOutput, getChatCompletion, isAIConfigured } from '../services/aiService.js';
import User from '../models/User.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load Quick Check prompt
const PROMPT_FILE = path.join(process.cwd(), 'QUICK_CHECK_PROMPT.txt');
let quickCheckPrompt = null;

async function loadQuickCheckPrompt() {
  if (!quickCheckPrompt) {
    try {
      quickCheckPrompt = await fs.readFile(PROMPT_FILE, 'utf-8');
      console.log('✅ Quick Check prompt loaded successfully');
    } catch (error) {
      console.error('❌ Error loading Quick Check prompt:', error.message);
      quickCheckPrompt = 'You are a compassionate mental health assistant conducting a brief check-in.';
    }
  }
  return quickCheckPrompt;
}

// JSON Schema for structured output
const quickCheckSchema = {
  type: "object",
  properties: {
    transcript: {
      type: "array",
      items: {
        type: "object",
        properties: {
          q: { type: "string" },
          a: { type: "string" }
        },
        required: ["q", "a"]
      }
    },
    summary: { type: "string" },
    risk_level: { 
      type: "string",
      enum: ["low", "moderate", "high"]
    },
    suggested_next_steps: {
      type: "array",
      items: { type: "string" }
    },
    resources: {
      type: "array",
      items: { type: "string" }
    },
    meta: {
      type: "object",
      properties: {
        approx_questions_asked: { type: "number" },
        readiness_score: { type: "number" }
      }
    }
  },
  required: ["transcript", "summary", "risk_level", "suggested_next_steps", "resources", "meta"]
};

/**
 * POST /api/v1/quick-check/start
 * Start a new Quick Check session
 */
export const startQuickCheck = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await loadQuickCheckPrompt();

    // Return the first question
    const firstQuestion = "Thanks for checking in. How have you been feeling lately—mood, energy, or stress?";

    res.json({
      sessionId: Date.now().toString(),
      question: firstQuestion,
      questionNumber: 1
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/quick-check/answer
 * Process user answer and get next question or final result
 */
export const processAnswer = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId, answer, conversationHistory } = req.body;

    if (!answer || !conversationHistory) {
      return res.status(400).json({ error: 'Missing required fields: answer, conversationHistory' });
    }

    await loadQuickCheckPrompt();

    // Check if AI is configured
    if (!isAIConfigured()) {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Quick Check requires AI configuration. Please contact support.'
      });
    }

    // Build conversation for AI
    const messages = [
      {
        role: 'system',
        content: quickCheckPrompt
      }
    ];

    // Add conversation history
    conversationHistory.forEach(turn => {
      messages.push({ role: 'assistant', content: turn.question });
      messages.push({ role: 'user', content: turn.answer });
    });

    // Check if we should end the session (after ~10 questions or if user indicates completion)
    const shouldEnd = conversationHistory.length >= 9 || 
                      answer.toLowerCase().includes('no, that\'s all') ||
                      answer.toLowerCase().includes('nothing else');

    if (shouldEnd) {
      // Get final structured output
      messages.push({
        role: 'user',
        content: 'Please provide the final assessment in JSON format as specified.'
      });

      try {
        const result = await getStructuredOutput(messages, quickCheckSchema, {
          temperature: 0.7,
          max_tokens: 1500
        });

        // Update user's last activity
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          await user.updateStreak();
        }

        res.json({
          completed: true,
          result
        });

      } catch (error) {
        console.error('❌ Structured output error:', error.message);
        
        // Fallback: get text summary
        const fallbackResult = await getChatCompletion(messages, {
          temperature: 0.7,
          max_tokens: 1000
        });

        res.json({
          completed: true,
          result: {
            summary: fallbackResult,
            risk_level: 'moderate',
            suggested_next_steps: [
              'Consider talking to a counselor',
              'Practice self-care activities',
              'Reach out to trusted friends or family'
            ],
            resources: [
              'KIRAN Mental Health Helpline: 1800-599-0019',
              'Vandrevala Foundation: 9999 666 555',
              'Campus Counseling Center'
            ],
            meta: {
              approx_questions_asked: conversationHistory.length,
              readiness_score: 5
            }
          }
        });
      }

    } else {
      // Get next question
      messages.push({
        role: 'user',
        content: 'Based on my answer, what is your next adaptive question? Provide only the question text, nothing else.'
      });

      const nextQuestion = await getChatCompletion(messages, {
        temperature: 0.8,
        max_tokens: 150
      });

      res.json({
        completed: false,
        question: nextQuestion.trim(),
        questionNumber: conversationHistory.length + 1
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/quick-check/history
 * Get user's Quick Check history (optional feature)
 */
export const getQuickCheckHistory = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Implement storage of Quick Check results if needed
    // For now, return empty array
    res.json({
      history: [],
      message: 'Quick Check history feature coming soon'
    });

  } catch (error) {
    next(error);
  }
};

export default {
  startQuickCheck,
  processAnswer,
  getQuickCheckHistory
};
