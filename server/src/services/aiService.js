/**
 * Unified AI Service
 * Abstraction layer for OpenAI and Gemini APIs
 * Automatically routes to the configured provider
 */

import OpenAI from 'openai';
import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;

// Default models
const DEFAULT_OPENAI_MODEL = 'gpt-4o';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

// Load system prompt
const PROMPT_FILE = path.join(process.cwd(), 'COUNSELOR_PROMPT.txt');
let systemPrompt = null;

/**
 * Load system prompt from file
 */
async function loadSystemPrompt() {
  if (!systemPrompt) {
    try {
      systemPrompt = await fs.readFile(PROMPT_FILE, 'utf-8');
      console.log('✅ System prompt loaded successfully');
    } catch (error) {
      console.error('❌ Error loading system prompt:', error.message);
      // Fallback to basic prompt
      systemPrompt = 'You are a supportive mental health assistant for college students. Provide empathetic, non-judgmental guidance.';
    }
  }
  return systemPrompt;
}

/**
 * Initialize AI clients
 */
let openaiClient = null;
let geminiClient = null;

function initializeOpenAI() {
  if (!openaiClient && OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
  }
  return openaiClient;
}

function initializeGemini() {
  if (!geminiClient && GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    geminiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    console.log('✅ Gemini client initialized');
  }
  return geminiClient;
}

/**
 * Get chat completion from OpenAI
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options (temperature, max_tokens, etc.)
 * @returns {Promise<string>} - AI response text
 */
async function getOpenAICompletion(messages, options = {}) {
  const client = initializeOpenAI();
  
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const model = AI_MODEL || DEFAULT_OPENAI_MODEL;
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800,
      presence_penalty: options.presence_penalty || 0.6,
      frequency_penalty: options.frequency_penalty || 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Get chat completion from Gemini
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options (temperature, etc.)
 * @returns {Promise<string>} - AI response text
 */
async function getGeminiCompletion(messages, options = {}) {
  const client = initializeGemini();
  
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = AI_MODEL || DEFAULT_GEMINI_MODEL;
  
  try {
    // Extract system instruction and user messages
    const systemInstruction = messages.find(m => m.role === 'system')?.content || await loadSystemPrompt();
    const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    // Convert messages to Gemini format
    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 800,
      },
    });

    return response.text;
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    throw error;
  }
}

/**
 * Get streaming chat completion from OpenAI
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {AsyncGenerator} - Stream of response chunks
 */
async function* getOpenAIStreamingCompletion(messages, options = {}) {
  const client = initializeOpenAI();
  
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const model = AI_MODEL || DEFAULT_OPENAI_MODEL;
  
  try {
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('❌ OpenAI streaming error:', error.message);
    throw error;
  }
}

/**
 * Get streaming chat completion from Gemini
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {AsyncGenerator} - Stream of response chunks
 */
async function* getGeminiStreamingCompletion(messages, options = {}) {
  const client = initializeGemini();
  
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = AI_MODEL || DEFAULT_GEMINI_MODEL;
  
  try {
    const systemInstruction = messages.find(m => m.role === 'system')?.content || await loadSystemPrompt();
    const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const stream = await client.models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 800,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('❌ Gemini streaming error:', error.message);
    throw error;
  }
}

/**
 * Get structured output from OpenAI
 * @param {Array} messages - Array of message objects
 * @param {Object} schema - JSON schema for structured output
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function getOpenAIStructuredOutput(messages, schema, options = {}) {
  const client = initializeOpenAI();
  
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const model = AI_MODEL || DEFAULT_OPENAI_MODEL;
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      response_format: { 
        type: "json_schema",
        json_schema: {
          name: schema.name || "response",
          schema: schema,
          strict: true
        }
      },
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI structured output error:', error.message);
    throw error;
  }
}

/**
 * Get structured output from Gemini
 * @param {Array} messages - Array of message objects
 * @param {Object} schema - JSON schema for structured output
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function getGeminiStructuredOutput(messages, schema, options = {}) {
  const client = initializeGemini();
  
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = AI_MODEL || DEFAULT_GEMINI_MODEL;
  
  try {
    const systemInstruction = messages.find(m => m.role === 'system')?.content || await loadSystemPrompt();
    const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 800,
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ Gemini structured output error:', error.message);
    throw error;
  }
}

/**
 * Main unified interface - Get chat completion
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - AI response text
 */
export async function getChatCompletion(messages, options = {}) {
  await loadSystemPrompt();
  
  const provider = options.provider || AI_PROVIDER;
  
  if (provider === 'gemini') {
    return await getGeminiCompletion(messages, options);
  } else if (provider === 'openai') {
    return await getOpenAICompletion(messages, options);
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Main unified interface - Get streaming chat completion
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {AsyncGenerator} - Stream of response chunks
 */
export async function* getStreamingChatCompletion(messages, options = {}) {
  await loadSystemPrompt();
  
  const provider = options.provider || AI_PROVIDER;
  
  if (provider === 'gemini') {
    yield* getGeminiStreamingCompletion(messages, options);
  } else if (provider === 'openai') {
    yield* getOpenAIStreamingCompletion(messages, options);
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Main unified interface - Get structured output
 * @param {Array} messages - Array of message objects
 * @param {Object} schema - JSON schema for structured output
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export async function getStructuredOutput(messages, schema, options = {}) {
  await loadSystemPrompt();
  
  const provider = options.provider || AI_PROVIDER;
  
  if (provider === 'gemini') {
    return await getGeminiStructuredOutput(messages, schema, options);
  } else if (provider === 'openai') {
    return await getOpenAIStructuredOutput(messages, schema, options);
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Check if AI is configured
 * @returns {boolean}
 */
export function isAIConfigured() {
  if (AI_PROVIDER === 'openai') {
    return OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';
  } else if (AI_PROVIDER === 'gemini') {
    return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  }
  return false;
}

/**
 * Get current AI provider info
 * @returns {Object}
 */
export function getAIProviderInfo() {
  return {
    provider: AI_PROVIDER,
    model: AI_MODEL || (AI_PROVIDER === 'openai' ? DEFAULT_OPENAI_MODEL : DEFAULT_GEMINI_MODEL),
    configured: isAIConfigured(),
  };
}

export default {
  getChatCompletion,
  getStreamingChatCompletion,
  getStructuredOutput,
  isAIConfigured,
  getAIProviderInfo,
};
