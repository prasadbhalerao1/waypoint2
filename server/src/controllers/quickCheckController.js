/**
 * Quick Check Controller
 * AI-powered adaptive mental health check-in with structured output
 */

import { getAuth } from '@clerk/express';
import { isQuickCheckAIReady, getQuickCheckResponse, getQuickCheckFinalAssessment } from '../services/quickCheckAI.js';
import User from '../models/User.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Quick Check prompt - go up from controllers to server root
const PROMPT_FILE = path.join(__dirname, '..', '..', 'QUICK_CHECK_PROMPT.txt');
let quickCheckPrompt = null;

async function loadQuickCheckPrompt() {
  if (!quickCheckPrompt) {
    try {
      quickCheckPrompt = await fs.readFile(PROMPT_FILE, 'utf-8');
      console.log('✅ Quick Check prompt loaded successfully');
    } catch (error) {
      console.error('❌ Error loading Quick Check prompt:', error.message);
      console.error('Looking for file at:', PROMPT_FILE);
      // Fallback prompt
      quickCheckPrompt = `You are a compassionate mental health assistant conducting a brief adaptive "Quick Check" (about 10 short questions).

Your goals:
1. Quickly learn how the user is doing (mood, sleep, appetite, energy, stress, supports, coping)
2. Adapt each next question based on the user's previous answers
3. Identify urgent safety concerns and escalate appropriately
4. Provide a clear summary and safe next steps

Keep each question short (one sentence). Ask follow-up questions based on their answers.
Be warm, respectful, and use simple language.

When you've asked about 10 questions, provide a final assessment in JSON format with:
- transcript (all Q&A pairs)
- summary (1-3 sentences)
- risk_level (low/moderate/high)
- suggested_next_steps (array of actions)
- resources (array of helplines/resources)
- meta (questions_asked, readiness_score)`;
    }
  }
  return quickCheckPrompt;
}

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

    // Check if AI is configured
    if (!isQuickCheckAIReady()) {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Quick Check requires AI configuration. Please contact support.'
      });
    }

    // Use AI to generate the first question
    const instruction = 'Start the Quick Check session. Provide only the first question, nothing else. Keep it short and conversational.';
    
    const firstQuestion = await getQuickCheckResponse(quickCheckPrompt, [], instruction);

    res.json({
      sessionId: Date.now().toString(),
      question: firstQuestion,
      questionNumber: 1
    });

  } catch (error) {
    console.error('❌ Quick Check start error:', error.message);
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
    if (!isQuickCheckAIReady()) {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Quick Check requires AI configuration. Please contact support.'
      });
    }

    // Check if we should end the session (after ~10 questions)
    const shouldEnd = conversationHistory.length >= 10;

    if (shouldEnd) {
      // Get final assessment
      try {
        const result = await getQuickCheckFinalAssessment(quickCheckPrompt, conversationHistory);

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
        console.error('❌ Final assessment error:', error.message);
        
        // Fallback result
        res.json({
          completed: true,
          result: {
            transcript: conversationHistory,
            summary: 'Thank you for completing the Quick Check. Based on your responses, it seems you could benefit from additional support.',
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
      const instruction = `Based on the user's previous answer, generate your next adaptive question. 
      
Provide ONLY the question text, nothing else. Keep it short (one sentence) and conversational.`;

      try {
        const nextQuestion = await getQuickCheckResponse(quickCheckPrompt, conversationHistory, instruction);

        res.json({
          completed: false,
          question: nextQuestion,
          questionNumber: conversationHistory.length + 1
        });
      } catch (aiError) {
        console.error('❌ AI error generating next question:', aiError.message);
        
        // Fallback to a generic question
        const fallbackQuestions = [
          "How has your sleep been lately?",
          "What activities help you feel better when you're stressed?",
          "On a scale of 1-10, how would you rate your overall wellbeing this week?",
          "Is there anything specific that's been worrying you?",
          "How connected do you feel to friends or family right now?",
          "What's one thing you wish you could change about how you're feeling?",
          "Have you been able to do things you normally enjoy?",
          "How has your appetite been recently?"
        ];
        
        const questionIndex = Math.min(conversationHistory.length, fallbackQuestions.length - 1);
        
        res.json({
          completed: false,
          question: fallbackQuestions[questionIndex],
          questionNumber: conversationHistory.length + 1
        });
      }
    }

  } catch (error) {
    console.error('❌ Quick Check process error:', error.message);
    console.error('Error stack:', error.stack);
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
