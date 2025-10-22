/**
 * Dedicated AI Service for Quick Check
 * Separate from main chat to avoid conflicts
 */

import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || (AI_PROVIDER === 'gemini' ? 'gemini-2.0-flash-exp' : 'gpt-4o-mini');

let geminiClient = null;
let openaiClient = null;

/**
 * Initialize Gemini client
 */
function initGemini() {
  if (!geminiClient && GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('✅ Quick Check Gemini initialized');
  }
  return geminiClient;
}

/**
 * Initialize OpenAI client
 */
function initOpenAI() {
  if (!openaiClient && OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log('✅ Quick Check OpenAI initialized');
  }
  return openaiClient;
}

/**
 * Check if AI is configured
 */
export function isQuickCheckAIReady() {
  if (AI_PROVIDER === 'openai') {
    return OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';
  } else if (AI_PROVIDER === 'gemini') {
    return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  }
  // Fallback: check if any key is available
  return !!(
    (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') ||
    (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here')
  );
}

/**
 * Get AI response for Quick Check
 * @param {string} systemPrompt - The Quick Check system prompt
 * @param {Array} conversationHistory - Array of {question, answer} objects
 * @param {string} instruction - What to ask AI (e.g., "generate first question" or "generate next question")
 * @returns {Promise<string>} - AI response
 */
export async function getQuickCheckResponse(systemPrompt, conversationHistory = [], instruction = '') {
  try {
    if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
      return await getGeminiResponse(systemPrompt, conversationHistory, instruction);
    } else if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
      return await getOpenAIResponse(systemPrompt, conversationHistory, instruction);
    } else {
      throw new Error('No AI provider configured for Quick Check');
    }
  } catch (error) {
    console.error('❌ Quick Check AI error:', error.message);
    throw error;
  }
}

/**
 * Get response from Gemini
 */
async function getGeminiResponse(systemPrompt, conversationHistory, instruction) {
  const client = initGemini();
  if (!client) throw new Error('Gemini not initialized');

  try {
    // Build conversation as contents array
    const contents = [];
    
    // Add conversation history
    conversationHistory.forEach(turn => {
      contents.push({
        role: 'model',
        parts: [{ text: turn.question }]
      });
      contents.push({
        role: 'user',
        parts: [{ text: turn.answer }]
      });
    });
    
    // Add current instruction
    contents.push({
      role: 'user',
      parts: [{ text: instruction }]
    });

    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        maxOutputTokens: 200
      }
    });
    
    const text = response.text;
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    
    return text.trim();
  } catch (error) {
    console.error('❌ Gemini Quick Check error:', error.message);
    throw error;
  }
}

/**
 * Get response from OpenAI
 */
async function getOpenAIResponse(systemPrompt, conversationHistory, instruction) {
  const client = initOpenAI();
  if (!client) throw new Error('OpenAI not initialized');

  try {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    conversationHistory.forEach(turn => {
      messages.push({ role: 'assistant', content: turn.question });
      messages.push({ role: 'user', content: turn.answer });
    });

    // Add instruction
    messages.push({ role: 'user', content: instruction });

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 200
    });

    const text = completion.choices[0]?.message?.content;
    
    if (!text) {
      throw new Error('Empty response from OpenAI');
    }
    
    return text.trim();
  } catch (error) {
    console.error('❌ OpenAI Quick Check error:', error.message);
    throw error;
  }
}

/**
 * Get structured final assessment
 */
export async function getQuickCheckFinalAssessment(systemPrompt, conversationHistory) {
  const instruction = `Based on all the answers above, provide a final assessment in the following JSON format:
{
  "transcript": [{"question": "...", "answer": "..."}],
  "summary": "Brief 2-3 sentence summary of user's mental state",
  "risk_level": "low" or "moderate" or "high",
  "suggested_next_steps": ["action 1", "action 2", "action 3"],
  "resources": ["KIRAN: 1800-599-0019", "Vandrevala: 9999 666 555"],
  "meta": {
    "approx_questions_asked": ${conversationHistory.length},
    "readiness_score": 1-10
  }
}

Provide ONLY the JSON, no other text.`;

  try {
    const response = await getQuickCheckResponse(systemPrompt, conversationHistory, instruction);
    
    // Try to parse JSON
    try {
      // Remove markdown code blocks if present
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON, returning fallback');
      // Return fallback structure
      return {
        transcript: conversationHistory,
        summary: response,
        risk_level: 'moderate',
        suggested_next_steps: [
          'Consider talking to a counselor',
          'Practice self-care activities',
          'Reach out to trusted friends or family'
        ],
        resources: [
          'KIRAN Mental Health Helpline: 1800-599-0019',
          'Vandrevala Foundation: 9999 666 555'
        ],
        meta: {
          approx_questions_asked: conversationHistory.length,
          readiness_score: 5
        }
      };
    }
  } catch (error) {
    console.error('❌ Final assessment error:', error.message);
    throw error;
  }
}

export default {
  isQuickCheckAIReady,
  getQuickCheckResponse,
  getQuickCheckFinalAssessment
};
